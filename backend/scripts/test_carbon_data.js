const { Pool } = require('pg');

// Database configuration - use the same as server.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://john:Sixties1-Stegosaur1-Scraggly8-Monorail8@localhost:5432/mim',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function testCarbonData() {
  const client = await pool.connect();
  
  try {
    console.log('Testing carbon data in database...\n');

    // 1. Check total participants
    const totalParticipants = await client.query(
      'SELECT COUNT(*) as count FROM meetup_participants'
    );
    console.log(`Total participants: ${totalParticipants.rows[0].count}`);

    // 2. Check participants with carbon data
    const withCarbon = await client.query(
      'SELECT COUNT(*) as count FROM meetup_participants WHERE carbon_emitted > 0'
    );
    console.log(`Participants with carbon data: ${withCarbon.rows[0].count}`);

    // 3. Check participants without carbon data
    const withoutCarbon = await client.query(
      'SELECT COUNT(*) as count FROM meetup_participants WHERE carbon_emitted = 0 OR carbon_emitted IS NULL'
    );
    console.log(`Participants without carbon data: ${withoutCarbon.rows[0].count}`);

    // 4. Check meetups with calculated midpoint
    const meetupsWithMidpoint = await client.query(
      'SELECT COUNT(*) as count FROM meetups WHERE calculated_midpoint_lat IS NOT NULL AND calculated_midpoint_lng IS NOT NULL'
    );
    console.log(`Meetups with calculated midpoint: ${meetupsWithMidpoint.rows[0].count}`);

    // 5. Check participants that have location but no carbon and meetup has midpoint
    const participantsToUpdate = await client.query(`
      SELECT COUNT(*) as count
      FROM meetup_participants mp
      INNER JOIN meetups m ON mp.meetup_id = m.id
      WHERE (mp.distance_km = 0 OR mp.distance_km IS NULL)
        AND (mp.carbon_emitted = 0 OR mp.carbon_emitted IS NULL)
        AND mp.location_lat IS NOT NULL
        AND mp.location_lng IS NOT NULL
        AND m.calculated_midpoint_lat IS NOT NULL
        AND m.calculated_midpoint_lng IS NOT NULL
    `);
    console.log(`Participants that should have carbon data (based on script criteria): ${participantsToUpdate.rows[0].count}`);

    // 6. Show sample of existing carbon data
    console.log('\nSample of existing carbon data (if any):');
    const sampleData = await client.query(`
      SELECT 
        mp.id,
        mp.distance_km,
        mp.carbon_emitted,
        mp.transit_mode,
        m.meetup_code
      FROM meetup_participants mp
      INNER JOIN meetups m ON mp.meetup_id = m.id
      WHERE mp.carbon_emitted > 0
      LIMIT 5
    `);
    
    if (sampleData.rows.length > 0) {
      sampleData.rows.forEach(row => {
        console.log(`  Participant ${row.id} (meetup ${row.meetup_code}): ${row.distance_km} km, ${row.carbon_emitted} kg CO₂, mode: ${row.transit_mode}`);
      });
    } else {
      console.log('  No carbon data found.');
    }

    // 7. Check if there are any meetups at all
    const totalMeetups = await client.query('SELECT COUNT(*) as count FROM meetups');
    console.log(`\nTotal meetups: ${totalMeetups.rows[0].count}`);

    // 8. Check if there are any venues (if table exists)
    try {
      const venuesCount = await client.query('SELECT COUNT(*) as count FROM venues');
      console.log(`Total venues: ${venuesCount.rows[0].count}`);
    } catch (e) {
      console.log('Venues table does not exist or error:', e.message);
    }

  } catch (error) {
    console.error('Error testing carbon data:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('\nDatabase connection closed.');
  }
}

testCarbonData().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
