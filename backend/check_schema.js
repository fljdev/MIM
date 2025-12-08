require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    // Check users table columns
    const usersResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== USERS TABLE COLUMNS ===');
    usersResult.rows.forEach(row => {
      console.log(`  ${row.column_name} - ${row.data_type}`);
    });
    
    // Check if password_hash column exists
    const hasPasswordHash = usersResult.rows.some(r => r.column_name === 'password_hash');
    console.log(`\n  password_hash column exists: ${hasPasswordHash}`);
    
    // Check meetups table columns
    const meetupsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'meetups'
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== MEETUPS TABLE COLUMNS ===');
    meetupsResult.rows.forEach(row => {
      console.log(`  ${row.column_name} - ${row.data_type}`);
    });
    
    // List some users with password_hash status
    const users = await pool.query('SELECT id, email, name, password_hash IS NOT NULL as has_password FROM users LIMIT 5');
    console.log('\n=== EXISTING USERS ===');
    users.rows.forEach(row => {
      console.log(`  ${row.id}: ${row.email} (${row.name}) - has_password: ${row.has_password}`);
    });
    
    // Check meetup_participants table
    const participantsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'meetup_participants'
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== MEETUP_PARTICIPANTS TABLE COLUMNS ===');
    if (participantsResult.rows.length === 0) {
      console.log('  ❌ TABLE DOES NOT EXIST!');
    } else {
      participantsResult.rows.forEach(row => {
        console.log(`  ${row.column_name} - ${row.data_type}`);
      });
    }
    
    // Check meetup_comments table
    const commentsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'meetup_comments'
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== MEETUP_COMMENTS TABLE COLUMNS ===');
    if (commentsResult.rows.length === 0) {
      console.log('  ❌ TABLE DOES NOT EXIST!');
    } else {
      commentsResult.rows.forEach(row => {
        console.log(`  ${row.column_name} - ${row.data_type}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
