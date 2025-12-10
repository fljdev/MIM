require('dotenv').config();

async function testAPI() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('=== Testing API Endpoints ===\n');
  
  // Test 0: Debug endpoint
  console.log('0. Testing /api/debug...');
  try {
    const debugRes = await fetch(`${baseUrl}/api/debug`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'hello', foo: 'bar' })
    });
    const debugData = await debugRes.json();
    console.log('   Status:', debugRes.status);
    console.log('   Response:', JSON.stringify(debugData, null, 2));
  } catch (error) {
    console.log('   ❌ Debug failed:', error.message);
  }
  
  // Test 1: Health check
  console.log('\n1. Testing /health...');
  try {
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log('   ✅ Health:', healthData.status);
  } catch (error) {
    console.log('   ❌ Health failed:', error.message);
  }
  
  // Test 2: Register
  const testEmail = `testuser_${Date.now()}@test.com`;
  console.log(`\n2. Testing /api/auth/register (${testEmail})...`);
  try {
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        name: 'Test User',
        password: 'test123'
      })
    });
    const regData = await regRes.json();
    console.log('   Status:', regRes.status);
    console.log('   Response:', JSON.stringify(regData, null, 2));
    
    if (regData.token) {
      // Test 3: Verify token
      console.log('\n3. Testing /api/auth/verify...');
      try {
        const verifyRes = await fetch(`${baseUrl}/api/auth/verify`, {
          headers: { 'Authorization': `Bearer ${regData.token}` }
        });
        const verifyData = await verifyRes.json();
        console.log('   Status:', verifyRes.status);
        console.log('   Response:', JSON.stringify(verifyData, null, 2));
      } catch (error) {
        console.log('   ❌ Verify failed:', error.message);
      }
    }
  } catch (error) {
    console.log('   ❌ Register failed:', error.message);
  }
  
  // Test 4: Login with existing user
  console.log('\n4. Testing /api/auth/login (john@mim.com)...');
  try {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@mim.com',
        password: 'test123'
      })
    });
    const loginData = await loginRes.json();
    console.log('   Status:', loginRes.status);
    console.log('   Response:', JSON.stringify(loginData, null, 2));
  } catch (error) {
    console.log('   ❌ Login failed:', error.message);
  }
}

testAPI().catch(console.error);
