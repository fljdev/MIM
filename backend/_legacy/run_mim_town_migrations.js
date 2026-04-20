const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:rSEZJQNjXtIufxxxMxmtbhpgUcMxMccG@interchange.proxy.rlwy.net:54288/railway',
  ssl: { rejectUnauthorized: false }
});

async function runMigration(filePath) {
  const client = await pool.connect();
  
  try {
    console.log(`\n🚀 Running migration: ${path.basename(filePath)}`);
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Run migration in transaction
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log(`✅ ${path.basename(filePath)} applied successfully`);
    return true;
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ ${path.basename(filePath)} failed:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function runAllMigrations() {
  const migrationsPath = path.join(__dirname, 'database', 'migrations');
  
  // Only run MiM Town migrations (009, 010, 011, 012)
  const migrationsToRun = [
    '009_create_mim_town_tables.sql',
    '010_modify_users_favorites.sql', 
    '011_archive_legacy_tables.sql',
    '012_make_quantity_exchanged_nullable.sql'
  ];
  
  console.log('=== RUNNING MIM TOWN MIGRATIONS ===');
  console.log('Migrating to MiM Town circular economy platform\n');
  
  // Check if migrations have already been applied
  const client = await pool.connect();
  try {
    // Create applied_migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS applied_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    let appliedCount = 0;
    
    for (const migrationFile of migrationsToRun) {
      const migrationPath = path.join(migrationsPath, migrationFile);
      
      // Check if migration was already applied
      const checkResult = await client.query(
        'SELECT filename FROM applied_migrations WHERE filename = $1',
        [migrationFile]
      );
      
      if (checkResult.rows.length > 0) {
        console.log(`⏭️ Skipping ${migrationFile} (already applied)`);
        continue;
      }
      
      try {
        await runMigration(migrationPath);
        
        // Record migration as applied
        await client.query(
          'INSERT INTO applied_migrations (filename) VALUES ($1)',
          [migrationFile]
        );
        
        appliedCount++;
        
      } catch (error) {
        console.error(`\n❌ Migration sequence failed at: ${migrationFile}`);
        console.error('Error:', error.message);
        throw error;
      }
    }
    
    console.log(`\n✅ Applied ${appliedCount} migration(s)`);
    
    // Verify schema
    console.log('\n📊 Verifying new schema...');
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('businesses', 'waste_streams', 'materials', 'transactions', 'saved_materials')
      ORDER BY table_name
    `);
    
    console.log('New MiM Town tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`  • ${row.table_name}`);
    });
    
    // Check legacy tables
    const legacyTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE 'legacy_%'
      ORDER BY table_name
    `);
    
    if (legacyTablesResult.rows.length > 0) {
      console.log('\nLegacy tables archived:');
      legacyTablesResult.rows.forEach(row => {
        console.log(`  • ${row.table_name}`);
      });
    }
    
    console.log('\n🎉 MiM Town migrations completed successfully!');
    
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migrations
runAllMigrations().catch(err => {
  console.error('\n❌ Migration script failed:', err.message);
  console.error('Stack trace:', err.stack);
  process.exit(1);
});