const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://john:REDACTED@localhost:5432/mim'
});

async function checkAllMeetups() {
  const client = await pool.connect();
  
  try {
    console.log('Checking all meetups in database...');
    
    // Check all meetups
    const meetupResult = await client.query(
      'SELECT id, meetup_code, status, created_at FROM meetups ORDER BY created_at DESC'
    );
    
    console.log(`Total meetups: ${meetupResult.rows.length}`);
    
    if (meetupResult.rows.length === 0) {
      console.log('No meetups found in database');
    } else {
      meetupResult.rows.forEach((meetup, index) => {
        console.log(`\nMeetup ${index + 1}:`);
        console.log(`  Code: ${meetup.meetup_code}`);
        console.log(`  Status: ${meetup.status}`);
        console.log(`  Created: ${meetup.created_at}`);
        
        // Check participants for this meetup
        client.query(
          'SELECT id, user_id, participant_name FROM meetup_participants WHERE meetup_id = $1',
          [meetup.id]
        ).then(participantsResult => {
          console.log(`  Participants: ${participantsResult.rows.length}`);
          participantsResult.rows.forEach(participant => {
            console.log(`    - ${participant.participant_name} (user_id: ${participant.user_id})`);
          });
        }).catch(err => {
          console.log(`  Error fetching participants: ${err.message}`);
        });
      });
    }
    
    // Also check users count
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`\nTotal users: ${usersResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    setTimeout(() => {
      client.release();
      pool.end();
    }, 1000); // Give time for async participant queries
  }
}

checkAllMeetups();
