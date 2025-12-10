require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    console.log('Testing database insert...');
    
    // Test bcrypt
    const hash = await bcrypt.hash('test123', 10);
    console.log('Hash created:', hash.substring(0, 20) + '...');
    
    // Test insert
    const email = 'debugtest_' + Date.now() + '@test.com';
    const result = await pool.query(
      'INSERT INTO users (email, name, password_hash, role, is_premium) VALUES ($1, $2, $3, $4, $5) RETURNING id, email',
      [email, 'Debug User', hash, 'app_user', false]
    );
    console.log('Insert successful:', result.rows[0]);
    
    // Cleanup
    await pool.query('DELETE FROM users WHERE id = $1', [result.rows[0].id]);
    console.log('Cleanup done');
    
    console.log('\n✅ All database operations work correctly!');
    
  } catch (e) {
    console.log('❌ Error:', e.message);
    console.log('Stack:', e.stack);
  } finally {
    pool.end();
  }
}

test();
