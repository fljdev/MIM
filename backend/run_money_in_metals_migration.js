const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection - use environment variable or fallback to local
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://john:Sixties1-Stegosaur1-Scraggly8-Monorail8@localhost:5432/mim',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Running Money in Metals Migration (013)...\n');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'database/migrations/013_create_money_in_metals_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Running migration...');
    
    // Run migration in transaction
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ Migration 013 applied successfully\n');
    
    // Verify tables were created
    console.log('📊 Verifying new tables...');
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('precious_metal_types', 'dealers', 'precious_metal_listings', 
                          'valuation_history', 'precious_metal_transactions', 
                          'spot_price_history', 'coin_database')
      ORDER BY table_name
    `);
    
    console.log('New Money in Metals tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`  • ${row.table_name}`);
    });
    
    // Check precious_metal_types data
    console.log('\n📦 Checking precious_metal_types data...');
    const metalTypesResult = await client.query('SELECT COUNT(*) as count FROM precious_metal_types;');
    console.log(`  ${metalTypesResult.rows[0].count} precious metal types pre-populated`);
    
    console.log('\n🎉 Money in Metals migration completed successfully!');
    console.log('📈 Database is ready for gold/silver valuation & P2P marketplace.');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch(err => {
  console.error('\n❌ Migration script failed:', err.message);
  process.exit(1);
});