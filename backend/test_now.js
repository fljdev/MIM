const { exec } = require('child_process');
const http = require('http');

console.log('=== Starting listings route test ===\n');

// Start server
const serverProcess = exec('node server.js', (error, stdout, stderr) => {
  if (error) {
    console.error('Server error:', error);
  }
});

// Wait for server to start
setTimeout(() => {
  console.log('=== Test 1: GET /api/listings/marketplace (should return empty array) ===');
  
  const req1 = http.request('http://localhost:5000/api/listings/marketplace', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
      console.log('');
      
      // Test 2: POST without token
      console.log('=== Test 2: POST /api/listings without token (should return 401) ===');
      const postData = JSON.stringify({
        holding_id: 1,
        price_type: 'fixed',
        asking_price: 500
      });
      
      const req2 = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/listings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res2) => {
        let data2 = '';
        res2.on('data', (chunk) => {
          data2 += chunk;
        });
        res2.on('end', () => {
          console.log('Status:', res2.statusCode);
          console.log('Response:', data2);
          console.log('\n=== Tests complete ===');
          
          // Kill server
          serverProcess.kill();
          process.exit(0);
        });
      });
      
      req2.on('error', (e) => {
        console.error('POST request error:', e.message);
        serverProcess.kill();
        process.exit(1);
      });
      
      req2.write(postData);
      req2.end();
    });
  });
  
  req1.on('error', (e) => {
    console.error('GET request error:', e.message);
    serverProcess.kill();
    process.exit(1);
  });
  
  req1.end();
}, 3000);