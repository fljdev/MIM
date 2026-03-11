const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:rSEZJQNjXtIufxxxMxmtbhpgUcMxMccG@interchange.proxy.rlwy.net:54288/railway',
  ssl: { rejectUnauthorized: false }
});

async function checkDetails() {
  try {
    console.log('=== CHECKING DETAILS FOR MIM TOWN SCHEMA ===\n');
    
    // 1. Check existing indexes on latitude/longitude columns
    console.log('1. LATITUDE/LONGITUDE INDEXES:');
    const indexRes = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE indexdef ILIKE '%latitude%' 
         OR indexdef ILIKE '%longitude%'
         OR indexdef ILIKE '%lat%' 
         OR indexdef ILIKE '%lng%'
      ORDER BY tablename, indexname;
    `);
    
    if (indexRes.rows.length === 0) {
      console.log('   No spatial indexes found.');
    } else {
      for (const idx of indexRes.rows) {
        console.log(`   Table: ${idx.schemaname}.${idx.tablename}`);
        console.log(`   Index: ${idx.indexname}`);
        console.log(`   Definition: ${idx.indexdef.substring(0, 100)}...`);
        console.log('');
      }
    }
    
    // 2. Check users.role column constraints/enum
    console.log('2. USERS.ROLE COLUMN DETAILS:');
    const roleRes = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'role';
    `);
    
    if (roleRes.rows.length > 0) {
      const roleCol = roleRes.rows[0];
      console.log(`   Data type: ${roleCol.data_type}`);
      console.log(`   Max length: ${roleCol.character_maximum_length}`);
      console.log(`   Nullable: ${roleCol.is_nullable}`);
      console.log(`   Default: ${roleCol.column_default}`);
    }
    
    // Check if there's a CHECK constraint on role
    const checkRes = await pool.query(`
      SELECT 
        cc.check_clause
      FROM information_schema.check_constraints cc
      JOIN information_schema.constraint_column_usage ccu 
        ON cc.constraint_name = ccu.constraint_name
      WHERE ccu.table_schema = 'public' 
        AND ccu.table_name = 'users' 
        AND ccu.column_name = 'role';
    `);
    
    if (checkRes.rows.length > 0) {
      console.log(`   Check constraint: ${checkRes.rows[0].check_clause}`);
    } else {
      console.log('   No check constraint found on role column.');
    }
    
    // Get distinct role values currently in use
    const distinctRoles = await pool.query(`
      SELECT DISTINCT role FROM users ORDER BY role;
    `);
    
    console.log(`   Distinct roles in use (${distinctRoles.rows.length}):`);
    for (const row of distinctRoles.rows) {
      console.log(`     - ${row.role}`);
    }
    
    // 3. Check applied_migrations table
    console.log('\n3. APPLIED_MIGRATIONS TABLE:');
    const migRes = await pool.query(`
      SELECT id, filename, applied_at 
      FROM applied_migrations 
      ORDER BY id;
    `);
    
    console.log(`   Total migrations applied: ${migRes.rows.length}`);
    if (migRes.rows.length > 0) {
      console.log('   Migration entries:');
      for (const mig of migRes.rows) {
        console.log(`     ${mig.id}: ${mig.filename} (${mig.applied_at})`);
      }
      
      // Find highest migration number from filename pattern
      let highestNum = 0;
      for (const mig of migRes.rows) {
        const match = mig.filename.match(/^(\d+)_/);
        if (match) {
          const num = parseInt(match[1]);
          if (num > highestNum) highestNum = num;
        }
      }
      console.log(`\n   Highest migration number from filenames: ${highestNum}`);
    }
    
    // 4. Check for any spatial/GIS extensions
    console.log('\n4. SPATIAL EXTENSIONS:');
    const extRes = await pool.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname IN ('postgis', 'earthdistance', 'cube');
    `);
    
    if (extRes.rows.length === 0) {
      console.log('   No spatial extensions found.');
    } else {
      for (const ext of extRes.rows) {
        console.log(`   ${ext.extname} v${ext.extversion}`);
      }
    }
    
    // 5. Check for Earthdistance function usage in indexes
    console.log('\n5. EARTHDISTANCE FUNCTION USAGE:');
    const earthRes = await pool.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE indexdef ILIKE '%ll_to_earth%' 
         OR indexdef ILIKE '%earth_distance%';
    `);
    
    if (earthRes.rows.length === 0) {
      console.log('   No earthdistance function usage found.');
    } else {
      for (const idx of earthRes.rows) {
        console.log(`   Index: ${idx.indexname}`);
        console.log(`   Uses earthdistance: ${idx.indexdef.substring(0, 80)}...`);
      }
    }
    
  } catch (error) {
    console.error('Error checking details:', error);
  } finally {
    await pool.end();
  }
}

checkDetails();