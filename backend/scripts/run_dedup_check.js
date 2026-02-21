const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runCheck() {
  const client = await pool.connect();
  try {
    console.log('=== Checking current state ===');
    
    // 1. Count total venues
    const totalRes = await client.query('SELECT COUNT(*) as total FROM accessible_venues');
    console.log(`Total venues: ${totalRes.rows[0].total}`);
    
    // 2. Check for duplicates
    const dupRes = await client.query(`
      SELECT venue_name, address, COUNT(*) as count
      FROM accessible_venues
      GROUP BY venue_name, address
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    console.log(`Duplicate venue/address combos: ${dupRes.rows.length}`);
    if (dupRes.rows.length > 0) {
      console.log('\nDuplicate details:');
      dupRes.rows.forEach(row => {
        console.log(`  "${row.venue_name}" at "${row.address}" appears ${row.count} times`);
      });
    }
    
    // 3. Check unique constraint
    const constRes = await client.query(`
      SELECT conname FROM pg_constraint 
      WHERE conrelid = 'accessible_venues'::regclass 
      AND conname = 'unique_venue_name_address'
    `);
    console.log(`\nUnique constraint 'unique_venue_name_address' exists: ${constRes.rows.length > 0}`);
    
    // 4. Check applied migrations
    const migRes = await client.query(`
      SELECT filename FROM applied_migrations ORDER BY filename
    `);
    console.log(`\nApplied migrations: ${migRes.rows.length}`);
    migRes.rows.forEach(row => console.log(`  ${row.filename}`));
    
    // 5. Check if 008_deduplicate_venues.sql is applied
    const dedupApplied = migRes.rows.some(r => r.filename.includes('008') || r.filename.includes('duplicate'));
    console.log(`\nDeduplication migration applied: ${dedupApplied}`);
    
    if (dupRes.rows.length > 0 && !dedupApplied) {
      console.log('\n=== ACTION NEEDED: Running deduplication migration ===');
      
      // Read and run the migration
      const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '008_deduplicate_venues.sql');
      if (fs.existsSync(migrationPath)) {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('Running deduplication SQL...');
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log('Deduplication completed.');
        
        // Record migration as applied
        await client.query(
          'INSERT INTO applied_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING',
          ['008_deduplicate_venues.sql']
        );
        console.log('Migration recorded.');
      } else {
        console.error(`Migration file not found at: ${migrationPath}`);
      }
      
      // Verify after dedup
      const afterDupRes = await client.query(`
        SELECT COUNT(*) as total FROM accessible_venues
      `);
      console.log(`\nTotal venues after deduplication: ${afterDupRes.rows[0].total}`);
    } else if (dupRes.rows.length === 0) {
      console.log('\n✅ No duplicates found.');
    } else {
      console.log('\n✅ Deduplication already applied.');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

runCheck().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});