/**
 * Carbon Tracking Migration Runner
 * 
 * Runs the 005_carbon_tracking.sql migration to add carbon tracking
 * functionality to the database.
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection - use DATABASE_URL from Railway environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://john:REDACTED@localhost:5432/mim',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function runCarbonMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting Carbon Tracking Migration (005)...\n');
    
    // Read the migration SQL file
    const sqlPath = path.join(__dirname, 'migrations', '005_carbon_tracking.sql');
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration file not found: ${sqlPath}`);
    }
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Run the migration in a transaction
    await client.query('BEGIN');
    console.log('📝 Executing migration SQL...');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify columns were added
    console.log('🔍 Verifying schema changes...\n');
    
    const columnsResult = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'meetup_participants' 
        AND column_name IN ('distance_km', 'carbon_emitted')
      ORDER BY column_name
    `);
    
    console.log('New columns in meetup_participants:');
    columnsResult.rows.forEach(row => {
      console.log(`  ✓ ${row.column_name} (${row.data_type})`);
    });
    
    // Verify views were created
    const viewsResult = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
        AND table_name IN ('carbon_user_stats', 'carbon_meetup_stats')
      ORDER BY table_name
    `);
    
    console.log('\nNew database views:');
    viewsResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    // Verify function was created
    const functionResult = await client.query(`
      SELECT routine_name, routine_type
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
        AND routine_name = 'calculate_carbon_emission'
    `);
    
    console.log('\nNew database functions:');
    functionResult.rows.forEach(row => {
      console.log(`  ✓ ${row.routine_name} (${row.routine_type})`);
    });
    
    // Verify indexes were created
    const indexResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'meetup_participants'
        AND indexname LIKE '%carbon%'
      ORDER BY indexname
    `);
    
    console.log('\nNew indexes:');
    if (indexResult.rows.length > 0) {
      indexResult.rows.forEach(row => {
        console.log(`  ✓ ${row.indexname}`);
      });
    } else {
      console.log('  ℹ️ No carbon-specific indexes found (may use partial indexes)');
    }
    
    console.log('\n🎉 Carbon tracking feature is now ready to use!');
    console.log('📚 See CARBON_TRACKING_README.md for usage instructions\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runCarbonMigration().catch(err => {
  console.error('\n❌ Migration script failed:', err.message);
  process.exit(1);
});
