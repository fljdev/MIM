const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function applyMigration() {
  const client = await pool.connect();
  try {
    console.log('=== Applying deduplication migration 008 ===');
    
    // Check if migration already applied
    const migRes = await client.query(
      'SELECT filename FROM applied_migrations WHERE filename = $1',
      ['008_deduplicate_venues.sql']
    );
    
    if (migRes.rows.length > 0) {
      console.log('Migration 008 already applied. Skipping.');
      return;
    }
    
    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '008_deduplicate_venues.sql');
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('Running migration SQL...');
    
    // Execute in transaction
    await client.query('BEGIN');
    await client.query(sql);
    
    // Record migration
    await client.query(
      'INSERT INTO applied_migrations (filename) VALUES ($1)',
      ['008_deduplicate_venues.sql']
    );
    
    await client.query('COMMIT');
    console.log('✅ Migration 008 applied successfully.');
    
    // Verify results
    const totalRes = await client.query('SELECT COUNT(*) as total FROM accessible_venues');
    console.log(`Total venues: ${totalRes.rows[0].total}`);
    
    const dupRes = await client.query(`
      SELECT venue_name, address, COUNT(*) as count
      FROM accessible_venues
      GROUP BY venue_name, address
      HAVING COUNT(*) > 1
    `);
    console.log(`Duplicate venue/address combos: ${dupRes.rows.length}`);
    
    const constRes = await client.query(`
      SELECT conname FROM pg_constraint 
      WHERE conrelid = 'accessible_venues'::regclass 
      AND conname = 'unique_venue_name_address'
    `);
    console.log(`Unique constraint exists: ${constRes.rows.length > 0}`);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});