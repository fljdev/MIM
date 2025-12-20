require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying Migration Results\n');
    console.log('=' .repeat(50));
    
    // 1. Check applied_migrations table
    console.log('\n1. Checking applied_migrations table...');
    const appliedResult = await client.query(
      'SELECT filename, applied_at FROM applied_migrations ORDER BY filename'
    );
    
    if (appliedResult.rows.length === 0) {
      console.log('   ❌ No applied migrations found!');
    } else {
      console.log(`   ✅ Found ${appliedResult.rows.length} applied migrations:`);
      appliedResult.rows.forEach(row => {
        console.log(`      - ${row.filename} (applied: ${row.applied_at})`);
      });
      
      // Check if all 5 migrations are present
      const expectedMigrations = [
        '001_add_proposed_meetup_times.sql',
        '002_add_venue_votes.sql', 
        '003_organizer_meetup_schema.sql',
        '004_user_profile_features.sql',
        '005_carbon_tracking.sql'
      ];
      
      const appliedFilenames = appliedResult.rows.map(row => row.filename);
      const missingMigrations = expectedMigrations.filter(m => !appliedFilenames.includes(m));
      
      if (missingMigrations.length > 0) {
        console.log(`   ❌ Missing migrations: ${missingMigrations.join(', ')}`);
      } else {
        console.log('   ✅ All 5 migrations are correctly tracked');
      }
    }
    
    // 2. Check meetup_participants for carbon tracking columns
    console.log('\n2. Checking carbon tracking columns in meetup_participants...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'meetup_participants'
      AND column_name IN ('distance_km', 'carbon_emitted')
      ORDER BY column_name
    `);
    
    const expectedColumns = ['distance_km', 'carbon_emitted'];
    const foundColumns = columnsResult.rows.map(row => row.column_name);
    
    if (columnsResult.rows.length === 0) {
      console.log('   ❌ No carbon tracking columns found!');
    } else {
      console.log(`   ✅ Found ${columnsResult.rows.length} carbon tracking columns:`);
      columnsResult.rows.forEach(row => {
        console.log(`      - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
      });
      
      const missingColumns = expectedColumns.filter(c => !foundColumns.includes(c));
      if (missingColumns.length > 0) {
        console.log(`   ❌ Missing columns: ${missingColumns.join(', ')}`);
      } else {
        console.log('   ✅ All carbon tracking columns are present');
      }
    }
    
    // 3. Check carbon tracking views
    console.log('\n3. Checking carbon tracking views...');
    const viewsResult = await client.query(`
      SELECT table_name, view_definition
      FROM information_schema.views 
      WHERE table_schema = 'public'
      AND table_name IN ('carbon_user_stats', 'carbon_meetup_stats')
      ORDER BY table_name
    `);
    
    const expectedViews = ['carbon_user_stats', 'carbon_meetup_stats'];
    const foundViews = viewsResult.rows.map(row => row.table_name);
    
    if (viewsResult.rows.length === 0) {
      console.log('   ❌ No carbon tracking views found!');
    } else {
      console.log(`   ✅ Found ${viewsResult.rows.length} carbon tracking views:`);
      viewsResult.rows.forEach(row => {
        console.log(`      - ${row.table_name}`);
      });
      
      const missingViews = expectedViews.filter(v => !foundViews.includes(v));
      if (missingViews.length > 0) {
        console.log(`   ❌ Missing views: ${missingViews.join(', ')}`);
      } else {
        console.log('   ✅ All carbon tracking views are present');
      }
    }
    
    // 4. Check carbon calculation function
    console.log('\n4. Checking carbon calculation function...');
    const functionResult = await client.query(`
      SELECT routine_name, routine_type, data_type
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
      AND routine_name = 'calculate_carbon_emission'
    `);
    
    if (functionResult.rows.length === 0) {
      console.log('   ❌ calculate_carbon_emission function not found!');
    } else {
      console.log(`   ✅ Found calculate_carbon_emission function:`);
      functionResult.rows.forEach(row => {
        console.log(`      - ${row.routine_name} (type: ${row.routine_type}, returns: ${row.data_type})`);
      });
    }
    
    // 5. Test function with sample data
    console.log('\n5. Testing calculate_carbon_emission function...');
    try {
      const testResult = await client.query(`
        SELECT calculate_carbon_emission(10.0, 'driving') as car_emissions,
               calculate_carbon_emission(10.0, 'walking') as walking_emissions,
               calculate_carbon_emission(10.0, 'transit') as transit_emissions
      `);
      
      console.log('   ✅ Function test successful:');
      console.log(`      - 10km driving: ${testResult.rows[0].car_emissions} kg CO2`);
      console.log(`      - 10km walking: ${testResult.rows[0].walking_emissions} kg CO2`);
      console.log(`      - 10km transit: ${testResult.rows[0].transit_emissions} kg CO2`);
    } catch (error) {
      console.log(`   ❌ Function test failed: ${error.message}`);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 Migration Verification Complete!');
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyMigrations();
