const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: 'postgresql://john:Sixties1-Stegosaur1-Scraggly8-Monorail8@localhost:5432/mim'
});

const JWT_SECRET = 'mimapp-dev-secret-2025';

async function getTestToken() {
  const client = await pool.connect();
  
  try {
    // Get first user
    const userResult = await client.query(
      'SELECT id, email, name FROM users LIMIT 1'
    );
    
    if (userResult.rows.length === 0) {
      console.log('No users found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('Found user:', user.email, user.name);
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: 'app_user'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('\nTest JWT Token:');
    console.log(token);
    console.log('\nUse this token for testing API calls');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

getTestToken();
