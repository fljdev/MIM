const fetch = require('node-fetch');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibWltYWRtaW5AcHJvdG9uLm1lIiwicm9sZSI6ImFwcF91c2VyIiwiaWF0IjoxNzY1MTA2ODM5LCJleHAiOjE3NjU3MTE2Mzl9.YFE2r9Ks4Cew-1JGgMGAS-EVkJfzsKtbqzvURK8FjPw';

async function testCreateMeetup() {
  const meetupData = {
    title: 'Test Coffee Meetup',
    vibe: 'Coffee',
    budget_level: '€€',
    fairness_mode: 'fastest',
    creator_location: {
      name: 'Dublin City Centre',
      lat: 53.349805,
      lng: -6.26031
    },
    transit_mode: 'walking',
    privacy_mode: false
  };
  
  try {
    console.log('Creating meetup...');
    
    const response = await fetch('http://localhost:5000/api/meetups/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(meetupData)
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const text = await response.text();
    console.log('Response:', text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('\nMeetup created successfully!');
      console.log('Meetup code:', data.meetup?.meetup_code);
      console.log('Shareable URL:', data.meetup?.shareable_url);
    }
    
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testCreateMeetup();
