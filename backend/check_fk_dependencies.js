const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:REDACTED@interchange.proxy.rlwy.net:54288/railway',
  ssl: { rejectUnauthorized: false }
});

async function checkFKDependencies() {
  try {
    console.log('=== CHECKING FOREIGN KEY DEPENDENCIES FOR LEGACY TABLES ===\n');
    
    // Tables to be renamed in migration 011
    const tablesToRename = [
      'accessible_venues',
      'accessibility_reviews',
      'venue_physical_accessibility',
      'venue_sensory_accessibility',
      'user_accessibility_profiles',
      'venue_special_events',
      'meetups',
      'meetup_participants',
      'meetup_time_suggestions',
      'meetup_comments',
      'meetup_messages',
      'meetup_venue_votes',
      'transport_services'
    ];
    
    console.log('Checking foreign key relationships for tables to be renamed:\n');
    
    for (const tableName of tablesToRename) {
      // Check if table exists
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_name = $1
        )
      `, [tableName]);
      
      if (!tableExists.rows[0].exists) {
        console.log(`⚠️  Table ${tableName} does not exist (may have been renamed already)`);
        continue;
      }
      
      console.log(`\n📋 Table: ${tableName}`);
      
      // 1. Check foreign keys FROM this table (outgoing references)
      const outgoingFKs = await pool.query(`
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_schema AS foreign_table_schema,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_schema = 'public' 
          AND tc.table_name = $1
          AND tc.constraint_type = 'FOREIGN KEY'
      `, [tableName]);
      
      if (outgoingFKs.rows.length > 0) {
        console.log(`  🔗 Foreign keys FROM ${tableName} (outgoing):`);
        for (const fk of outgoingFKs.rows) {
          console.log(`    • ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name} (${fk.constraint_name})`);
        }
      } else {
        console.log(`  ✅ No outgoing foreign keys from ${tableName}`);
      }
      
      // 2. Check foreign keys TO this table (incoming references)
      const incomingFKs = await pool.query(`
        SELECT
          tc.table_name AS referencing_table,
          tc.constraint_name,
          kcu.column_name AS referencing_column,
          ccu.column_name AS referenced_column
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE ccu.table_schema = 'public' 
          AND ccu.table_name = $1
          AND tc.constraint_type = 'FOREIGN KEY'
      `, [tableName]);
      
      if (incomingFKs.rows.length > 0) {
        console.log(`  ⚠️  Foreign keys TO ${tableName} (incoming - will block rename!):`);
        for (const fk of incomingFKs.rows) {
          console.log(`    • ${fk.referencing_table}.${fk.referencing_column} → ${tableName}.${fk.referenced_column} (${fk.constraint_name})`);
        }
      } else {
        console.log(`  ✅ No incoming foreign keys to ${tableName} (safe to rename)`);
      }
      
      // 3. Check for views that depend on this table
      const viewDeps = await pool.query(`
        SELECT 
          viewname,
          definition
        FROM pg_views
        WHERE schemaname = 'public'
          AND definition ILIKE '%' || $1 || '%'
      `, [tableName]);
      
      if (viewDeps.rows.length > 0) {
        console.log(`  👁️  Views referencing ${tableName}:`);
        for (const view of viewDeps.rows) {
          // Check if view directly references the table
          if (view.definition.includes(`"${tableName}"`) || view.definition.includes(` ${tableName} `)) {
            console.log(`    • ${view.viewname} (direct reference)`);
          } else {
            console.log(`    • ${view.viewname} (possible indirect reference)`);
          }
        }
      }
    }
    
    // Also check the favorite_venues table (to be renamed in 010)
    console.log('\n\n📋 SPECIAL CHECK: favorite_venues table (migration 010)');
    
    const favTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'favorite_venues'
      )
    `);
    
    if (favTableExists.rows[0].exists) {
      // Check incoming FKs to favorite_venues
      const incomingFavFKs = await pool.query(`
        SELECT
          tc.table_name AS referencing_table,
          tc.constraint_name,
          kcu.column_name AS referencing_column,
          ccu.column_name AS referenced_column
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE ccu.table_schema = 'public' 
          AND ccu.table_name = 'favorite_venues'
          AND tc.constraint_type = 'FOREIGN KEY'
      `);
      
      if (incomingFavFKs.rows.length > 0) {
        console.log(`  ⚠️  Foreign keys TO favorite_venues (will block rename!):`);
        for (const fk of incomingFavFKs.rows) {
          console.log(`    • ${fk.referencing_table}.${fk.referencing_column} → favorite_venues.${fk.referenced_column} (${fk.constraint_name})`);
        }
      } else {
        console.log(`  ✅ No incoming foreign keys to favorite_venues (safe to rename)`);
      }
      
      // Check for any data in favorite_venues
      const favDataCount = await pool.query('SELECT COUNT(*) as count FROM favorite_venues');
      console.log(`  📊 Data in favorite_venues: ${favDataCount.rows[0].count} rows`);
      
      if (parseInt(favDataCount.rows[0].count) > 0) {
        console.log(`  ⚠️  favorite_venues has data - migration 010 will need to handle this`);
        // Show sample data
        const sampleData = await pool.query('SELECT venue_id, venue_name FROM favorite_venues LIMIT 3');
        console.log(`    Sample venue_ids: ${sampleData.rows.map(r => r.venue_id).join(', ')}`);
      }
    } else {
      console.log(`  ℹ️  favorite_venues table does not exist`);
    }
    
    console.log('\n=== FK DEPENDENCY CHECK COMPLETE ===');
    
  } catch (error) {
    console.error('Error checking FK dependencies:', error);
  } finally {
    await pool.end();
  }
}

checkFKDependencies();