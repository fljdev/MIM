const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImVtYWlsIjoiamltbXlAbWltLmNvbSIsInJvbGUiOiJhcHBfdXNlciIsImlhdCI6MTc2NTc5NzQ3OCwiZXhwIjoxNzY2NDAyMjc4fQ.WeIq27xFwuAZz7qoHLuYE25y3Qhg7c243dWPPUJpLxs';

console.log('=== Testing Authentication Flow ===');

// Test 1: Verify token endpoint
console.log('\n1. Testing token verification...');
const verifyOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/verify',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
};

const verifyReq = http.request(verifyOptions, (res) => {
  console.log('Verify Status Code:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Verify Response:', JSON.stringify(json, null, 2));
      
      // Test 2: Carbon API with token
      console.log('\n2. Testing carbon API with token...');
      const carbonOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/carbon/user/8',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      };
      
      const carbonReq = http.request(carbonOptions, (carbonRes) => {
        console.log('Carbon API Status Code:', carbonRes.statusCode);
        let carbonData = '';
        carbonRes.on('data', (chunk) => { carbonData += chunk; });
        carbonRes.on('end', () => {
          try {
            const carbonJson = JSON.parse(carbonData);
            console.log('Carbon API Response: Success!');
            console.log('Total carbon:', carbonJson.total_carbon_kg, 'kg');
            console.log('Journey count:', carbonJson.journey_count);
            
            // Test 3: Token refresh endpoint
            console.log('\n3. Testing token refresh...');
            const refreshOptions = {
              hostname: 'localhost',
              port: 5000,
              path: '/api/auth/refresh',
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token
              }
            };
            
            const refreshReq = http.request(refreshOptions, (refreshRes) => {
              console.log('Refresh Status Code:', refreshRes.statusCode);
              let refreshData = '';
              refreshRes.on('data', (chunk) => { refreshData += chunk; });
              refreshRes.on('end', () => {
                try {
                  const refreshJson = JSON.parse(refreshData);
                  if (refreshRes.statusCode === 200) {
                    console.log('Token refresh successful!');
                    console.log('New token received (first 50 chars):', refreshJson.token.substring(0, 50) + '...');
                    
                    // Test 4: Use new token for carbon API
                    console.log('\n4. Testing carbon API with refreshed token...');
                    const newCarbonOptions = {
                      hostname: 'localhost',
                      port: 5000,
                      path: '/api/carbon/user/8',
                      method: 'GET',
                      headers: {
                        'Authorization': 'Bearer ' + refreshJson.token
                      }
                    };
                    
                    const newCarbonReq = http.request(newCarbonOptions, (newCarbonRes) => {
                      console.log('New Carbon API Status Code:', newCarbonRes.statusCode);
                      let newCarbonData = '';
                      newCarbonRes.on('data', (chunk) => { newCarbonData += chunk; });
                      newCarbonRes.on('end', () => {
                        try {
                          const newCarbonJson = JSON.parse(newCarbonData);
                          if (newCarbonRes.statusCode === 200) {
                            console.log('Carbon API with refreshed token: Success!');
                            console.log('Total carbon:', newCarbonJson.total_carbon_kg, 'kg');
                          } else {
                            console.log('Carbon API with refreshed token failed:', newCarbonJson);
                          }
                        } catch (e) {
                          console.log('Carbon API with refreshed token - Raw response:', newCarbonData);
                        }
                        console.log('\n=== Authentication Flow Test Complete ===');
                      });
                    });
                    
                    newCarbonReq.on('error', (e) => {
                      console.error('New Carbon API request error:', e.message);
                    });
                    
                    newCarbonReq.end();
                    
                  } else {
                    console.log('Token refresh failed:', refreshJson);
                  }
                } catch (e) {
                  console.log('Refresh - Raw response:', refreshData);
                }
              });
            });
            
            refreshReq.on('error', (e) => {
              console.error('Refresh request error:', e.message);
            });
            
            refreshReq.end();
            
          } catch (e) {
            console.log('Carbon API - Raw response:', carbonData);
          }
        });
      });
      
      carbonReq.on('error', (e) => {
        console.error('Carbon API request error:', e.message);
      });
      
      carbonReq.end();
      
    } catch (e) {
      console.log('Verify - Raw response:', data);
    }
  });
});

verifyReq.on('error', (e) => {
  console.error('Verify request error:', e.message);
});

verifyReq.end();
