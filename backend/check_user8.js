const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://john:Sixties1-Stegosaur1-Scraggly8-Monorail8@localhost:5432/mim',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function checkUserData() {
  const client = await pool.connect();
  try {
    console.log('Checking database for user 8...\n');
    
    // 1. Check user 8's meetup participants
    const participantsResult = await client.query(
      `SELECT 
        id,
        user_id,
        meetup_id,
        distance_km,
        carbon_emitted,
        transit_mode,
        location_lat,
        location_lng,
        location_name,
        participant_name
      FROM meetup_participants 
      WHERE user_id = 8`
    );
    
    const participants = participantsResult.rows;
    console.log(`User 8 has ${participants.length} meetup participants:\n`);
    
    participants.forEach((row, index) => {
      console.log(`Participant ${index + 1}:`);
      console.log(`  - Meetup ID: ${row.meetup_id}`);
      console.log(`  - Distance: ${row.distance_km} km`);
      console.log(`  - Carbon: ${row.carbon_emitted} kg CO₂`);
      console.log(`  - Mode: ${row.transit_mode}`);
      console.log(`  - Location: ${row.location_name} (${row.location_lat}, ${row.location_lng})`);
      console.log(`  - Participant Name: ${row.participant_name}\n`);
    });

    // 2. Check meetup details for these participants
    if (participants.length > 0) {
      const meetupIds = participants.map(row => row.meetup_id);
      const meetupsResult = await client.query(
        `SELECT 
          id,
          meetup_code,
          meetup_title,
          meetup_vibe,
          status,
          calculated_midpoint_lat,
          calculated_midpoint_lng,
          confirmed_venue_id,
          confirmed_venue_name
        FROM meetups 
        WHERE id = ANY($1)`,
        [meetupIds]
      );
      
      console.log(`\nMeetup details for user 8's participants:\n`);
      meetupsResult.rows.forEach((row, index) => {
        console.log(`Meetup ${index + 1}:`);
        console.log(`  - Code: ${row.meetup_code}`);
        console.log(`  - Title: ${row.meetup_title}`);
        console.log(`  - Status: ${row.status}`);
        console.log(`  - Calculated Midpoint: (${row.calculated_midpoint_lat}, ${row.calculated_midpoint_lng})`);
        console.log(`  - Confirmed Venue: ${row.confirmed_venue_name || 'None'} (ID: ${row.confirmed_venue_id || 'None'})\n`);
      });

      // 3. Check if there are any venues for these meetups
      const venueIds = meetupsResult.rows
        .filter(row => row.confirmed_venue_id)
        .map(row => row.confirmed_venue_id);
      
      if (venueIds.length > 0) {
        const venuesResult = await client.query(
          `SELECT id, name, latitude, longitude 
           FROM venues 
           WHERE id = ANY($1)`,
          [venueIds]
        );
        
        console.log(`\nVenue details:\n`);
        venuesResult.rows.forEach((row, index) => {
          console.log(`Venue ${index + 1}:`);
          console.log(`  - Name: ${row.name}`);
          console.log(`  - Location: (${row.latitude}, ${row.longitude})\n`);
        });
      } else {
        console.log('\nNo confirmed venues found for these meetups.\n');
      }

      // 4. Check if we can calculate distances for any participants
      console.log('\nCalculating distances that should be computed:\n');
      let calculableCount = 0;
      
      for (const participant of participants) {
        const meetup = meetupsResult.rows.find(m => m.id === participant.meetup_id);
        
        if (participant.location_lat && participant.location_lng) {
          if (meetup?.calculated_midpoint_lat && meetup?.calculated_midpoint_lng) {
            calculableCount++;
            console.log(`Participant ${participant.id} (Meetup ${meetup.meetup_code}):`);
            console.log(`  - Has location: (${participant.location_lat}, ${participant.location_lng})`);
            console.log(`  - Meetup has midpoint: (${meetup.calculated_midpoint_lat}, ${meetup.calculated_midpoint_lng})`);
            console.log(`  - Current distance: ${participant.distance_km} km`);
            console.log(`  - Current carbon: ${participant.carbon_emitted} kg CO₂\n`);
          } else if (meetup?.confirmed_venue_id) {
            calculableCount++;
            console.log(`Participant ${participant.id} (Meetup ${meetup.meetup_code}):`);
            console.log(`  - Has location: (${participant.location_lat}, ${participant.location_lng})`);
            console.log(`  - Meetup has confirmed venue ID: ${meetup.confirmed_venue_id}`);
            console.log(`  - Current distance: ${participant.distance_km} km`);
            console.log(`  - Current carbon: ${participant.carbon_emitted} kg CO₂\n`);
          }
        }
      }
      
      console.log(`\nTotal participants with calculable distances: ${calculableCount} of ${participants.length}`);
    }

    // 5. Check total counts for comparison
    const totalParticipants = await client.query(
      'SELECT COUNT(*) as count FROM meetup_participants'
    );
    const totalMeetups = await client.query(
      'SELECT COUNT(*) as count FROM meetups'
    );
    const totalUsers = await client.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM meetup_participants'
    );
    
    console.log('\nDatabase Summary:');
    console.log(`  - Total participants: ${totalParticipants.rows[0].count}`);
    console.log(`  - Total meetups: ${totalMeetups.rows[0].count}`);
    console.log(`  - Total users: ${totalUsers.rows[0].count}`);

  } catch (err) {
    console.error('Error checking user data:', err);
    console.error(err.stack);
  } finally {
    client.release();
    await pool.end();
    console.log('\nDatabase connection closed.');
  }
}

checkUserData().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
