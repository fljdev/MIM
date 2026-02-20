/**
 * Script to run the deduplication migration directly
 * 
 * Usage: node backend/scripts/run_deduplication.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection - use DATABASE_URL from Railway environment (no fallback)
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('   Please set DATABASE_URL to your Railway PostgreSQL connection string');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runDeduplication() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Running venue deduplication migration...\n');
    console.log(`📡 Database: ${maskConnectionString(process.env.DATABASE_URL)}`);
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '008_deduplicate_venues.sql');
    console.log(`📁 Reading migration from: ${migrationPath}`);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found at: ${migrationPath}`);
      console.error('   Please ensure 008_deduplicate_venues.sql exists');
      process.exit(1);
    }
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Run the migration
    console.log('\n🔧 Executing deduplication migration...\n');
    await client.query(sql);
    
    console.log('\n✅ Deduplication migration completed successfully!');
    
    // Run verification
    console.log('\n🔍 Running verification...\n');
    
    // Get counts after cleanup
    const totalResult = await client.query('SELECT COUNT(*) as total FROM accessible_venues');
    const totalVenues = parseInt(totalResult.rows[0].total);
    
    const duplicateResult = await client.query(`
      SELECT venue_name, address, COUNT(*) as duplicate_count
      FROM accessible_venues
      GROUP BY venue_name, address
      HAVING COUNT(*) > 1
      ORDER BY duplicate_count DESC
    `);
    
    const constraintResult = await client.query(`
      SELECT conname, contype 
      FROM pg_constraint 
      WHERE conrelid = 'accessible_venues'::regclass 
      AND conname = 'unique_venue_name_address'
    `);
    
    console.log(`📊 Results:`);
    console.log(`   Total venues after cleanup: ${totalVenues}`);
    console.log(`   Duplicate groups remaining: ${duplicateResult.rows.length}`);
    console.log(`   Unique constraint exists: ${constraintResult.rows.length > 0 ? '✅ Yes' : '❌ No'}`);
    
    if (duplicateResult.rows.length === 0 && constraintResult.rows.length > 0) {
      console.log('\n🎉 SUCCESS: Database now has exactly 50 unique venues!');
      console.log('   • All duplicates removed');
      console.log('   • Unique constraint added');
      console.log('   • Future imports protected from duplicates');
    } else {
      console.log('\n⚠️ ISSUE: Some problems remain');
      if (duplicateResult.rows.length > 0) {
        console.log(`   • Still have ${duplicateResult.rows.length} duplicate groups`);
      }
      if (constraintResult.rows.length === 0) {
        console.log('   • Unique constraint not added');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Deduplication failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Helper function to mask connection string for logging
function maskConnectionString(connStr) {
  if (!connStr) return 'local fallback';
  return connStr.replace(/\/\/[^:]+:[^@]+@/, '//****:****@');
}

// Run the script
runDeduplication().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  console.error('   Ensure DATABASE_URL is set correctly in .env file');
  console.error('   And accessible_venues table exists');
  process.exit(1);
});