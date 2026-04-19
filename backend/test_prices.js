// Test the prices router
const express = require('express');
const app = express();
const router = require('./routes/prices');

app.use('/api/prices', router);

// Start a test server
const PORT = 5001;
const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  
  // Test the route
  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/api/prices',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Response:', data);
      server.close();
      process.exit(0);
    });
  });
  
  req.on('error', (err) => {
    console.error('Request error:', err);
    server.close();
    process.exit(1);
  });
  
  req.end();
});