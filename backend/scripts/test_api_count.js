const http = require('http');

function testAPI() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:5000/api/accessible-venues?limit=5', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('Status:', res.statusCode);
          console.log('Total venues in pagination:', json.pagination?.total);
          console.log('Showing venues:', json.venues?.length);
          console.log('Has more?', json.pagination?.hasMore);
          console.log('First venue name:', json.venues?.[0]?.venue_name);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

testAPI().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});