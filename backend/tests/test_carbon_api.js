/**
 * Manual Carbon API Testing Script
 * 
 * Tests the carbon tracking endpoints with sample data.
 * This script helps verify that the API is working correctly.
 * 
 * Usage: node backend/tests/test_carbon_api.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

// Test credentials (update with your test user)
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123'
};

let authToken = null;

/**
 * Test helper to make authenticated requests
 */
async function authenticatedRequest(method, endpoint, body = null) {
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  return { status: response.status, data };
}

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  console.log('\n📡 Test 1: Health Check');
  console.log('=====================================');
  
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Test 2: Login and Get Token
 */
async function testLogin() {
  console.log('\n🔐 Test 2: Login');
  console.log('=====================================');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });
    
    const data = await response.json();
    
    if (response.ok && data.token) {
      authToken = data.token;
      console.log('✅ Login successful');
      console.log('✅ Token received:', authToken.substring(0, 20) + '...');
      console.log('✅ User:', data.user.name);
    } else {
      console.error('❌ Login failed:', data.error);
      console.log('ℹ️ Make sure you have a test user in the database');
      console.log('ℹ️ Or update TEST_USER credentials in this script');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Test 3: Calculate Carbon (Preview)
 */
async function testCalculateCarbon() {
  console.log('\n🧮 Test 3: Calculate Carbon (Preview)');
  console.log('=====================================');
  
  if (!authToken) {
    console.log('⏭️ Skipping (no auth token)');
    return;
  }
  
  try {
    const requestBody = {
      origin: { lat: 53.3498, lng: -6.2603 },
      destination: { lat: 53.3453, lng: -6.2629 },
      mode_of_transport: 'driving'
    };
    
    console.log('📤 Request:', JSON.stringify(requestBody, null, 2));
    
    const { status, data } = await authenticatedRequest(
      'POST',
      '/api/carbon/calculate',
      requestBody
    );
    
    console.log('✅ Status:', status);
    console.log('✅ Response:', JSON.stringify(data, null, 2));
    
    if (data.alternatives) {
      console.log('\n💡 Better alternatives:');
      data.alternatives
        .filter(alt => alt.is_better)
        .forEach(alt => {
          console.log(`  • ${alt.mode}: ${alt.carbon_emitted} kg CO₂ (save ${alt.savings} kg, ${alt.percent_savings}% reduction)`);
        });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Test 4: Compare Transport Modes
 */
async function testComparemodes() {
  console.log('\n🔄 Test 4: Compare Transport Modes');
  console.log('=====================================');
  
  if (!authToken) {
    console.log('⏭️ Skipping (no auth token)');
    return;
  }
  
  try {
    const { status, data } = await authenticatedRequest(
      'GET',
      '/api/carbon/comparison?distance=10'
    );
    
    console.log('✅ Status:', status);
    console.log('✅ For a 10km journey:\n');
    
    if (data.comparisons) {
      data.comparisons.forEach(comp => {
        const impact = '▓'.repeat(Math.floor(comp.relative_impact / 10));
        console.log(`  ${comp.mode.padEnd(10)}: ${comp.formatted.padEnd(12)} ${impact}`);
      });
      console.log('\n💡', data.recommendation);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Test 5: Get Global Statistics
 */
async function testGlobalStats() {
  console.log('\n📊 Test 5: Global Carbon Statistics');
  console.log('=====================================');
  
  if (!authToken) {
    console.log('⏭️ Skipping (no auth token)');
    return;
  }
  
  try {
    const { status, data } = await authenticatedRequest(
      'GET',
      '/api/carbon/stats'
    );
    
    console.log('✅ Status:', status);
    console.log('✅ Global Stats:');
    if (data.global_stats) {
      console.log(`  • Total users tracked: ${data.global_stats.total_users}`);
      console.log(`  • Total journeys: ${data.global_stats.total_journeys}`);
      console.log(`  • Total carbon: ${data.global_stats.total_carbon_kg} kg CO₂`);
      console.log(`  • Average per journey: ${data.global_stats.average_per_journey} kg CO₂`);
      console.log(`  • Carbon saved vs all driving: ${data.global_stats.carbon_saved_vs_driving} kg CO₂`);
    }
    
    if (data.mode_distribution) {
      console.log('\n📈 Mode Distribution:');
      Object.entries(data.mode_distribution).forEach(([mode, stats]) => {
        console.log(`  • ${mode}: ${stats.count} journeys (${stats.percentage}%)`);
      });
    }
    
    if (data.leaderboard && data.leaderboard.length > 0) {
      console.log('\n🏆 Top Eco-Friendly Users:');
      data.leaderboard.slice(0, 3).forEach(user => {
        console.log(`  ${user.rank}. ${user.user_name} - ${user.average_per_journey} kg avg (${user.badge})`);
      });
    } else {
      console.log('\n🏆 Leaderboard: No data yet (users need at least 3 journeys)');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Test 6: Emission Factor Calculations
 */
function testEmissionFactors() {
  console.log('\n🧪 Test 6: Emission Factor Calculations');
  console.log('=====================================');
  
  const { calculateCarbonEmission } = require('../utils/carbonCalculator');
  
  const testCases = [
    { distance: 10, mode: 'driving', expected: 1.2 },
    { distance: 10, mode: 'transit', expected: 0.6 },
    { distance: 10, mode: 'walking', expected: 0.0 },
    { distance: 10, mode: 'bicycling', expected: 0.0 }
  ];
  
  testCases.forEach(test => {
    const result = calculateCarbonEmission(test.distance, test.mode);
    const passed = result === test.expected;
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${test.mode}: ${test.distance}km → ${result} kg CO₂ (expected ${test.expected})`);
  });
}

/**
 * Test 7: Distance Calculations
 */
function testDistanceCalculations() {
  console.log('\n📏 Test 7: Distance Calculations');
  console.log('=====================================');
  
  const { calculateDistance } = require('../utils/mockDistanceCalculator');
  
  const testCases = [
    {
      name: 'Dublin City to Temple Bar',
      from: { lat: 53.3498, lng: -6.2603 },
      to: { lat: 53.3453, lng: -6.2629 }
    },
    {
      name: 'Same location',
      from: { lat: 53.3498, lng: -6.2603 },
      to: { lat: 53.3498, lng: -6.2603 }
    }
  ];
  
  testCases.forEach(test => {
    const distance = calculateDistance(test.from.lat, test.from.lng, test.to.lat, test.to.lng);
    console.log(`✅ ${test.name}: ${distance} km`);
  });
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n🌱 CARBON TRACKING API - MANUAL TESTS');
  console.log('=========================================\n');
  console.log('ℹ️ Make sure the server is running: npm start');
  console.log('ℹ️ Server should be at: http://localhost:5000\n');
  
  // Check if server is running
  try {
    const serverCheck = await fetch(`${BASE_URL}/health`);
    if (!serverCheck.ok) {
      console.error('❌ Server is not responding. Please start the server first.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Cannot connect to server. Please start with: npm start');
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  // Run tests
  await testHealthCheck();
  await testLogin();
  
  if (authToken) {
    await testCalculateCarbon();
    await testCompareMode();
    await testGlobalStats();
  } else {
    console.log('\n⚠️ Skipping authenticated tests (login failed)');
    console.log('ℹ️ Create a test user or update credentials in this script');
  }
  
  // Run calculation tests (no auth needed)
  testEmissionFactors();
  testDistanceCalculations();
  
  console.log('\n🎉 Manual testing complete!');
  console.log('📚 See CARBON_API_DOCUMENTATION.md for more details\n');
}

// Run all tests
runAllTests().catch(err => {
  console.error('\n❌ Test script failed:', err.message);
  process.exit(1);
});
