const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:rSEZJQNjXtIufxxxMxmtbhpgUcMxMccG@interchange.proxy.rlwy.net:54288/railway',
  ssl: { rejectUnauthorized: false }
});

async function getSchema() {
  try {
    console.log('=== DATABASE SCHEMA AUDIT ===');
    
    // Get all tables
    const tablesRes = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        tableowner,
        hasindexes,
        hasrules,
        hastriggers
      FROM pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename
    `);
    
    console.log('\n=== TABLES ===');
    for (const table of tablesRes.rows) {
      console.log(`\nTable: ${table.schemaname}.${table.tablename}`);
      console.log(`  Owner: ${table.tableowner}`);
      
      // Get columns for this table
      const columnsRes = await pool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_schema = '${table.schemaname}' 
          AND table_name = '${table.tablename}'
        ORDER BY ordinal_position
      `);
      
      console.log(`  Columns (${columnsRes.rows.length}):`);
      for (const col of columnsRes.rows) {
        let colDef = `    ${col.column_name} ${col.data_type}`;
        if (col.character_maximum_length) {
          colDef += `(${col.character_maximum_length})`;
        } else if (col.numeric_precision) {
          colDef += `(${col.numeric_precision}`;
          if (col.numeric_scale) colDef += `,${col.numeric_scale}`;
          colDef += ')';
        }
        if (col.is_nullable === 'NO') colDef += ' NOT NULL';
        if (col.column_default) colDef += ` DEFAULT ${col.column_default}`;
        console.log(colDef);
      }
      
      // Get constraints
      const constraintsRes = await pool.query(`
        SELECT
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_schema AS foreign_table_schema,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        LEFT JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
          AND tc.table_name = kcu.table_name
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_schema = '${table.schemaname}' 
          AND tc.table_name = '${table.tablename}'
        ORDER BY tc.constraint_type, tc.constraint_name
      `);
      
      if (constraintsRes.rows.length > 0) {
        console.log(`  Constraints:`);
        for (const con of constraintsRes.rows) {
          let conDef = `    ${con.constraint_type}: ${con.constraint_name}`;
          if (con.column_name) conDef += ` (${con.column_name})`;
          if (con.constraint_type === 'FOREIGN KEY') {
            conDef += ` REFERENCES ${con.foreign_table_schema}.${con.foreign_table_name}(${con.foreign_column_name})`;
          }
          console.log(conDef);
        }
      }
      
      // Get indexes
      const indexesRes = await pool.query(`
        SELECT
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = '${table.schemaname}' 
          AND tablename = '${table.tablename}'
        ORDER BY indexname
      `);
      
      if (indexesRes.rows.length > 0) {
        console.log(`  Indexes:`);
        for (const idx of indexesRes.rows) {
          console.log(`    ${idx.indexname}`);
          // Truncate long index definitions for readability
          const shortDef = idx.indexdef.length > 100 ? idx.indexdef.substring(0, 100) + '...' : idx.indexdef;
          console.log(`      ${shortDef}`);
        }
      }
    }
    
    // Get views
    const viewsRes = await pool.query(`
      SELECT 
        schemaname,
        viewname,
        definition
      FROM pg_views 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, viewname
    `);
    
    console.log('\n=== VIEWS ===');
    for (const view of viewsRes.rows) {
      console.log(`\nView: ${view.schemaname}.${view.viewname}`);
      // Truncate long view definitions
      const shortDef = view.definition.length > 200 ? view.definition.substring(0, 200) + '...' : view.definition;
      console.log(`  Definition: ${shortDef}`);
    }
    
    // Get sequences
    const sequencesRes = await pool.query(`
      SELECT 
        sequence_schema,
        sequence_name,
        data_type,
        start_value,
        minimum_value,
        maximum_value,
        increment,
        cycle_option
      FROM information_schema.sequences 
      WHERE sequence_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY sequence_schema, sequence_name
    `);
    
    if (sequencesRes.rows.length > 0) {
      console.log('\n=== SEQUENCES ===');
      for (const seq of sequencesRes.rows) {
        console.log(`  ${seq.sequence_schema}.${seq.sequence_name}: ${seq.data_type} `);
      }
    }
    
    console.log('\n=== SCHEMA AUDIT COMPLETE ===');
    
  } catch (error) {
    console.error('Error fetching schema:', error);
  } finally {
    await pool.end();
  }
}

getSchema();