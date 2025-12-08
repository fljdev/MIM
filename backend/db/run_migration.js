const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection - use DATABASE_URL from Railway environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://john:Sixties1-Stegosaur1-Scraggly8-Monorail8@localhost:5432/mim',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create_meetup_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Run the SQL
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('Migration completed successfully!');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\nCurrent tables in database:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
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
