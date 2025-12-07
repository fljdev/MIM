const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibWltYWRtaW5AcHJvdG9uLm1lIiwicm9sZSI6ImFwcF91c2VyIiwiaWF0IjoxNzY1MTA2ODM5LCJleHAiOjE3NjU3MTE2Mzl9.YFE2r9Ks4Cew-1JGgMGAS-EVkJfzsKtbqzvURK8FjPw';

async function testAcceptMeetup() {
  const meetupCode = 'T3Z855'; // The meetup we just created
  
  try {
    console.log(`Accepting meetup ${meetupCode}...`);
    
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
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('\nMeetup accepted successfully!');
      console.log('Meetup ID:', data.meetup_id);
      console.log('Message:', data.message);
    } else {
      console.log('\nFailed to accept meetup');
    }
    
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testAcceptMeetup();
