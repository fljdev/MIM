/**
 * Unified Migration Runner
 * 
 * Runs all migration scripts in the backend/database/migrations folder.
 * Migrations are executed in numerical order (001, 002, 003, etc.)
 * 
 * Usage: node backend/database/migrations/run_all_migrations.js
 */

require('dotenv').config();
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

// Mask connection string for logging (hide password)
function maskConnectionString(connStr) {
  return connStr.replace(/\/\/[^:]+:[^@]+@/, '//****:****@');
}

async function runAllMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting Unified Migration Runner...\n');
    console.log(`📡 Database: ${maskConnectionString(process.env.DATABASE_URL)}`);
    console.log('📁 Migration folder: backend/database/migrations\n');
    
    // Check if force reapply is requested
    const forceReapply = process.env.FORCE_REAPPLY === 'true';
    if (forceReapply) {
      console.log('⚠️ FORCE_REAPPLY mode enabled - migrations will be reapplied even if already applied\n');
    }
    
    // Get all SQL migration files (excluding rollback files)
    const migrationsPath = __dirname;
    const files = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql') && !file.includes('rollback'))
      .sort(); // Sort to ensure correct order (001, 002, 003, etc.)
    
    if (files.length === 0) {
      console.log('⚠️ No migration files found');
      return;
    }
    
    console.log(`📋 Found ${files.length} migration file(s):\n`);
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });
    console.log('');
    
    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS applied_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Run each migration
    let appliedCount = 0;
    let skippedCount = 0;
    
    for (const file of files) {
      // Check if migration was already applied
      const checkResult = await client.query(
        'SELECT filename FROM applied_migrations WHERE filename = $1',
        [file]
      );
      
      if (checkResult.rows.length > 0) {
        if (forceReapply) {
          console.log(`🔁 Force reapplying ${file} (was already applied)`);
          // Remove the existing record so it will be reapplied
          await client.query('DELETE FROM applied_migrations WHERE filename = $1', [file]);
        } else {
          console.log(`⏭️ Skipping ${file} (already applied)`);
          skippedCount++;
          continue;
        }
      }
      
      console.log(`📝 Applying migration: ${file}`);
      
      try {
        const sqlPath = path.join(migrationsPath, file);
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Run migration in transaction
        await client.query('BEGIN');
        await client.query(sql);
        
        // Record migration as applied
        await client.query(
          'INSERT INTO applied_migrations (filename) VALUES ($1)',
          [file]
        );
        
        await client.query('COMMIT');
        console.log(`✅ ${file} applied successfully\n`);
        appliedCount++;
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ ${file} failed:`, error.message);
        throw error;
      }
    }
    
    console.log('═══════════════════════════════════════');
    console.log(`✅ Applied: ${appliedCount} migration(s)`);
    console.log(`⏭️ Skipped: ${skippedCount} migration(s) (already applied)`);
    if (forceReapply) {
      console.log(`🔁 Force reapplied: ${files.length - skippedCount} migration(s)`);
    }
    console.log('═══════════════════════════════════════\n');
    
    // Display current database schema summary
    console.log('📊 Database Schema Summary:\n');
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  • ${row.table_name}`);
    });
    
    const viewsResult = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (viewsResult.rows.length > 0) {
      console.log('\nViews:');
      viewsResult.rows.forEach(row => {
        console.log(`  • ${row.table_name}`);
      });
    }
    
    console.log('\n🎉 All migrations completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migrations
runAllMigrations().catch(err => {
  console.error('\n❌ Migration script failed:', err.message);
  console.error('   Ensure DATABASE_URL is set to your Railway PostgreSQL connection string');
  console.error('   Example: postgresql://postgres:<password>@postgres.railway.internal:5432/railway');
  process.exit(1);
});
