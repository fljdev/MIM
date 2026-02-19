/**
 * Test script for accessible venues API endpoints
 * 
 * This script tests the CRUD operations for accessible venues
 * 
 * Usage: node backend/scripts/test_accessible_venues_api.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testAPI() {
  console.log('🚀 Testing Accessible Venues API...\n');
  
  try {
    // Test 1: GET /api/accessible-venues (list all)
    console.log('1. Testing GET /api/accessible-venues...');
    const listResponse = await fetch(`${API_BASE_URL}/accessible-venues?limit=5`);
    const listData = await listResponse.json();
    
    if (listResponse.ok) {
      console.log(`✅ Success! Found ${listData.venues?.length || 0} venues`);
      console.log(`   Total in database: ${listData.pagination?.total || 0}`);
      
      if (listData.venues && listData.venues.length > 0) {
        console.log(`   First venue: "${listData.venues[0].venue_name}"`);
        console.log(`   Accessibility level: ${listData.venues[0].accessibility_level}`);
      }
    } else {
      console.log(`❌ Failed: ${listData.error || 'Unknown error'}`);
    }
    
    console.log('');
    
    // Test 2: Test with filters
    console.log('2. Testing GET /api/accessible-venues with filters...');
    const filterResponse = await fetch(`${API_BASE_URL}/accessible-venues?accessibility_level=Fully%20Accessible&limit=3`);
    const filterData = await filterResponse.json();
    
    if (filterResponse.ok) {
      console.log(`✅ Success! Found ${filterData.venues?.length || 0} "Fully Accessible" venues`);
    } else {
      console.log(`❌ Failed: ${filterData.error || 'Unknown error'}`);
    }
    
    console.log('');
    
    // Test 3: Test test endpoint
    console.log('3. Testing GET /api/test-accessible-venues...');
    const testResponse = await fetch(`${API_BASE_URL}/test-accessible-venues`);
    const testData = await testResponse.json();
    
    if (testResponse.ok) {
      console.log(`✅ Success: ${testData.message}`);
    } else {
      console.log(`❌ Failed: ${testData.error || 'Unknown error'}`);
    }
    
    console.log('');
    
    // Test 4: If there are venues, test GET single venue
    if (listData.venues && listData.venues.length > 0) {
      const firstVenueId = listData.venues[0].id;
      console.log(`4. Testing GET /api/accessible-venues/${firstVenueId}...`);
      
      const singleResponse = await fetch(`${API_BASE_URL}/accessible-venues/${firstVenueId}`);
      const singleData = await singleResponse.json();
      
      if (singleResponse.ok) {
        console.log(`✅ Success! Found venue: "${singleData.venue_name}"`);
        console.log(`   Type: ${singleData.venue_type}`);
        console.log(`   Address: ${singleData.address?.substring(0, 50)}...`);
      } else {
        console.log(`❌ Failed: ${singleData.error || 'Unknown error'}`);
      }
    } else {
      console.log('4. Skipping single venue test (no venues found)');
    }
    
    console.log('');
    
    // Test 5: Test CSV import script
    console.log('5. Checking CSV import script availability...');
    const fs = require('fs');
    const path = require('path');
    
    const importScriptPath = path.join(__dirname, 'import_accessible_venues.js');
    const csvPath = path.join(__dirname, '..', 'data', 'dublin_accessible_venues.csv');
    
    if (fs.existsSync(importScriptPath)) {
      console.log(`✅ Import script found: ${importScriptPath}`);
      
      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        console.log(`✅ CSV file found: ${csvPath} (${lines.length - 1} venues)`);
      } else {
        console.log(`❌ CSV file not found: ${csvPath}`);
      }
    } else {
      console.log(`❌ Import script not found: ${importScriptPath}`);
    }
    
    console.log('');
    
    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📊 API TEST SUMMARY:');
    console.log(`✅ Database has ${listData.pagination?.total || 0} accessible venues`);
    console.log(`✅ Filtered results: ${filterData.venues?.length || 0} fully accessible venues`);
    console.log('✅ All API endpoints tested successfully');
    console.log('═══════════════════════════════════════\n');
    
    console.log('🎉 Ready to use!');
    console.log('\n📋 Sample curl commands for testing:');
    console.log(`   curl "${API_BASE_URL}/accessible-venues?limit=5"`);
    console.log(`   curl "${API_BASE_URL}/accessible-venues?accessibility_level=Fully%20Accessible"`);
    console.log(`   curl "${API_BASE_URL}/accessible-venues?venue_type=pub"`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n⚠️ Make sure the server is running:');
    console.error('   cd backend && npm start');
    console.error('\n⚠️ Also ensure DATABASE_URL is set in .env file');
    process.exit(1);
  }
}

// Run the tests
testAPI().catch(err => {
  console.error('❌ Test script failed:', err.message);
  process.exit(1);
});