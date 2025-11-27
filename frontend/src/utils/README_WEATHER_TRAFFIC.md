# Weather & Traffic Mock Data System for MIM

## Overview

This mock data system allows you to develop and test MIM's weather and traffic features **without spending any money on API calls**. The mock data is structured to **exactly match** the real API response formats from:

- **OpenWeatherMap API** (for weather data)
- **Google Directions API** (for traffic/directions data)

When you're ready to launch, simply change **one flag** and everything switches to real APIs seamlessly!

---

## Files in This System

### 1. `mockWeatherData.js`
- Contains mock weather responses matching OpenWeatherMap's exact JSON structure
- Includes weather for 5 different Dublin locations
- Helper functions for weather suitability and warnings
- **Based on**: https://openweathermap.org/current

### 2. `mockTrafficData.js`
- Contains mock traffic data matching Google Directions API structure
- Simulates realistic Dublin traffic patterns throughout the day
- Includes rush hour simulation (7-9 AM, 4-7 PM)
- Returns `duration_in_traffic` field exactly like real API
- **Based on**: https://developers.google.com/maps/documentation/directions

### 3. `apiHelpers.js`
- **Service layer** that abstracts mock vs real APIs
- Single flag (`USE_REAL_APIS`) to switch between mock and real
- Provides clean functions like `getWeatherForLocation()`, `getRouteConditions()`
- Automatically falls back to mock data if real API fails

### 4. `exampleUsage.js`
- Practical examples of how to use the API helpers
- React component examples
- Example use cases for MIM app

---

## How to Use

### During Development (Mock Data - FREE!)

```javascript
// In apiHelpers.js
const USE_REAL_APIS = false;  // ← Uses mock data (costs $0)
```

```javascript
// In your React component
import { getWeatherForLocation, getRouteConditions } from './utils/apiHelpers';

// Get weather for a location
const weather = await getWeatherForLocation(53.3498, -6.2603);
console.log(weather.main.temp);  // Returns mock data in OpenWeatherMap format

// Get full route conditions (weather + traffic)
const conditions = await getRouteConditions({
  origin: { lat: 53.35, lng: -6.26 },
  destination: { lat: 53.34, lng: -6.25 },
  mode: 'driving',
  baseDurationMinutes: 20
});

console.log(conditions.traffic.emoji);  // 🟢 or 🟡 or 🔴
console.log(conditions.adjustedDuration);  // 25 minutes (with traffic)
```

### When Ready for Production (Real APIs)

1. **Get API Keys:**
   - OpenWeatherMap: https://openweathermap.org/api
   - Google Maps: https://console.cloud.google.com/

2. **Add to Environment Variables:**
   ```bash
   # .env file
   REACT_APP_OPENWEATHER_API_KEY=your_openweather_key
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

3. **Change ONE flag:**
   ```javascript
   // In apiHelpers.js
   const USE_REAL_APIS = true;  // ← Now uses real APIs
   ```

4. **No other code changes needed!** 🎉

---

## API Response Formats

### OpenWeatherMap Format (Weather)

```json
{
  "coord": { "lon": -6.26, "lat": 53.35 },
  "weather": [
    {
      "id": 501,
      "main": "Rain",
      "description": "moderate rain",
      "icon": "10d"
    }
  ],
  "main": {
    "temp": 285.32,
    "feels_like": 283.15,
    "temp_min": 284.15,
    "temp_max": 286.48,
    "pressure": 1013,
    "humidity": 87
  },
  "wind": {
    "speed": 6.2,
    "deg": 240
  },
  "rain": {
    "1h": 3.5
  },
  "dt": 1730656800,
  "name": "Dublin"
}
```

**Temperature Conversion:**
- Kelvin to Celsius: `temp - 273.15`
- Kelvin to Fahrenheit: `(temp - 273.15) * 9/5 + 32`

### Google Directions Format (Traffic)

```json
{
  "routes": [
    {
      "legs": [
        {
          "distance": {
            "text": "5.2 km",
            "value": 5200
          },
          "duration": {
            "text": "12 mins",
            "value": 720
          },
          "duration_in_traffic": {
            "text": "18 mins",
            "value": 1080
          }
        }
      ]
    }
  ],
  "status": "OK"
}
```

---

## Mock Data Features

### Weather Data Includes:
- ✅ 5 different Dublin locations with varied weather
- ✅ Rain, clouds, clear sky scenarios
- ✅ Temperature, humidity, wind speed, pressure
- ✅ Sunrise/sunset times
- ✅ Helper functions for weather warnings

### Traffic Data Includes:
- ✅ Realistic hourly traffic patterns
- ✅ Rush hour simulation (7-9 AM, 4-7 PM heavy traffic)
- ✅ Different multipliers for transit modes:
  - Driving: Fully affected by traffic
  - Transit: 30% affected (buses slow, trains not)
  - Walking: Not affected
  - Cycling: 10% affected
- ✅ Traffic emojis (🟢 🟡 🔴)

### Traffic Schedule:
- **0-6 AM**: No traffic (1.0x)
- **7-9 AM**: Morning rush (1.4-1.7x)
- **10 AM-3 PM**: Moderate (1.15-1.25x)
- **4-7 PM**: Evening rush (1.4-1.8x)
- **8 PM-Midnight**: Light (1.0-1.15x)

---

## Common Use Cases

### 1. Display Weather on Venue Card

```javascript
const VenueCard = ({ venue }) => {
  const [weather, setWeather] = useState(null);
  
  useEffect(() => {
    getWeatherForLocation(venue.latitude, venue.longitude)
      .then(setWeather);
  }, [venue]);
  
  if (!weather) return <div>Loading...</div>;
  
  const temp = Math.round(weather.main.temp - 273.15);
  
  return (
    <div className="venue-card">
      <h3>{venue.name}</h3>
      <div className="weather">
        🌡️ {temp}°C - {weather.weather[0].description}
      </div>
    </div>
  );
};
```

### 2. Show Traffic Impact

```javascript
const TrafficInfo = ({ baseDuration, mode }) => {
  const trafficInfo = getTrafficInfo(baseDuration, mode);
  
  return (
    <div className="traffic-info">
      <span>{trafficInfo.emoji}</span>
      <span>{trafficInfo.text}</span>
      {trafficInfo.delay > 0 && (
        <span className="delay">+{trafficInfo.delay} min delay</span>
      )}
    </div>
  );
};
```

### 3. Weather-Based Recommendations

```javascript
const getRouteRecommendation = async (person, meetingPoint) => {
  const conditions = await getRouteConditions({
    origin: person.location,
    destination: meetingPoint,
    mode: person.mode,
    baseDurationMinutes: person.estimatedTime
  });
  
  if (!conditions.isWeatherSuitable && person.mode === 'bicycling') {
    return "⚠️ Rain expected - consider taking transit instead";
  }
  
  if (conditions.traffic.delay > 10 && person.mode === 'driving') {
    return `⚠️ Heavy traffic (+${conditions.traffic.delay} min). Leave early or use transit`;
  }
  
  return "✅ Good conditions for your journey";
};
```

---

## Costs

### Development (Mock Data)
- **Cost**: $0.00
- **API calls**: Unlimited
- **Perfect for**: Building features, testing, demos

### Production (Real APIs)

**OpenWeatherMap** (Current Weather):
- Free tier: 1,000 calls/day
- Pro tier: $40/month for 100,000 calls/month
- **Estimated for MIM**: ~$10-20/month with moderate usage

**Google Maps Directions API**:
- $5 per 1,000 requests
- $200/month free credit
- **Estimated for MIM**: Within free tier initially

**Total estimated cost**: $0-30/month depending on usage

---

## Testing the Mock Data

```javascript
// Run this to see examples
import { runAllExamples } from './exampleUsage';
runAllExamples();
```

This will show you:
- Current traffic conditions
- Weather for different locations
- Full route analysis with recommendations
- API configuration status

---

## Switching to Real APIs Checklist

- [ ] Get OpenWeatherMap API key
- [ ] Get Google Maps API key  
- [ ] Add keys to `.env` file
- [ ] Change `USE_REAL_APIS = true` in `apiHelpers.js`
- [ ] Test with a few real requests
- [ ] Monitor API usage in dashboards
- [ ] Set up billing alerts

---

## Important Notes

### Temperature Units
- OpenWeatherMap returns Kelvin by default
- Add `&units=metric` to get Celsius
- Add `&units=imperial` to get Fahrenheit
- Mock data uses Kelvin (matching default API)

### Rate Limits
- OpenWeatherMap free: 60 calls/minute
- Google Maps: Varies by API, but generous free tier
- Mock data: Unlimited!

### Error Handling
- `apiHelpers.js` automatically falls back to mock data if real API fails
- Always returns data (never crashes your app)

---

## File Structure in Your App

```
frontend/src/
  ├── utils/
  │   ├── mockWeatherData.js      ← Mock weather responses
  │   ├── mockTrafficData.js      ← Mock traffic patterns
  │   ├── apiHelpers.js           ← Service layer (main file to use!)
  │   └── exampleUsage.js         ← Examples and documentation
  ├── components/
  │   ├── ResultsView.jsx         ← Use getRouteConditions() here
  │   └── VenueCard.jsx           ← Use getWeatherForLocation() here
  └── App.jsx
```

---

## Quick Start

1. **Copy these 4 files** to `frontend/src/utils/`
2. **Import in your components:**
   ```javascript
   import { getWeatherForLocation, getRouteConditions } from './utils/apiHelpers';
   ```
3. **Start using!** (It's using free mock data by default)
4. **When ready for production**, change one flag and add API keys

---

## Support

- OpenWeatherMap Docs: https://openweathermap.org/api
- Google Directions API: https://developers.google.com/maps/documentation/directions
- Stack Overflow: Tag questions with `openweathermap` or `google-maps-api`

---

## Benefits of This Approach

✅ **$0 development costs** - Mock data is free  
✅ **Realistic testing** - Mock data matches real API formats  
✅ **Quick iteration** - No API delays, rate limits, or keys needed  
✅ **Seamless switch** - One flag changes everything  
✅ **Fallback safety** - Auto-reverts to mock if real API fails  
✅ **Perfect for MVP** - Launch with mock, upgrade later  
✅ **Great for demos** - No worrying about API quotas  
✅ **Predictable** - Mock data doesn't change randomly  

---

## Next Steps

1. **Now**: Use mock data to build your UI
2. **Soon**: Test with real APIs (within free tiers)
3. **Launch**: Monitor usage and upgrade plans as needed
4. **Scale**: Optimize API calls (cache, batch requests)

Good luck with MIM! 🚀
