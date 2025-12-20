/**
 * Seed script to create test data for carbon emissions testing
 * Creates: user, meetup, participant with location data
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://john:Sixties1-Stegosaur1-Scraggly8-Monorail8@localhost:5432/mim',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function seedTestData() {
  const client = await pool.connect();
  
  try {
    console.log('Starting carbon test data seeding...\n');
    
    // Begin transaction
    await client.query('BEGIN');

    // 1. Create a test user (id=8) if not exists
    console.log('Creating test user (id=8)...');
    try {
      await client.query(`
        INSERT INTO users (id, name, email, created_at)
        VALUES (8, 'Carbon Test User', 'carbon.test@example.com', NOW())
        ON CONFLICT (id) DO NOTHING
      `);
    } catch (error) {
      // If users table doesn't exist or has different structure, skip
      console.log('Note: Could not insert into users table:', error.message);
    }

    // 2. Create a test meetup with calculated midpoint
    console.log('Creating test meetup...');
    const meetupResult = await client.query(`
      INSERT INTO meetups (
        meetup_code,
        meetup_title,
        meetup_vibe,
        status,
        created_by,
        calculated_midpoint_lat,
        calculated_midpoint_lng,
        created_at
      )
      VALUES (
        'C-TEST-001',
        'Carbon Emission Test Meetup',
        'Test vibe for carbon calculations',
        'active',
        8,
        53.349805,  -- Dublin city center latitude
        -6.26031,   -- Dublin city center longitude
        NOW()
      )
      RETURNING id, meetup_code
    `);
    
    const meetupId = meetupResult.rows[0].id;
    const meetupCode = meetupResult.rows[0].meetup_code;
    console.log(`Created meetup: ${meetupCode} (ID: ${meetupId})`);

    // 3. Create a participant for this meetup (user 8) with location data
    console.log('Creating test participant for user 8...');
    
    // Different locations around Dublin for testing
    const testLocations = [
      { name: 'Dublin Airport', lat: 53.426448, lng: -6.24991, distance: 9.5 },
      { name: 'Dun Laoghaire', lat: 53.2939, lng: -6.1359, distance: 12.3 },
      { name: 'Swords', lat: 53.4597, lng: -6.2181, distance: 11.2 }
    ];

    for (let i = 0; i < testLocations.length; i++) {
      const location = testLocations[i];
      const transitModes = ['driving', 'transit', 'cycling', 'walking'];
      const mode = transitModes[i % transitModes.length];
      
      await client.query(`
        INSERT INTO meetup_participants (
          meetup_id,
          user_id,
          participant_name,
          location_name,
          location_lat,
          location_lng,
          transit_mode,
          joined_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, NOW()
        )
      `, [
        meetupId,
        8,
        `Carbon Test Participant ${i + 1}`,
        location.name,
        location.lat,
        location.lng,
        mode
      ]);
      
      console.log(`  - Created participant ${i + 1}: ${location.name} (${mode})`);
    }

    // 4. Create additional test meetups for variety
    console.log('\nCreating additional test meetups...');
    
    const additionalMeetups = [
      {
        code: 'C-TEST-002',
        title: 'Carbon Test Meetup 2',
        midpoint_lat: 53.2809,  // South Dublin
        midpoint_lng: -6.2676,
        participants: 2
      },
      {
        code: 'C-TEST-003',
        title: 'Carbon Test Meetup 3',
        midpoint_lat: 53.3859,  // North Dublin
        midpoint_lng: -6.0621,
        participants: 1
      }
    ];

    for (const meetup of additionalMeetups) {
      const result = await client.query(`
        INSERT INTO meetups (
          meetup_code,
          meetup_title,
          meetup_vibe,
          status,
          created_by,
          calculated_midpoint_lat,
          calculated_midpoint_lng,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id
      `, [
        meetup.code,
        meetup.title,
        'Test vibe',
        'active',
        8,
        meetup.midpoint_lat,
        meetup.midpoint_lng
      ]);

      const newMeetupId = result.rows[0].id;
      
      // Add participants to this meetup
      for (let i = 0; i < meetup.participants; i++) {
        const latOffset = (Math.random() - 0.5) * 0.1;
        const lngOffset = (Math.random() - 0.5) * 0.1;
        const mode = ['driving', 'transit', 'cycling'][i % 3];
        
        await client.query(`
          INSERT INTO meetup_participants (
            meetup_id,
            user_id,
            participant_name,
            location_name,
            location_lat,
            location_lng,
            transit_mode,
            joined_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `, [
          newMeetupId,
          8,
          `Test Participant for ${meetup.code}`,
          `Test Location ${i + 1}`,
          meetup.midpoint_lat + latOffset,
          meetup.midpoint_lng + lngOffset,
          mode
        ]);
      }
      
      console.log(`  - Created meetup: ${meetup.code} with ${meetup.participants} participants`);
    }

    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n✅ Test data seeding completed successfully!');
    console.log('\nSummary:');
    console.log('  - Created user with ID: 8');
    console.log('  - Created 3 test meetups');
    console.log('  - Created multiple participants with location data');
    console.log('  - All participants have transit modes assigned');
    
    // Show what was created
    const meetupCount = await client.query('SELECT COUNT(*) FROM meetups');
    const participantCount = await client.query('SELECT COUNT(*) FROM meetup_participants WHERE user_id = 8');
    
    console.log(`\nDatabase now has:`);
    console.log(`  - ${meetupCount.rows[0].count} meetups`);
    console.log(`  - ${participantCount.rows[0].count} participants for user 8`);
    
    console.log('\nNext steps:');
    console.log('1. Run: cd backend && node scripts/populate_carbon_data.js');
    console.log('2. Test API: curl http://localhost:5000/api/carbon/user/8');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding test data:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run the seed function
seedTestData().catch(error => {
  console.error('Seed script failed:', error);
  process.exit(1);
});
