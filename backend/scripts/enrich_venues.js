/**
 * Script to enrich accessible venues with Google Places API data
 * 
 * This script:
 * 1. Connects to Railway PostgreSQL DB using DATABASE_URL from backend/.env
 * 2. Selects all rows from accessible_venues where address = 'Location TBD'
 * 3. For each venue, calls Google Places Text Search API with query venue_name + ', Dublin, Ireland'
 * 4. From the first result, extracts:
 *    - formatted_address
 *    - geometry.location.lat
 *    - geometry.location.lng
 * 5. Updates the row in the DB with all three values
 * 6. Logs each venue: name, address found, and coordinates
 * 7. If no result is found for a venue, logs a warning and skips it — does not update that row
 * 
 * Usage: node backend/scripts/enrich_venues.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('   Please set DATABASE_URL to your Railway PostgreSQL connection string');
  process.exit(1);
}

if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error('❌ GOOGLE_MAPS_API_KEY environment variable is not set');
  console.error('   Please set GOOGLE_MAPS_API_KEY in backend/.env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper function to sleep/delay between API calls
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to mask connection string for logging
function maskConnectionString(connStr) {
  if (!connStr) return 'local fallback';
  return connStr.replace(/\/\/[^:]+:[^@]+@/, '//****:****@');
}

// Helper function to mask API key for logging
function maskApiKey(apiKey) {
  if (!apiKey) return 'not set';
  return `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
}

// Main function to enrich venues
async function enrichVenues() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting venue enrichment with Google Places API...');
    console.log(`📡 Database: ${maskConnectionString(process.env.DATABASE_URL)}`);
    console.log(`🔑 Google API Key: ${maskApiKey(process.env.GOOGLE_MAPS_API_KEY)}`);
    
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
    
    // Check if google_place_id column exists
    let hasGooglePlaceIdColumn = false;
    try {
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'accessible_venues' 
        AND column_name = 'google_place_id'
      `);
      hasGooglePlaceIdColumn = columnCheck.rows.length > 0;
      if (hasGooglePlaceIdColumn) {
        console.log('✅ google_place_id column exists - will store Google Place IDs');
      } else {
        console.log('⚠️ google_place_id column does not exist - will skip storing Google Place IDs');
      }
    } catch (error) {
      console.log('⚠️ Could not check for google_place_id column:', error.message);
    }
    
    // Fetch venues needing enrichment: TBD addresses OR NULL coordinates
    console.log('\n🔍 Fetching venues needing enrichment...');
    const venuesResult = await client.query(`
      SELECT id, venue_name, address, latitude, longitude
      FROM accessible_venues 
      WHERE address = 'Location TBD' OR latitude IS NULL OR longitude IS NULL
      ORDER BY id ASC
    `);
    
    const venues = venuesResult.rows;
    console.log(`📊 Found ${venues.length} venues needing enrichment`);
    
    // Categorize venues
    const tbdVenues = venues.filter(v => v.address === 'Location TBD');
    const nullCoordVenues = venues.filter(v => v.address !== 'Location TBD' && (v.latitude === null || v.longitude === null));
    
    console.log(`   • Venues with "Location TBD" addresses: ${tbdVenues.length}`);
    console.log(`   • Venues with existing addresses but NULL coordinates: ${nullCoordVenues.length}`);
    
    if (venues.length === 0) {
      console.log('🎉 No venues need enrichment! All venues have addresses and coordinates.');
      return;
    }
    
    console.log('\n🔄 Starting enrichment process...');
    console.log(`⏳ Using 200ms delay between API calls to respect rate limits`);
    
    let enrichedTbdCount = 0;
    let enrichedCoordOnlyCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each venue
    for (const venue of venues) {
      try {
        // Determine category for logging
        const isTbdAddress = venue.address === 'Location TBD';
        const hasExistingAddress = !isTbdAddress;
        
        console.log(`\n--- Processing venue ${venue.id}: "${venue.venue_name}" ---`);
        if (isTbdAddress) {
          console.log(`📍 [TBD Address] Need address + coordinates`);
        } else {
          console.log(`📍 [Missing Coords] Existing address: "${venue.address.substring(0, 50)}${venue.address.length > 50 ? '...' : ''}"`);
        }
        
        // Build Google Places API query
        const query = `${venue.venue_name}, Dublin, Ireland`;
        const encodedQuery = encodeURIComponent(query);
        const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        
        console.log(`🔎 Searching Google Places for: "${query}"`);
        
        // Call Google Places API
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          console.error(`❌ API request failed with status: ${response.status}`);
          errorCount++;
          continue;
        }
        
        const data = await response.json();
        
        // Check API response status
        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
          console.error(`❌ Google Places API error: ${data.status} - ${data.error_message || 'No error message'}`);
          errorCount++;
          continue;
        }
        
        // Check if we have results
        if (data.status === 'ZERO_RESULTS' || !data.results || data.results.length === 0) {
          console.warn(`⚠️ No results found for "${venue.venue_name}" - skipping`);
          skippedCount++;
          continue;
        }
        
        const firstResult = data.results[0];
        
        // Extract data from first result
        const formattedAddress = firstResult.formatted_address;
        const lat = firstResult.geometry?.location?.lat;
        const lng = firstResult.geometry?.location?.lng;
        const placeId = firstResult.place_id;
        
        console.log(`📍 Found address: ${formattedAddress}`);
        console.log(`📌 Coordinates: ${lat}, ${lng}`);
        if (placeId) {
          console.log(`🆔 Google Place ID: ${placeId}`);
        }
        
        // Validate extracted data
        if (!formattedAddress || lat === undefined || lng === undefined) {
          console.error(`❌ Incomplete data from API - missing address or coordinates`);
          errorCount++;
          continue;
        }
        
        // Build update query based on venue category and google_place_id column
        let updateQuery;
        let queryParams;
        
        if (isTbdAddress) {
          // For TBD addresses: update address + coordinates
          if (hasGooglePlaceIdColumn && placeId) {
            updateQuery = `
              UPDATE accessible_venues 
              SET address = $1, 
                  latitude = $2, 
                  longitude = $3,
                  google_place_id = $4,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = $5
              RETURNING id
            `;
            queryParams = [formattedAddress, lat, lng, placeId, venue.id];
          } else {
            updateQuery = `
              UPDATE accessible_venues 
              SET address = $1, 
                  latitude = $2, 
                  longitude = $3,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = $4
              RETURNING id
            `;
            queryParams = [formattedAddress, lat, lng, venue.id];
          }
        } else {
          // For existing addresses: update coordinates only, keep existing address
          if (hasGooglePlaceIdColumn && placeId) {
            updateQuery = `
              UPDATE accessible_venues 
              SET latitude = $1, 
                  longitude = $2,
                  google_place_id = $3,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = $4
              RETURNING id
            `;
            queryParams = [lat, lng, placeId, venue.id];
          } else {
            updateQuery = `
              UPDATE accessible_venues 
              SET latitude = $1, 
                  longitude = $2,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = $3
              RETURNING id
            `;
            queryParams = [lat, lng, venue.id];
          }
        }
        
        // Update database
        const updateResult = await client.query(updateQuery, queryParams);
        
        if (updateResult.rowCount === 1) {
          console.log(`✅ Successfully updated venue ${venue.id}`);
          if (isTbdAddress) {
            enrichedTbdCount++;
          } else {
            enrichedCoordOnlyCount++;
          }
        } else {
          console.error(`❌ Failed to update venue ${venue.id} - no rows affected`);
          errorCount++;
        }
        
        // Delay before next API call (200ms as requested)
        await sleep(200);
        
      } catch (error) {
        console.error(`❌ Error processing venue "${venue.venue_name}":`, error.message);
        errorCount++;
      }
    }
    
    // Print summary
    console.log('\n═══════════════════════════════════════');
    console.log('📋 ENRICHMENT SUMMARY');
    console.log('═══════════════════════════════════════');
    const totalEnriched = enrichedTbdCount + enrichedCoordOnlyCount;
    console.log(`✅ Successfully enriched: ${totalEnriched} venues`);
    console.log(`   • TBD addresses updated: ${enrichedTbdCount}`);
    console.log(`   • Missing coordinates filled: ${enrichedCoordOnlyCount}`);
    console.log(`⏭️ Skipped (no results): ${skippedCount} venues`);
    console.log(`❌ Errors: ${errorCount} venues`);
    console.log(`📊 Total processed: ${venues.length} venues`);
    console.log('═══════════════════════════════════════\n');
    
    // If any venues were enriched, show a sample
    if (totalEnriched > 0) {
      console.log('🔍 Sample of enriched venues:');
      const sampleResult = await client.query(`
        SELECT id, venue_name, address, latitude, longitude 
        FROM accessible_venues 
        WHERE address != 'Location TBD' 
          AND latitude IS NOT NULL 
          AND longitude IS NOT NULL
        ORDER BY updated_at DESC 
        LIMIT 3
      `);
      
      sampleResult.rows.forEach(row => {
        console.log(`   • "${row.venue_name}": ${row.address} (${row.latitude}, ${row.longitude})`);
      });
    }
    
    // Check if any TBD venues remain
    const remainingResult = await client.query(`
      SELECT COUNT(*) as remaining_count 
      FROM accessible_venues 
      WHERE address = 'Location TBD'
    `);
    const remainingCount = parseInt(remainingResult.rows[0].remaining_count);
    
    if (remainingCount > 0) {
      console.log(`\n⚠️ Note: ${remainingCount} venues still have "Location TBD" addresses`);
      console.log('   These may need manual attention or different search queries.');
    } else {
      console.log('\n🎉 All venues now have addresses and coordinates!');
    }
    
  } catch (error) {
    console.error('\n❌ Enrichment failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the script
enrichVenues().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  console.error('   Ensure DATABASE_URL and GOOGLE_MAPS_API_KEY are set correctly in .env file');
  console.error('   And accessible_venues table exists (run migration first)');
  process.exit(1);
});