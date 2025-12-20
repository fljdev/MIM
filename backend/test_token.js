const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImVtYWlsIjoiamltbXlAbWltLmNvbSIsInJvbGUiOiJhcHBfdXNlciIsImlhdCI6MTc2NTc5NzQ3OCwiZXhwIjoxNzY2NDAyMjc4fQ.WeIq27xFwuAZz7qoHLuYE25y3Qhg7c243dWPPUJpLxs';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/carbon/user/8',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
};

console.log('Making request to:', options.hostname + ':' + options.port + options.path);
console.log('Headers:', options.headers);

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Response Headers:', res.headers);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Response:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
