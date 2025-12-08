const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection - use DATABASE_URL from Railway environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://john:REDACTED@localhost:5432/mim',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting organizer migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'migrations/003_organizer_meetup_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Run the SQL
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('Organizer migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('Migration script failed:', err);
  process.exit(1);
});
