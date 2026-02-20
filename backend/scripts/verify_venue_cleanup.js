/**
 * Verification script for venue duplicate cleanup
 * 
 * This script:
 * 1. Checks current venue count and duplicate status
 * 2. Verifies unique constraint exists
 * 3. Provides verification report
 * 
 * Usage: node backend/scripts/verify_venue_cleanup.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

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

async function verifyCleanup() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying venue duplicate cleanup...\n');
    
    // 1. Get total venue count
    const totalResult = await client.query('SELECT COUNT(*) as total FROM accessible_venues');
    const totalVenues = parseInt(totalResult.rows[0].total);
    console.log(`📊 Total venues in database: ${totalVenues}`);
    
    // 2. Get count of currently operating venues (what API shows)
    const operatingResult = await client.query(`
      SELECT COUNT(*) as operating 
      FROM accessible_venues 
      WHERE currently_operating = TRUE
    `);
    const operatingVenues = parseInt(operatingResult.rows[0].operating);
    console.log(`📊 Currently operating venues: ${operatingVenues}`);
    
    // 3. Check for duplicates (venues with same name and address)
    const duplicateResult = await client.query(`
      SELECT venue_name, address, COUNT(*) as duplicate_count
      FROM accessible_venues
      GROUP BY venue_name, address
      HAVING COUNT(*) > 1
      ORDER BY duplicate_count DESC
    `);
    
    console.log(`\n🔍 Duplicate detection:`);
    if (duplicateResult.rows.length === 0) {
      console.log('✅ No duplicate venues found (perfect!)');
    } else {
      console.log(`⚠️ Found ${duplicateResult.rows.length} duplicate venue groups:`);
      duplicateResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. "${row.venue_name}" at "${row.address}" - ${row.duplicate_count} copies`);
      });
    }
    
    // 4. Verify unique constraint exists
    const constraintResult = await client.query(`
      SELECT conname, contype 
      FROM pg_constraint 
      WHERE conrelid = 'accessible_venues'::regclass 
      AND conname = 'unique_venue_name_address'
    `);
    
    console.log(`\n🔒 Unique constraint verification:`);
    if (constraintResult.rows.length > 0) {
      console.log(`✅ Unique constraint 'unique_venue_name_address' exists`);
    } else {
      console.log(`❌ Unique constraint 'unique_venue_name_address' NOT FOUND`);
      console.log('   Run migration 008_deduplicate_venues.sql to add the constraint');
    }
    
    // 5. Check for NULL addresses (which could cause constraint issues)
    const nullAddressResult = await client.query(`
      SELECT COUNT(*) as null_address_count
      FROM accessible_venues
      WHERE address IS NULL OR address = ''
    `);
    const nullAddressCount = parseInt(nullAddressResult.rows[0].null_address_count);
    
    console.log(`\n📍 Address completeness:`);
    console.log(`   Venues with NULL or empty address: ${nullAddressCount}`);
    if (nullAddressCount > 0) {
      console.log('   ⚠️ Note: NULL addresses are treated as empty strings for duplicate detection');
    }
    
    // 6. Calculate unique venue/address combinations
    const uniqueResult = await client.query(`
      SELECT COUNT(DISTINCT CONCAT(venue_name, '|', COALESCE(address, ''))) as unique_combinations
      FROM accessible_venues
    `);
    const uniqueCombinations = parseInt(uniqueResult.rows[0].unique_combinations);
    
    console.log(`\n🎯 Summary:`);
    console.log(`   Total venue records: ${totalVenues}`);
    console.log(`   Unique venue/address combinations: ${uniqueCombinations}`);
    console.log(`   Duplicate groups found: ${duplicateResult.rows.length}`);
    
    // Final verification
    if (duplicateResult.rows.length === 0 && constraintResult.rows.length > 0) {
      console.log('\n✅ VERIFICATION PASSED:');
      console.log('   • No duplicate venues found');
      console.log('   • Unique constraint is in place');
      console.log('   • Future imports will be protected from duplicates');
      
      if (totalVenues === uniqueCombinations) {
        console.log(`   • Database has exactly ${totalVenues} unique venues`);
      }
    } else if (duplicateResult.rows.length > 0) {
      console.log('\n❌ VERIFICATION FAILED:');
      console.log('   • Duplicate venues still exist in database');
      console.log('   • Run migration 008_deduplicate_venues.sql to clean up');
    } else if (constraintResult.rows.length === 0) {
      console.log('\n⚠️ VERIFICATION INCOMPLETE:');
      console.log('   • No duplicate venues found (good!)');
      console.log('   • BUT unique constraint is missing');
      console.log('   • Run migration 008_deduplicate_venues.sql to add constraint');
    }
    
    // 7. Sample of venues (optional, for manual verification)
    console.log(`\n📋 Sample of venues (first 5):`);
    const sampleResult = await client.query(`
      SELECT id, venue_name, address, currently_operating
      FROM accessible_venues
      ORDER BY id
      LIMIT 5
    `);
    
    sampleResult.rows.forEach(row => {
      console.log(`   ${row.id}: "${row.venue_name}" - ${row.address ? row.address.substring(0, 30) + '...' : 'No address'}`);
    });
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the verification
verifyCleanup().catch(error => {
  console.error('\n❌ Verification script failed:', error.message);
  console.error('   Ensure DATABASE_URL is set correctly in .env file');
  console.error('   And accessible_venues table exists');
  process.exit(1);
});