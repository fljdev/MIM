const { Pool } = require('pg');
require('dotenv').config({ path: 'backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function debugCount() {
  const client = await pool.connect();
  try {
    // Check total venues
    const res = await client.query(`
      SELECT COUNT(*) as total, 
             COUNT(*) FILTER (WHERE currently_operating = TRUE) as operating,
             COUNT(*) FILTER (WHERE currently_operating = FALSE) as not_operating 
      FROM accessible_venues
    `);
    console.log('Total venues:', res.rows[0].total);
    console.log('Currently operating:', res.rows[0].operating);
    console.log('Not operating:', res.rows[0].not_operating);
    
    // Check sample rows
    const sample = await client.query(`
      SELECT id, venue_name, currently_operating 
      FROM accessible_venues 
      LIMIT 5
    `);
    console.log('\nSample rows:');
    sample.rows.forEach(row => console.log(`  ${row.id}: "${row.venue_name}" - operating: ${row.currently_operating}`));
    
    // Test the count query that the API uses
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM accessible_venues 
      WHERE currently_operating = TRUE
    `;
    const countRes = await client.query(countQuery);
    console.log('\nCount query result (WHERE currently_operating = TRUE):', countRes.rows[0].total);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

debugCount().catch(console.error);