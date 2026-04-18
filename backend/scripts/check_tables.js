const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://john:Sixties1-Stegosaur1-Scraggly8-Monorail8@localhost:5432/mim',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function checkTables() {
  try {
    console.log('Checking database tables...');
    
    // List all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n=== CURRENT TABLES ===');
    tablesResult.rows.forEach(row => console.log(`- ${row.table_name}`));
    
    // Check businesses table structure
    console.log('\n=== BUSINESSES TABLE STRUCTURE ===');
    const businessesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'businesses'
      ORDER BY ordinal_position;
    `);
    businessesColumns.rows.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check materials table structure
    console.log('\n=== MATERIALS TABLE STRUCTURE ===');
    const materialsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'materials'
      ORDER BY ordinal_position;
    `);
    materialsColumns.rows.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check waste_streams data
    console.log('\n=== WASTE_STREAMS DATA ===');
    const wasteStreams = await pool.query('SELECT id, name, disposal_method FROM waste_streams ORDER BY id;');
    wasteStreams.rows.forEach(ws => {
      console.log(`  ${ws.id}: ${ws.name} (${ws.disposal_method})`);
    });
    
    console.log('\n=== Check complete ===');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkTables();