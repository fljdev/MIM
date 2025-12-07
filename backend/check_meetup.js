const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://john:Sixties1-Stegosaur1-Scraggly8-Monorail8@localhost:5432/mim'
});

async function checkMeetup() {
  const client = await pool.connect();
  
  try {
    console.log('Checking meetup with code MWCJPA...');
    
    // Check if meetup exists
    const meetupResult = await client.query(
      'SELECT id, meetup_code, status FROM meetups WHERE meetup_code = $1',
      ['MWCJPA']
    );
    
    if (meetupResult.rows.length === 0) {
      console.log('Meetup not found in database');
    } else {
      const meetup = meetupResult.rows[0];
      console.log('Meetup found:', meetup);
      
      // Check participants
      const participantsResult = await client.query(
        'SELECT id, user_id, participant_name FROM meetup_participants WHERE meetup_id = $1',
        [meetup.id]
      );
      
      console.log('Participants:', participantsResult.rows);
      
      // Check users table
      const usersResult = await client.query(
        'SELECT id, email, name FROM users LIMIT 5'
      );
      
      console.log('First 5 users:', usersResult.rows);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkMeetup();
