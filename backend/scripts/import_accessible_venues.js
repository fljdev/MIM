/**
 * Script to import Dublin accessible venues from CSV to accessible_venues table
 * 
 * This script:
 * 1. Parses dublin_accessible_venues.csv
 * 2. Maps CSV columns to database columns per data_population_strategy.txt
 * 3. Converts "Yes"/"No"/"Unknown" to boolean/null for wheelchair_bathroom
 * 4. Sets defaults: currently_operating = TRUE, verified_by = 'unverified', venue_type = 'pub'
 * 5. Runs cleanup queries from import_initial_data.sql
 * 
 * Usage: node backend/scripts/import_accessible_venues.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync'); // Using csv-parse for robust CSV parsing

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

async function importAccessibleVenues() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting Dublin accessible venues import...');
    console.log(`📡 Database: ${maskConnectionString(process.env.DATABASE_URL)}`);
    
    // Check if accessible_venues table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'accessible_venues'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ accessible_venues table does not exist. Please run migration 007 first.');
      console.error('   Run: node backend/database/migrations/run_all_migrations.js');
      process.exit(1);
    }
    
    // Read and parse CSV file
    const csvPath = path.join(__dirname, '..', 'data', 'dublin_accessible_venues.csv');
    console.log(`📁 Reading CSV from: ${csvPath}`);
    
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found at: ${csvPath}`);
      console.error('   Please ensure dublin_accessible_venues.csv is in backend/data/');
      process.exit(1);
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`📊 Found ${records.length} venues in CSV`);
    
    // Import each record
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const record of records) {
      try {
        // Map CSV columns to database columns
        const venueName = record.venue_name || '';
        const address = record.address || '';
        const accessibilityLevel = record.accessibility_level || '';
        const accessibleBathroom = record.accessible_bathroom || '';
        const notes = record.notes || '';
        const source = record.source || '';
        const sourceDate = record.source_date || '';
        
        // Convert accessible_bathroom to boolean/null
        let wheelchairBathroom = null;
        if (accessibleBathroom.toLowerCase() === 'yes') {
          wheelchairBathroom = true;
        } else if (accessibleBathroom.toLowerCase() === 'no') {
          wheelchairBathroom = false;
        }
        // Unknown or empty string remains NULL
        
        // Parse source_date to Date object
        let parsedSourceDate = null;
        if (sourceDate) {
          // Handle formats like "2024-01", "2022-11", "2018-03"
          const [year, month] = sourceDate.split('-');
          if (year && month) {
            parsedSourceDate = new Date(`${year}-${month}-01`);
          }
        }
        
        // Set defaults per data_population_strategy.txt
        const currentlyOperating = true;
        const verifiedBy = 'unverified';
        const venueType = 'pub'; // Default, will be updated for restaurants/hotels later
        
        // Insert into database
        const insertQuery = `
          INSERT INTO accessible_venues (
            venue_name, 
            address, 
            accessibility_level,
            wheelchair_bathroom,
            accessibility_notes,
            data_source,
            source_date,
            currently_operating,
            verified_by,
            venue_type,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT DO NOTHING
          RETURNING id
        `;
        
        const result = await client.query(insertQuery, [
          venueName,
          address,
          accessibilityLevel,
          wheelchairBathroom,
          notes,
          source,
          parsedSourceDate,
          currentlyOperating,
          verifiedBy,
          venueType
        ]);
        
        if (result.rows.length > 0) {
          importedCount++;
          if (importedCount % 10 === 0) {
            console.log(`  Imported ${importedCount} venues...`);
          }
        } else {
          // Might be duplicate
          skippedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error importing venue "${record.venue_name}":`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📋 Import Summary:`);
    console.log(`✅ Successfully imported: ${importedCount} venues`);
    console.log(`⏭️ Skipped (duplicates): ${skippedCount} venues`);
    console.log(`❌ Errors: ${errorCount} venues`);
    
    if (importedCount === 0 && errorCount > 0) {
      console.error('\n⚠️ No venues were imported due to errors. Check database connection and CSV format.');
      process.exit(1);
    }
    
    // Run cleanup queries from import_initial_data.sql
    console.log('\n🔧 Running cleanup queries...');
    
    try {
      // Set defaults for imported rows (already done in insert, but ensure consistency)
      await client.query(`
        UPDATE accessible_venues 
        SET currently_operating = TRUE,
            verified_by = 'unverified',
            venue_type = 'pub'
        WHERE venue_type IS NULL;
      `);
      console.log('✅ Set default values for imported rows');
      
      // Convert accessibility_level text to standardized values
      await client.query(`
        UPDATE accessible_venues
        SET accessibility_level = 
            CASE 
                WHEN accessibility_level ILIKE '%fully accessible%' THEN 'Fully Accessible'
                WHEN accessibility_level ILIKE '%accessible entrance%' THEN 'Accessible Entrance'
                WHEN accessibility_level ILIKE '%semi-accessible%' THEN 'Semi-Accessible'
                WHEN accessibility_level ILIKE '%not recommended%' THEN 'Not Recommended'
                ELSE accessibility_level
            END;
      `);
      console.log('✅ Standardized accessibility_level values');
      
      // Mark some known restaurants
      await client.query(`
        UPDATE accessible_venues
        SET venue_type = 'restaurant'
        WHERE venue_name IN (
          'Fade Street Social',
          'Drury Buildings',
          'Allta Rooftop',
          'Lennan''s Yard',
          'Balfe''s',
          'Anti Social',
          'Tribeca'
        );
      `);
      console.log('✅ Updated venue_type for known restaurants');
      
      // Mark hotels
      await client.query(`
        UPDATE accessible_venues
        SET venue_type = 'hotel'
        WHERE venue_name ILIKE '%hotel%';
      `);
      console.log('✅ Updated venue_type for hotels');
      
      // Verify import
      const countResult = await client.query('SELECT COUNT(*) as total FROM accessible_venues');
      const totalInDb = parseInt(countResult.rows[0].total);
      
      const levelResult = await client.query(`
        SELECT accessibility_level, COUNT(*) as count 
        FROM accessible_venues 
        GROUP BY accessibility_level 
        ORDER BY count DESC
      `);
      
      const typeResult = await client.query(`
        SELECT venue_type, COUNT(*) as count 
        FROM accessible_venues 
        GROUP BY venue_type 
        ORDER BY count DESC
      `);
      
      console.log('\n📊 Database Verification:');
      console.log(`   Total venues in database: ${totalInDb}`);
      
      console.log('\n   Accessibility Level Distribution:');
      levelResult.rows.forEach(row => {
        console.log(`     ${row.accessibility_level || 'NULL'}: ${row.count} venues`);
      });
      
      console.log('\n   Venue Type Distribution:');
      typeResult.rows.forEach(row => {
        console.log(`     ${row.venue_type || 'NULL'}: ${row.count} venues`);
      });
      
      // Check for "Location TBD" addresses
      const tbdResult = await client.query(`
        SELECT COUNT(*) as tbd_count 
        FROM accessible_venues 
        WHERE address ILIKE '%location tbd%' OR address = ''
      `);
      const tbdCount = parseInt(tbdResult.rows[0].tbd_count);
      
      if (tbdCount > 0) {
        console.log(`\n⚠️ Note: ${tbdCount} venues have "Location TBD" or empty addresses`);
        console.log('   These will need Google Places API enrichment for coordinates.');
      }
      
      console.log('\n🎉 Import and cleanup completed successfully!');
      
    } catch (cleanupError) {
      console.error('❌ Error during cleanup queries:', cleanupError.message);
      throw cleanupError;
    }
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Helper function to mask connection string for logging
function maskConnectionString(connStr) {
  if (!connStr) return 'local fallback';
  return connStr.replace(/\/\/[^:]+:[^@]+@/, '//****:****@');
}

// Run the script
importAccessibleVenues().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  console.error('   Ensure DATABASE_URL is set correctly in .env file');
  console.error('   And accessible_venues table exists (run migration first)');
  process.exit(1);
});