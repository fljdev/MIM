const fetch = require('node-fetch');

async function testAcceptInvitation() {
  const shareableCode = 'MWCJPA'; // Use the code from your error
  const token = 'test-token'; // We need a valid JWT token
  
  try {
    const response = await fetch(`http://localhost:5000/api/meetups/${shareableCode}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const text = await response.text();
    console.log('Response:', text);
    
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testAcceptInvitation();
