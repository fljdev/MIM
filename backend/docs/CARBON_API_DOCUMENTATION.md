# Carbon Tracking API Documentation

## Overview

The Carbon Tracking API provides endpoints for tracking, calculating, and reporting carbon emissions from user journeys to meetups. This feature helps users understand their environmental impact and make more sustainable transport choices.

---

## Base URL

```
http://localhost:5000/api/carbon
```

---

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Log a Journey

**POST** `/api/carbon/journey`

Records a user's journey with automatic distance and carbon calculation.

#### Request Body

```json
{
  "meetup_id": 123,
  "origin": {
    "lat": 53.3498,
    "lng": -6.2603,
    "name": "Dublin City Centre"
  },
  "destination": {
    "lat": 53.3453,
    "lng": -6.2629,
    "name": "Temple Bar"
  },
  "mode_of_transport": "transit"
}
```

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| meetup_id | number | Yes | ID of the meetup |
| origin.lat | number | Yes | Origin latitude |
| origin.lng | number | Yes | Origin longitude |
| origin.name | string | No | Origin location name |
| destination.lat | number | Yes | Destination latitude |
| destination.lng | number | Yes | Destination longitude |
| destination.name | string | No | Destination location name |
| mode_of_transport | string | Yes | One of: `walking`, `driving`, `transit`, `bicycling` |

#### Response

```json
{
  "success": true,
  "journey": {
    "meetup_id": 123,
    "distance_km": 0.53,
    "carbon_emitted": 0.0318,
    "mode_of_transport": "transit",
    "origin": "Dublin City Centre",
    "destination": "Temple Bar"
  },
  "context": {
    "message": "Excellent! Minimal environmental impact.",
    "icon": "🌱",
    "comparison": "Equivalent to charging a smartphone a few times"
  },
  "recommendation": {
    "alternatives": ["bicycling", "walking"],
    "tip": "Great choice! For shorter distances, walking or cycling can reduce emissions to zero",
    "savingsPotential": 100
  }
}
```

#### Status Codes

- `200` - Success
- `400` - Invalid request body
- `401` - Unauthorized (invalid/missing token)
- `403` - User is not a participant in the meetup
- `500` - Server error

---

### 2. Get User Carbon Data

**GET** `/api/carbon/user/:id`

Retrieves total carbon emissions and journey history for a specific user.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | User ID (must match authenticated user) |

#### Response

```json
{
  "user_id": 123,
  "total_carbon_kg": 45.6789,
  "total_distance_km": 380.5,
  "journey_count": 12,
  "average_per_journey": 3.8066,
  "journeys": [
    {
      "meetup_id": 5,
      "meetup_code": "ABC123",
      "meetup_title": "Coffee Meetup",
      "meetup_vibe": "coffee",
      "distance_km": 8.5,
      "mode": "transit",
      "carbon_emitted": 0.51,
      "date": "2025-12-15T14:30:00.000Z"
    }
  ],
  "by_mode": {
    "transit": {
      "count": 5,
      "emissions": 3.45,
      "distance": 57.5
    },
    "driving": {
      "count": 4,
      "emissions": 28.8,
      "distance": 240.0
    },
    "walking": {
      "count": 3,
      "emissions": 0.0,
      "distance": 12.5
    }
  }
}
```

#### Privacy Note

Users can only view their own carbon data. Attempting to access another user's data will result in a 403 Forbidden error.

#### Status Codes

- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (trying to access another user's data)
- `500` - Server error

---

### 3. Get Meetup Carbon Data

**GET** `/api/carbon/meetup/:id`

Retrieves carbon emissions data for all participants in a specific meetup.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Meetup ID |

#### Response

```json
{
  "meetup_id": 5,
  "meetup_code": "ABC123",
  "meetup_title": "Coffee Meetup",
  "meetup_vibe": "coffee",
  "venue_name": "The Stage Door Cafe",
  "total_carbon_kg": 2.4567,
  "total_distance_km": 24.3,
  "participant_count": 2,
  "average_carbon_per_participant": 1.2284,
  "participants": [
    {
      "name": "John Doe",
      "location": "Dublin City Centre",
      "distance_km": 8.5,
      "mode": "transit",
      "carbon_emitted": 0.51
    },
    {
      "name": "Jane Smith",
      "location": "Rathmines",
      "distance_km": 15.8,
      "mode": "driving",
      "carbon_emitted": 1.896
    }
  ]
}
```

#### Status Codes

- `200` - Success
- `401` - Unauthorized
- `403` - User is not a participant in the meetup
- `404` - Meetup not found
- `500` - Server error

---

### 4. Get Global Carbon Statistics

**GET** `/api/carbon/stats`

Returns global carbon statistics, mode distribution, and leaderboard.

#### Response

```json
{
  "global_stats": {
    "total_users": 150,
    "total_journeys": 1247,
    "total_carbon_kg": 456.8,
    "total_distance_km": 3806.7,
    "average_per_journey": 0.3663,
    "carbon_saved_vs_driving": 1234.5
  },
  "mode_distribution": {
    "walking": {
      "count": 450,
      "percentage": 36.1,
      "total_emissions": 0.0,
      "total_distance": 562.5
    },
    "bicycling": {
      "count": 320,
      "percentage": 25.7,
      "total_emissions": 0.0,
      "total_distance": 896.3
    },
    "transit": {
      "count": 387,
      "percentage": 31.0,
      "total_emissions": 142.5,
      "total_distance": 2375.0
    },
    "driving": {
      "count": 90,
      "percentage": 7.2,
      "total_emissions": 314.3,
      "total_distance": 2618.3
    }
  },
  "leaderboard": [
    {
      "rank": 1,
      "user_id": 42,
      "user_name": "Eco Warrior",
      "total_carbon_kg": 2.5,
      "journey_count": 15,
      "average_per_journey": 0.1667,
      "badge": "Green Champion"
    },
    {
      "rank": 2,
      "user_id": 87,
      "user_name": "Transit Fan",
      "total_carbon_kg": 5.8,
      "journey_count": 12,
      "average_per_journey": 0.4833,
      "badge": "Eco Warrior"
    }
  ]
}
```

#### Notes

- Leaderboard shows users with **lowest average emissions** per journey
- Users must have at least 3 journeys to appear on the leaderboard
- Limited to top 10 users

#### Status Codes

- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

### 5. Calculate Carbon (Preview)

**POST** `/api/carbon/calculate`

Calculates carbon emissions for a journey without logging it. Useful for previewing emissions before committing to a journey.

#### Request Body

```json
{
  "origin": {
    "lat": 53.3498,
    "lng": -6.2603
  },
  "destination": {
    "lat": 53.3453,
    "lng": -6.2629
  },
  "mode_of_transport": "driving"
}
```

#### Response

```json
{
  "distance_km": 0.53,
  "mode_of_transport": "driving",
  "carbon_emitted": 0.0636,
  "context": {
    "range": { "min": 0, "max": 0.1 },
    "message": "Excellent! Minimal environmental impact.",
    "icon": "🌱",
    "color": "green",
    "comparison": "Equivalent to charging a smartphone a few times"
  },
  "alternatives": [
    {
      "mode": "walking",
      "carbon_emitted": 0.0,
      "savings": 0.0636,
      "percent_savings": 100,
      "is_better": true
    },
    {
      "mode": "bicycling",
      "carbon_emitted": 0.0,
      "savings": 0.0636,
      "percent_savings": 100,
      "is_better": true
    },
    {
      "mode": "transit",
      "carbon_emitted": 0.0318,
      "savings": 0.0318,
      "percent_savings": 50,
      "is_better": true
    }
  ]
}
```

#### Status Codes

- `200` - Success
- `400` - Invalid request body
- `401` - Unauthorized
- `500` - Server error

---

### 6. Update Participant Carbon Data

**PATCH** `/api/carbon/meetup/:id/update`

Updates carbon data for a single participant when the meetup venue is confirmed.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Meetup ID |

#### Request Body

```json
{
  "venue_lat": 53.3453,
  "venue_lng": -6.2629
}
```

#### Response

```json
{
  "success": true,
  "updated": {
    "distance_km": 8.5,
    "carbon_emitted": 0.51,
    "mode": "transit"
  }
}
```

#### Status Codes

- `200` - Success
- `400` - Missing required fields
- `401` - Unauthorized
- `404` - Participant record not found
- `500` - Server error

---

### 7. Batch Update Meetup Carbon Data

**POST** `/api/carbon/meetup/:id/batch-update`

Updates carbon data for all participants when a meetup venue is confirmed. This is typically called automatically by the system.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Meetup ID |

#### Request Body

```json
{
  "venue_lat": 53.3453,
  "venue_lng": -6.2629
}
```

#### Response

```json
{
  "success": true,
  "message": "Carbon data updated for all participants",
  "meetup_id": 5,
  "total_carbon_kg": 2.406,
  "total_distance_km": 24.3,
  "participant_count": 2,
  "updates": [
    {
      "participant_name": "John Doe",
      "distance_km": 8.5,
      "carbon_emitted": 0.51,
      "mode": "transit"
    },
    {
      "participant_name": "Jane Smith",
      "distance_km": 15.8,
      "carbon_emitted": 1.896,
      "mode": "driving"
    }
  ]
}
```

#### Status Codes

- `200` - Success
- `400` - Missing required fields
- `401` - Unauthorized
- `403` - User is not authorized (not organizer or participant)
- `500` - Server error

---

### 8. Compare Transport Modes

**GET** `/api/carbon/comparison?distance=10`

Returns carbon comparison across different transport modes for a given distance.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| distance | number | Yes | Distance in kilometers (0-1000) |

#### Response

```json
{
  "distance_km": 10,
  "comparisons": [
    {
      "mode": "walking",
      "carbon_emitted": 0.0,
      "formatted": "0.00 kg CO₂",
      "relative_impact": 0
    },
    {
      "mode": "bicycling",
      "carbon_emitted": 0.0,
      "formatted": "0.00 kg CO₂",
      "relative_impact": 0
    },
    {
      "mode": "transit",
      "carbon_emitted": 0.6,
      "formatted": "0.60 kg CO₂",
      "relative_impact": 50
    },
    {
      "mode": "driving",
      "carbon_emitted": 1.2,
      "formatted": "1.20 kg CO₂",
      "relative_impact": 100
    }
  ],
  "recommendation": "Walking and cycling produce zero emissions!"
}
```

#### Status Codes

- `200` - Success
- `400` - Invalid distance parameter
- `401` - Unauthorized
- `500` - Server error

---

## Emission Factors

The following emission factors are used (kg CO2 per kilometer):

| Mode | Emission Factor | Description |
|------|----------------|-------------|
| Driving | 0.12 | Average petrol/diesel car |
| Transit | 0.06 | Public transport (bus/train average) |
| Walking | 0.00 | Zero emissions |
| Bicycling | 0.00 | Zero emissions |

---

## Example Usage

### Example 1: Log a Journey After Meetup

```javascript
// User just attended a meetup and wants to log their journey

const response = await fetch('http://localhost:5000/api/carbon/journey', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    meetup_id: 123,
    origin: {
      lat: 53.3498,
      lng: -6.2603,
      name: 'My Home'
    },
    destination: {
      lat: 53.3453,
      lng: -6.2629,
      name: 'Coffee Shop'
    },
    mode_of_transport: 'transit'
  })
});

const data = await response.json();
console.log(`You emitted ${data.journey.carbon_emitted} kg CO₂`);
console.log(`Tip: ${data.recommendation.tip}`);
```

### Example 2: View Personal Carbon History

```javascript
// Get your carbon footprint across all meetups

const userId = 123;
const response = await fetch(`http://localhost:5000/api/carbon/user/${userId}`, {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const data = await response.json();
console.log(`Total carbon: ${data.total_carbon_kg} kg`);
console.log(`Average per journey: ${data.average_per_journey} kg`);
console.log(`Journey count: ${data.journey_count}`);

// Show breakdown by mode
for (const [mode, stats] of Object.entries(data.by_mode)) {
  console.log(`${mode}: ${stats.count} journeys, ${stats.emissions} kg CO₂`);
}
```

### Example 3: Preview Emissions Before Choosing Transport

```javascript
// User wants to compare emissions before deciding transport mode

const response = await fetch('http://localhost:5000/api/carbon/calculate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    origin: { lat: 53.3498, lng: -6.2603 },
    destination: { lat: 53.3453, lng: -6.2629 },
    mode_of_transport: 'driving'
  })
});

const data = await response.json();

// Show alternatives
data.alternatives.forEach(alt => {
  if (alt.is_better) {
    console.log(`Switch to ${alt.mode} and save ${alt.savings} kg CO₂ (${alt.percent_savings}% reduction)`);
  }
});
```

### Example 4: View Meetup Carbon Summary

```javascript
// Get carbon data for all participants in a meetup

const meetupId = 5;
const response = await fetch(`http://localhost:5000/api/carbon/meetup/${meetupId}`, {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const data = await response.json();
console.log(`Meetup total carbon: ${data.total_carbon_kg} kg`);
console.log(`Average per participant: ${data.average_carbon_per_participant} kg`);

// Show each participant's contribution
data.participants.forEach(p => {
  console.log(`${p.name}: ${p.carbon_emitted} kg (${p.mode}, ${p.distance_km} km)`);
});
```

### Example 5: Check Global Statistics

```javascript
// View platform-wide carbon statistics and leaderboard

const response = await fetch('http://localhost:5000/api/carbon/stats', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const data = await response.json();

console.log('Global Statistics:');
console.log(`Total users tracked: ${data.global_stats.total_users}`);
console.log(`Total carbon saved vs all driving: ${data.global_stats.carbon_saved_vs_driving} kg`);

console.log('\nMode Distribution:');
for (const [mode, stats] of Object.entries(data.mode_distribution)) {
  console.log(`${mode}: ${stats.percentage}% (${stats.count} journeys)`);
}

console.log('\nTop 3 Eco-Friendly Users:');
data.leaderboard.slice(0, 3).forEach(user => {
  console.log(`${user.rank}. ${user.user_name} - ${user.average_per_journey} kg avg (${user.badge})`);
});
```

---

## Integration with Meetup Flow

### Automatic Carbon Tracking

When a meetup venue is confirmed, you can automatically update carbon data for all participants:

```javascript
// In your venue confirmation handler

async function confirmMeetupVenue(meetupId, venueData, authToken) {
  // First confirm the venue
  await confirmVenue(meetupId, venueData);
  
  // Then update carbon data for all participants
  const response = await fetch(`http://localhost:5000/api/carbon/meetup/${meetupId}/batch-update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      venue_lat: venueData.latitude,
      venue_lng: venueData.longitude
    })
  });
  
  const carbonData = await response.json();
  
  // Display carbon summary to users
  console.log(`Total meetup carbon: ${carbonData.total_carbon_kg} kg`);
  
  return carbonData;
}
```

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common error scenarios:

1. **Missing Authentication**
   - Status: 401
   - Error: "No token provided" or "Invalid token"

2. **Invalid Data**
   - Status: 400
   - Error: "Missing required fields: ..."

3. **Permission Denied**
   - Status: 403
   - Error: "You are not a participant in this meetup"

4. **Resource Not Found**
   - Status: 404
   - Error: "Meetup not found"

5. **Server Error**
   - Status: 500
   - Error: "Failed to ..." (with descriptive message)

---

## Database Schema

### Extended meetup_participants Table

```sql
-- New columns added by migration 005
distance_km DECIMAL(10, 2) DEFAULT 0
carbon_emitted DECIMAL(10, 4) DEFAULT 0
```

### Database Views

Two views are created for efficient queries:

1. **carbon_user_stats** - Aggregated user carbon statistics
2. **carbon_meetup_stats** - Aggregated meetup carbon statistics

### Database Function

**calculate_carbon_emission(distance_km, transit_mode)** - PL/pgSQL function for server-side calculations

---

## Testing

Run the test suite:

```bash
cd backend
npm test -- carbon.test.js
```

Test coverage includes:
- Carbon emission calculations
- Distance calculations (Haversine formula)
- Edge cases and error handling
- Performance tests
- Integration scenarios

---

## Future Enhancements

Potential improvements for real API integration:

1. **Replace Mock Distance Calculator**
   - Integrate Google Maps Distance Matrix API
   - Account for actual routes (not straight-line distance)
   - Consider traffic and route variations

2. **Enhanced Emission Factors**
   - Vehicle-specific factors (electric vs. petrol)
   - Real-time data from transport APIs
   - Regional variations

3. **Carbon Offset Integration**
   - Partner with carbon offset services
   - Allow users to offset their emissions
   - Track offset purchases

4. **Advanced Analytics**
   - Time-series carbon trends
   - Seasonal variations
   - Predictive recommendations

---

## Support

For questions or issues with the Carbon Tracking API, please contact the development team or file an issue in the repository.

**Version:** 1.0.0  
**Last Updated:** December 2025
