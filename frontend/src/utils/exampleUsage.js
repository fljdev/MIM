// Example Usage - How to integrate weather and traffic into MiM app
// This file shows practical examples of using the API helpers

import { 
  getWeatherForLocation, 
  getRouteConditions,
  getTrafficInfo,
  getCurrentTraffic,
  getApiStatus
} from './apiHelpers';

// ============================================
// EXAMPLE 1: Display weather on results page
// ============================================
export const displayWeatherExample = async (venue) => {
  try {
    const weather = await getWeatherForLocation(venue.latitude, venue.longitude);
    
    // Extract useful info
    const temp = Math.round(weather.main.temp - 273.15); // Convert Kelvin to Celsius
    const description = weather.weather[0].description;
    const icon = weather.weather[0].icon;
    
    // Display to user
    console.log(`Weather at ${venue.name}:`);
    console.log(`${temp}°C - ${description}`);
    console.log(`Icon: https://openweathermap.org/img/wn/${icon}@2x.png`);
    
    // Check if outdoor seating is good
    const isGoodWeather = weather.weather[0].main === 'Clear' || weather.weather[0].main === 'Clouds';
    if (isGoodWeather && temp > 15) {
      console.log('✅ Great weather for outdoor seating!');
    }
    
    return {
      temp,
      description,
      icon,
      isGoodForOutdoors: isGoodWeather && temp > 15
    };
  } catch (error) {
    console.error('Error displaying weather:', error);
    return null;
  }
};

// ============================================
// EXAMPLE 2: Show traffic impact on travel time
// ============================================
export const showTrafficImpactExample = (person) => {
  // Person's route to meeting point
  const baseTravelTime = 25; // minutes
  const transitMode = person.transitMode; // "driving", "walking", etc.
  
  // Get traffic info
  const trafficInfo = getTrafficInfo(baseTravelTime, transitMode);
  
  console.log(`\nTraffic Info for ${person.name}:`);
  console.log(`${trafficInfo.emoji} ${trafficInfo.text}`);
  console.log(`Base travel time: ${baseTravelTime} minutes`);
  console.log(`With traffic: ${trafficInfo.totalTime} minutes`);
  console.log(`Delay: ${trafficInfo.delay} minutes`);
  
  return trafficInfo;
};

// ============================================
// EXAMPLE 3: Full route analysis (weather + traffic)
// ============================================
export const analyzeFullRouteExample = async () => {
  // Example: Two people meeting
  const person1 = {
    name: 'Alice',
    location: { lat: 53.3498, lng: -6.2603 }, // Dublin City Center
    mode: 'driving'
  };
  
  const person2 = {
    name: 'Bob', 
    location: { lat: 53.2945, lng: -6.1371 }, // Dun Laoghaire
    mode: 'bicycling'
  };
  
  // Meeting point (Temple Bar)
  const meetingPoint = { lat: 53.3456, lng: -6.2644 };
  
  // Analyze Alice's route
  console.log('\n=== Analyzing Alice\'s Route ===');
  const aliceConditions = await getRouteConditions({
    origin: person1.location,
    destination: meetingPoint,
    mode: person1.mode,
    baseDurationMinutes: 15
  });
  
  if (aliceConditions) {
    console.log(`Weather at origin: ${aliceConditions.origin.weather.weather[0].description}`);
    console.log(`Traffic: ${aliceConditions.traffic.text}`);
    console.log(`Adjusted duration: ${aliceConditions.adjustedDuration} minutes`);
    
    if (aliceConditions.recommendations.length > 0) {
      console.log('\nRecommendations:');
      aliceConditions.recommendations.forEach(rec => {
        console.log(`${rec.type}: ${rec.message}`);
      });
    }
  }
  
  // Analyze Bob's route
  console.log('\n=== Analyzing Bob\'s Route ===');
  const bobConditions = await getRouteConditions({
    origin: person2.location,
    destination: meetingPoint,
    mode: person2.mode,
    baseDurationMinutes: 35
  });
  
  if (bobConditions) {
    console.log(`Weather at origin: ${bobConditions.origin.weather.weather[0].description}`);
    console.log(`Is weather suitable for cycling? ${bobConditions.isWeatherSuitable ? 'Yes' : 'No'}`);
    console.log(`Adjusted duration: ${bobConditions.adjustedDuration} minutes`);
    
    if (bobConditions.origin.warning) {
      console.log(`⚠️ ${bobConditions.origin.warning}`);
    }
  }
  
  return { aliceConditions, bobConditions };
};

// ============================================
// EXAMPLE 4: Filter venues by weather
// ============================================
export const filterVenuesByWeatherExample = async (venues) => {
  console.log('\n=== Filtering Venues by Weather ===');
  
  const venuesWithWeather = await Promise.all(
    venues.map(async (venue) => {
      const weather = await getWeatherForLocation(venue.latitude, venue.longitude);
      const temp = Math.round(weather.main.temp - 273.15);
      const isRaining = weather.weather[0].main === 'Rain';
      
      return {
        ...venue,
        weather: {
          temp,
          description: weather.weather[0].description,
          isRaining,
          hasOutdoorSeating: venue.hasOutdoorSeating, // from your venue data
          isGoodForOutdoors: !isRaining && temp > 15 && venue.hasOutdoorSeating
        }
      };
    })
  );
  
  // Filter to show only venues with good outdoor seating conditions
  const goodOutdoorVenues = venuesWithWeather.filter(v => v.weather.isGoodForOutdoors);
  
  console.log(`Total venues: ${venues.length}`);
  console.log(`Venues with good outdoor seating weather: ${goodOutdoorVenues.length}`);
  
  return goodOutdoorVenues;
};

// ============================================
// EXAMPLE 5: Display current traffic status
// ============================================
export const displayTrafficStatusExample = () => {
  const traffic = getCurrentTraffic();
  
  console.log('\n=== Current Traffic Status ===');
  console.log(`Level: ${traffic.level}`);
  console.log(`Description: ${traffic.description}`);
  console.log(`Traffic multiplier: ${traffic.multiplier}x`);
  
  // Example: Calculate impact for 30-minute drive
  const baseDrive = 30;
  const trafficInfo = getTrafficInfo(baseDrive, 'driving');
  console.log(`\nIf you're driving (${baseDrive} min normally):`);
  console.log(`Current estimate: ${trafficInfo.totalTime} minutes`);
  console.log(`Delay: ${trafficInfo.delay} minutes`);
};

// ============================================
// EXAMPLE 6: React Component Example
// ============================================
export const WeatherTrafficComponentExample = () => {
  /*
  // In your React component:
  
  import React, { useState, useEffect } from 'react';
  import { getRouteConditions } from './utils/apiHelpers';
  
  const RouteInfo = ({ origin, destination, mode, baseDuration }) => {
    const [conditions, setConditions] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      const fetchConditions = async () => {
        const data = await getRouteConditions({
          origin,
          destination,
          mode,
          baseDurationMinutes: baseDuration
        });
        setConditions(data);
        setLoading(false);
      };
      
      fetchConditions();
    }, [origin, destination, mode, baseDuration]);
    
    if (loading) return <div>Loading conditions...</div>;
    if (!conditions) return <div>Error loading data</div>;
    
    return (
      <div className="route-conditions">
        <div className="weather">
          <h3>Weather</h3>
          <p>{conditions.origin.weather.weather[0].description}</p>
          <p>{Math.round(conditions.origin.weather.main.temp - 273.15)}°C</p>
          {conditions.origin.warning && (
            <div className="warning">{conditions.origin.warning}</div>
          )}
        </div>
        
        <div className="traffic">
          <h3>Traffic</h3>
          <p>{conditions.traffic.emoji} {conditions.traffic.text}</p>
          <p>Estimated time: {conditions.adjustedDuration} minutes</p>
        </div>
        
        {conditions.recommendations.length > 0 && (
          <div className="recommendations">
            <h3>Recommendations</h3>
            {conditions.recommendations.map((rec, idx) => (
              <div key={idx} className={`rec-${rec.type}`}>
                {rec.message}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default RouteInfo;
  */
};

// ============================================
// EXAMPLE 7: Check API configuration (for settings page)
// ============================================
export const checkApiConfigExample = () => {
  const status = getApiStatus();
  
  console.log('\n=== API Configuration ===');
  console.log(`Using real APIs: ${status.usingRealApis ? 'Yes' : 'No (Mock Data)'}`);
  console.log(`Weather API: ${status.apis.weather}`);
  console.log(`Traffic API: ${status.apis.traffic}`);
  console.log(`Weather API Key configured: ${status.weatherApiConfigured ? 'Yes' : 'No'}`);
  console.log(`Google Maps API Key configured: ${status.googleMapsApiConfigured ? 'Yes' : 'No'}`);
  
  if (!status.usingRealApis) {
    console.log('\n💡 Tip: Change USE_REAL_APIS to true in apiHelpers.js when ready');
  }
  
  return status;
};

// ============================================
// RUN ALL EXAMPLES
// ============================================
export const runAllExamples = async () => {
  console.log('====================================');
  console.log('MIM Weather & Traffic Examples');
  console.log('====================================');
  
  // Check API config first
  checkApiConfigExample();
  
  // Show current traffic
  displayTrafficStatusExample();
  
  // Analyze full routes
  await analyzeFullRouteExample();
  
  console.log('\n====================================');
  console.log('Examples complete!');
  console.log('====================================');
};

// Uncomment to run examples:
// runAllExamples();
