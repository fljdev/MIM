/**
 * One-time script to insert new venues into the accessible_venues table.
 * 
 * This script:
 * 1. Reads a hardcoded list of venues (venue_name, address, venue_type, latitude, longitude)
 * 2. For each venue, checks if a row with the same venue_name already exists
 * 3. If duplicate, skips; if new, inserts with:
 *    - accessibility_level = 'unknown'
 *    - source = 'manual'
 *    - wheelchair_entrance = null
 *    - Defaults: currently_operating = TRUE, verified_by = 'unverified'
 * 4. Logs how many were inserted and how many were skipped as duplicates
 * 
 * Usage: node backend/scripts/insert_new_venues.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

// Database connection - use DATABASE_URL from .env
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('   Please ensure DATABASE_URL is set in backend/.env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Venues to insert: venue_name, address, venue_type, latitude, longitude
const VENUES = [
  ["Achara", "Aston Quay Dublin 2", "restaurant", 53.346, -6.259],
  ["Bar Italia", "Ormond Quay Dublin 1", "restaurant", 53.347, -6.267],
  ["Sister 7", "Queen Street Dublin 7", "restaurant", 53.349, -6.278],
  ["The Boxty House", "Temple Bar Dublin 2", "restaurant", 53.345, -6.263],
  ["The Church", "Mary Street Dublin 1", "pub", 53.350, -6.270],
  ["Red Torch Ginger", "South Great George's Street Dublin 2", "restaurant", 53.342, -6.262],
  ["Murphy's Bistro Cafe", "Central Dublin", "cafe", 53.344, -6.260],
  ["1900", "Dame Street Dublin 2", "restaurant", 53.344, -6.265],
  ["The Marker Hotel", "Grand Canal Square Dublin 2", "restaurant", 53.341, -6.240],
  ["Harbour Master Bar & Restaurant", "IFSC Dublin 1", "restaurant", 53.349, -6.245],
  ["Ciss Maddens", "Drury Street Dublin 2", "pub", 53.342, -6.261],
  ["Dudley's", "Thomas Street Dublin 8", "pub", 53.343, -6.278],
  ["Doheny & Nesbitt", "Baggot Street Dublin 2", "pub", 53.338, -6.245],
  ["Kennedy's", "Westland Row Dublin 2", "pub", 53.343, -6.250],
  ["O'Connor's", "Mount Street Dublin 2", "pub", 53.339, -6.248],
  ["BrewDog Outpost Dublin", "Central Dublin", "pub", 53.347, -6.260],
  ["Conrad Dublin", "Earlsfort Terrace Dublin 2", "restaurant", 53.336, -6.258],
  ["Hilton Dublin Airport", "Near Airport", "restaurant", 53.428, -6.246],
  ["EPIC The Irish Emigration Museum", "Custom House Quay Dublin 1", "museum", 53.349, -6.246],
  ["Croke Park Stadium Tour & GAA Museum", "Jones Road Dublin 3", "museum", 53.360, -6.250],
  ["St Patrick's Cathedral", "Patrick's Close Dublin 8", "attraction", 53.339, -6.271],
  ["Dublin Castle", "Dame Street Dublin 2", "attraction", 53.343, -6.267],
  ["Phoenix Park", "Parkgate Street Dublin 8", "park", 53.353, -6.300],
  ["Dublin Zoo", "Phoenix Park Dublin 8", "attraction", 53.359, -6.303],
  ["Malahide Castle", "Malahide Co Dublin", "attraction", 53.450, -6.150],
  ["Trinity College", "College Green Dublin 2", "attraction", 53.345, -6.259],
  ["National Museum of Ireland", "Kildare Street Dublin 2", "museum", 53.340, -6.256],
  ["3Arena", "North Wall Quay Dublin 1", "venue", 53.347, -6.228],
  ["RDS Simmonscourt", "Ballsbridge Dublin 4", "venue", 53.332, -6.230],
  ["ODEON Point Square", "North Wall Quay Dublin 1", "cinema", 53.348, -6.230],
  ["ODEON Charlestown", "Charlestown Dublin 11", "cinema", 53.420, -6.300],
  ["The Dropping Well", "Milltown Dublin", "pub", 53.312, -6.240],
  ["Manifestino", "Central Dublin", "cafe", 53.344, -6.260],
  ["Honest to Goodness", "South William Street Dublin 2", "cafe", 53.342, -6.261],
  ["Pho Viet", "Parnell Street Dublin 1", "restaurant", 53.352, -6.265],
  ["Pitt Bros", "South Great George's Street Dublin 2", "restaurant", 53.342, -6.262],
  ["Neon", "Camden Street Dublin 2", "restaurant", 53.337, -6.265],
  ["The Waterloo", "Baggot Street Dublin 2", "pub", 53.338, -6.245],
  ["Henry Grattan", "Baggot Street Dublin 2", "pub", 53.338, -6.245],
  ["Murray's Bar and Grill", "O'Connell Street Dublin 1", "restaurant", 53.350, -6.260],
  ["Thunder Road Cafe", "Temple Bar Dublin 2", "cafe", 53.345, -6.263]
];

// Helper function to mask connection string for logging
function maskConnectionString(connStr) {
  if (!connStr) return 'local fallback';
  return connStr.replace(/\/\/[^:]+:[^@]+@/, '//****:****@');
}

async function insertNewVenues() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting new venues insertion...');
    console.log(`📡 Database: ${maskConnectionString(process.env.DATABASE_URL)}`);
    
    // Check if accessible_venues table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'accessible_venues'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ accessible_venues table does not exist. Please run migration 007 first.');
      console.error('   Run: node backend/database/migrations/run_all_migrations.js');
      process.exit(1);
    }
    
    console.log(`📊 Found ${VENUES.length} venues to process`);
    
    // Process each venue
    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const venue of VENUES) {
      const [venueName, address, venueType, latitude, longitude] = venue;
      
      try {
        // Check if venue_name already exists
        const checkQuery = `
          SELECT id FROM accessible_venues 
          WHERE venue_name = $1
          LIMIT 1
        `;
        const checkResult = await client.query(checkQuery, [venueName]);
        
        if (checkResult.rows.length > 0) {
          // Venue already exists, skip
          skippedCount++;
          continue;
        }
        
        // Insert new venue with required defaults
        const insertQuery = `
          INSERT INTO accessible_venues (
            venue_name,
            address,
            venue_type,
            latitude,
            longitude,
            accessibility_level,
            data_source,
            wheelchair_entrance,
            currently_operating,
            verified_by,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `;
        
        const insertResult = await client.query(insertQuery, [
          venueName,
          address,
          venueType,
          latitude,
          longitude,
          'unknown',           // accessibility_level
          'manual',            // source
          null,                // wheelchair_entrance
          true,                // currently_operating
          'unverified'         // verified_by
        ]);
        
        if (insertResult.rows.length > 0) {
          insertedCount++;
          if (insertedCount % 5 === 0) {
            console.log(`  Inserted ${insertedCount} venues...`);
          }
        } else {
          // Should not happen with RETURNING, but just in case
          errorCount++;
          console.error(`❌ No rows returned for insertion of "${venueName}"`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing venue "${venueName}":`, error.message);
        errorCount++;
      }
    }
    
    // Log summary
    console.log('\n📋 Insertion Summary:');
    console.log(`✅ Successfully inserted: ${insertedCount} new venues`);
    console.log(`⏭️ Skipped (duplicates): ${skippedCount} venues`);
    console.log(`❌ Errors: ${errorCount} venues`);
    
    // Verify final count
    const countResult = await client.query('SELECT COUNT(*) as total FROM accessible_venues');
    const totalInDb = parseInt(countResult.rows[0].total);
    
    console.log(`\n📊 Database after insertion:`);
    console.log(`   Total venues in database: ${totalInDb}`);
    
    // Count by venue_type for new venues
    const typeQuery = `
      SELECT venue_type, COUNT(*) as count 
      FROM accessible_venues 
      WHERE data_source = 'manual'
      GROUP BY venue_type 
      ORDER BY count DESC
    `;
    
    const typeResult = await client.query(typeQuery);
    
    console.log('\n   Newly inserted venues by type:');
    if (typeResult.rows.length > 0) {
      typeResult.rows.forEach(row => {
        console.log(`     ${row.venue_type || 'NULL'}: ${row.count} venues`);
      });
    } else {
      console.log('     No newly inserted venues found (maybe all were duplicates)');
    }
    
    console.log('\n🎉 Script completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the script
insertNewVenues().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  console.error('   Ensure DATABASE_URL is set correctly in .env file');
  console.error('   And accessible_venues table exists (run migration first)');
  process.exit(1);
});