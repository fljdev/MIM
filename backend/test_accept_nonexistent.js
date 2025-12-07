const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibWltYWRtaW5AcHJvdG9uLm1lIiwicm9sZSI6ImFwcF91c2VyIiwiaWF0IjoxNzY1MTA2ODM5LCJleHAiOjE3NjU3MTE2Mzl9.YFE2r9Ks4Cew-1JGgMGAS-EVkJfzsKtbqzvURK8FjPw';

async function testAcceptNonexistent() {
  const meetupCode = 'NONEXISTENT'; // Non-existent meetup
  
  try {
    console.log(`Accepting non-existent meetup ${meetupCode}...`);
    
    const response = await fetch(`http://localhost:5000/api/meetups/${meetupCode}/accept`, {
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

testAcceptNonexistent();
