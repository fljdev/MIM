/**
 * Script to populate carbon emissions data for existing meetup participants
 * 
 * This script calculates distance and carbon emissions for all meetup participants
 * who don't have carbon data yet (distance_km = 0 and carbon_emitted = 0).
 * 
 * Usage: node populate_carbon_data.js
 */

const { Pool } = require('pg');
const { calculateDistance } = require('../utils/mockDistanceCalculator');
const { calculateCarbonEmission } = require('../utils/carbonCalculator');

// Database configuration - use the same as server.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://john:Sixties1-Stegosaur1-Scraggly8-Monorail8@localhost:5432/mim',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function populateCarbonData() {
  const client = await pool.connect();
  
  try {
    console.log('Starting carbon data population...');
    
    // Get all meetup participants that need carbon data
    // Use the meetup's calculated midpoint as the destination
    const query = `
      SELECT 
        mp.id,
        mp.location_lat,
        mp.location_lng,
        mp.transit_mode,
        mp.meetup_id,
        m.calculated_midpoint_lat as venue_lat,
        m.calculated_midpoint_lng as venue_lng
      FROM meetup_participants mp
      INNER JOIN meetups m ON mp.meetup_id = m.id
      WHERE (mp.distance_km = 0 OR mp.distance_km IS NULL)
        AND (mp.carbon_emitted = 0 OR mp.carbon_emitted IS NULL)
        AND mp.location_lat IS NOT NULL
        AND mp.location_lng IS NOT NULL
        AND m.calculated_midpoint_lat IS NOT NULL
        AND m.calculated_midpoint_lng IS NOT NULL
      ORDER BY mp.id
    `;
    
    const result = await client.query(query);
    const participants = result.rows;
    
    console.log(`Found ${participants.length} participants needing carbon data...`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // Process each participant
    for (const participant of participants) {
      try {
        // Calculate distance using the same formula as in the app
        const distanceKm = calculateDistance(
          participant.location_lat,
          participant.location_lng,
          participant.venue_lat,
          participant.venue_lng
        );
        
        // Calculate carbon emissions
        const carbonEmitted = calculateCarbonEmission(distanceKm, participant.transit_mode);
        
        // Update the participant record
        const updateQuery = `
          UPDATE meetup_participants 
          SET distance_km = $1, 
              carbon_emitted = $2,
              updated_at = NOW()
          WHERE id = $3
        `;
        
        await client.query(updateQuery, [
          Math.round(distanceKm * 100) / 100, // Round to 2 decimal places
          Math.round(carbonEmitted * 10000) / 10000, // Round to 4 decimal places
          participant.id
        ]);
        
        updatedCount++;
        
        if (updatedCount % 100 === 0) {
          console.log(`Updated ${updatedCount} participants...`);
        }
        
      } catch (error) {
        console.error(`Error processing participant ${participant.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\nCarbon data population completed!`);
    console.log(`Successfully updated: ${updatedCount} participants`);
    console.log(`Errors: ${errorCount} participants`);
    
    // Log some sample data for verification
    if (updatedCount > 0) {
      const sampleQuery = `
        SELECT 
          COUNT(*) as total_participants,
          SUM(distance_km) as total_distance,
          SUM(carbon_emitted) as total_carbon,
          AVG(distance_km) as avg_distance,
          AVG(carbon_emitted) as avg_carbon
        FROM meetup_participants 
        WHERE carbon_emitted > 0
      `;
      
      const sampleResult = await client.query(sampleQuery);
      console.log('\nCarbon Data Summary:');
      console.log(`Total participants with carbon data: ${sampleResult.rows[0].total_participants}`);
      console.log(`Total distance: ${Math.round(sampleResult.rows[0].total_distance * 100) / 100} km`);
      console.log(`Total carbon: ${Math.round(sampleResult.rows[0].total_carbon * 10000) / 10000} kg CO₂`);
      console.log(`Average distance: ${Math.round(sampleResult.rows[0].avg_distance * 100) / 100} km`);
      console.log(`Average carbon: ${Math.round(sampleResult.rows[0].avg_carbon * 10000) / 10000} kg CO₂`);
    }
    
  } catch (error) {
    console.error('Error in carbon data population:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run the script
populateCarbonData().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
