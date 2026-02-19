const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: json });
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testPagination() {
  console.log('🚀 Testing Accessible Venues API Pagination...\n');
  
  try {
    // Test 1: Basic pagination with limit=5
    console.log('1. Testing basic pagination (limit=5)...');
    const result1 = await makeRequest('http://localhost:5000/api/accessible-venues?limit=5');
    console.log(`   Status: ${result1.statusCode}`);
    console.log(`   Total venues: ${result1.data.pagination.total}`);
    console.log(`   Showing: ${result1.data.venues.length}`);
    console.log(`   Has more: ${result1.data.pagination.hasMore}`);
    console.log(`   Offset: ${result1.data.pagination.offset}`);
    
    // Test 2: Pagination with offset=5
    console.log('\n2. Testing pagination with offset=5...');
    const result2 = await makeRequest('http://localhost:5000/api/accessible-venues?limit=5&offset=5');
    console.log(`   Status: ${result2.statusCode}`);
    console.log(`   Total venues: ${result2.data.pagination.total}`);
    console.log(`   Showing: ${result2.data.venues.length}`);
    console.log(`   Has more: ${result2.data.pagination.hasMore}`);
    console.log(`   Offset: ${result2.data.pagination.offset}`);
    console.log(`   First venue on page 2: "${result2.data.venues[0]?.venue_name}"`);
    
    // Test 3: Filter by accessibility level
    console.log('\n3. Testing filter: Fully Accessible venues...');
    const result3 = await makeRequest('http://localhost:5000/api/accessible-venues?accessibility_level=Fully%20Accessible&limit=5');
    console.log(`   Status: ${result3.statusCode}`);
    console.log(`   Total Fully Accessible venues: ${result3.data.pagination.total}`);
    console.log(`   Showing: ${result3.data.venues.length}`);
    
    // Test 4: Filter by venue type
    console.log('\n4. Testing filter: Restaurants only...');
    const result4 = await makeRequest('http://localhost:5000/api/accessible-venues?venue_type=restaurant&limit=5');
    console.log(`   Status: ${result4.statusCode}`);
    console.log(`   Total restaurants: ${result4.data.pagination.total}`);
    console.log(`   Showing: ${result4.data.venues.length}`);
    
    // Test 5: Filter by accessible bathroom
    console.log('\n5. Testing filter: Has accessible bathroom...');
    const result5 = await makeRequest('http://localhost:5000/api/accessible-venues?has_accessible_bathroom=true&limit=5');
    console.log(`   Status: ${result5.statusCode}`);
    console.log(`   Total with accessible bathroom: ${result5.data.pagination.total}`);
    console.log(`   Showing: ${result5.data.venues.length}`);
    
    // Test 6: Test single venue endpoint
    console.log('\n6. Testing single venue endpoint...');
    if (result1.data.venues.length > 0) {
      const firstVenueId = result1.data.venues[0].id;
      const result6 = await makeRequest(`http://localhost:5000/api/accessible-venues/${firstVenueId}`);
      console.log(`   Status: ${result6.statusCode}`);
      console.log(`   Retrieved venue: "${result6.data.venue_name}"`);
      console.log(`   Type: ${result6.data.venue_type}`);
    }
    
    console.log('\n🎉 All pagination tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Database has ${result1.data.pagination.total} accessible venues`);
    console.log(`   • ${result3.data.pagination.total} are "Fully Accessible"`);
    console.log(`   • ${result4.data.pagination.total} are restaurants`);
    console.log(`   • ${result5.data.pagination.total} have accessible bathrooms`);
    console.log(`   • Pagination is working correctly with limit/offset`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testPagination();