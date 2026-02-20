const http = require('http');

function testAPI() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:5000/api/accessible-venues?limit=10', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('✅ API Response Summary:');
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Total venues in pagination: ${json.pagination?.total}`);
          console.log(`   Venues returned: ${json.venues?.length}`);
          console.log(`   Has more pages: ${json.pagination?.hasMore}`);
          console.log(`\n🎯 VERIFICATION: ${json.pagination?.total === 50 ? '✅ CORRECT - 50 unique venues!' : '❌ WRONG - Expected 50 venues'}`);
          
          // Check for duplicates in response
          const venueNames = json.venues?.map(v => v.venue_name) || [];
          const uniqueNames = [...new Set(venueNames)];
          console.log(`   Venues in response are unique: ${venueNames.length === uniqueNames.length ? '✅ Yes' : '❌ No'}`);
          
          resolve(json);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (err) => {
      console.error('❌ API Error:', err.message);
      console.log('   Is the server running? Try: node backend/server.js');
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

testAPI().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});