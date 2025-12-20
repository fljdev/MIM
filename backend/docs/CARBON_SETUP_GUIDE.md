# Carbon Tracking Feature - Setup Guide

## Overview

This guide walks you through setting up and integrating the carbon tracking feature into your MiM application.

---

## Prerequisites

- Node.js and npm installed
- PostgreSQL database running
- Existing MiM backend setup
- Access to database credentials

---

## Installation Steps

### Step 1: Run Database Migration

The carbon tracking feature requires database schema changes. Run the migration script:

#### Option A: Using the migration runner

```bash
cd backend
node db/run_migration.js
```

#### Option B: Direct SQL execution

```bash
# Connect to PostgreSQL
psql -U your_username -d mim

# Run migration
\i backend/db/migrations/005_carbon_tracking.sql
```

#### Option C: Using the Node.js pg client

```javascript
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://user:password@localhost:5432/mim'
});

const migrationSQL = fs.readFileSync('./db/migrations/005_carbon_tracking.sql', 'utf8');

pool.query(migrationSQL)
  .then(() => console.log('Migration completed successfully'))
  .catch(err => console.error('Migration failed:', err))
  .finally(() => pool.end());
```

### Step 2: Verify Migration

Check that the migration was successful:

```sql
-- Check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'meetup_participants' 
  AND column_name IN ('distance_km', 'carbon_emitted');

-- Check if views were created
SELECT table_name 
FROM information_schema.views 
WHERE table_name IN ('carbon_user_stats', 'carbon_meetup_stats');

-- Check if function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'calculate_carbon_emission';
```

Expected output:
- 2 new columns: `distance_km`, `carbon_emitted`
- 2 new views: `carbon_user_stats`, `carbon_meetup_stats`
- 1 new function: `calculate_carbon_emission`

### Step 3: Restart Server

The server.js file has been updated to include carbon routes. Restart your backend server:

```bash
cd backend
npm start
```

You should see:
```
✅ Database connected: ...
🚀 MiM Server running on port 5000
```

### Step 4: Verify API Endpoints

Test that the carbon endpoints are working:

```bash
# Health check
curl http://localhost:5000/health

# Test carbon comparison endpoint (requires auth token)
curl -X GET \
  'http://localhost:5000/api/carbon/comparison?distance=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## Integration Guide

### Automatic Carbon Tracking on Meetup Confirmation

When a meetup venue is confirmed, automatically calculate carbon for all participants:

```javascript
// In your meetup confirmation handler (e.g., in meetups.js)

router.post('/:id/confirm-venue', authenticateToken, async (req, res) => {
  const { meetupId } = req.params;
  const { venue_id, venue_lat, venue_lng } = req.body;
  
  // ... existing venue confirmation logic ...
  
  // Automatically update carbon data for all participants
  try {
    const carbonResponse = await fetch(`http://localhost:5000/api/carbon/meetup/${meetupId}/batch-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      },
      body: JSON.stringify({
        venue_lat: venue_lat,
        venue_lng: venue_lng
      })
    });
    
    const carbonData = await carbonResponse.json();
    console.log(`Carbon tracked: ${carbonData.total_carbon_kg} kg for ${carbonData.participant_count} participants`);
  } catch (error) {
    console.error('Failed to update carbon data:', error);
    // Don't fail the venue confirmation if carbon tracking fails
  }
  
  // ... rest of confirmation logic ...
});
```

### Display Carbon Data in Meetup Lobby

Show carbon information to participants in the meetup lobby:

```javascript
// In your lobby endpoint or frontend component

async function getMeetupWithCarbon(meetupId, authToken) {
  // Get regular meetup data
  const meetupResponse = await fetch(`http://localhost:5000/api/meetups/${meetupId}/lobby`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const meetupData = await meetupResponse.json();
  
  // Get carbon data
  const carbonResponse = await fetch(`http://localhost:5000/api/carbon/meetup/${meetupId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const carbonData = await carbonResponse.json();
  
  return {
    ...meetupData,
    carbon: carbonData
  };
}
```

### Show Carbon Preview Before Transport Selection

Help users make informed transport choices:

```javascript
// When user is selecting transport mode

async function previewCarbonImpact(origin, destination, authToken) {
  const modes = ['walking', 'bicycling', 'transit', 'driving'];
  const previews = [];
  
  for (const mode of modes) {
    const response = await fetch('http://localhost:5000/api/carbon/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        origin: origin,
        destination: destination,
        mode_of_transport: mode
      })
    });
    
    const data = await response.json();
    previews.push({
      mode: mode,
      carbon: data.carbon_emitted,
      context: data.context
    });
  }
  
  return previews;
}
```

### Display User Carbon Dashboard

Show user their personal carbon statistics:

```javascript
// In user profile or dashboard

async function getUserCarbonDashboard(userId, authToken) {
  const response = await fetch(`http://localhost:5000/api/carbon/user/${userId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  const data = await response.json();
  
  return {
    totalCarbon: data.total_carbon_kg,
    totalDistance: data.total_distance_km,
    journeyCount: data.journey_count,
    averagePerJourney: data.average_per_journey,
    modeBreakdown: data.by_mode,
    recentJourneys: data.journeys.slice(0, 5)
  };
}
```

---

## Frontend Integration Hooks

### React Hook Example

```javascript
// useCarbon.js - React hook for carbon data

import { useState, useEffect } from 'react';

export function useUserCarbon(userId, authToken) {
  const [carbonData, setCarbonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCarbon() {
      try {
        const response = await fetch(`/api/carbon/user/${userId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch carbon data');
        }
        
        const data = await response.json();
        setCarbonData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (userId && authToken) {
      fetchCarbon();
    }
  }, [userId, authToken]);

  return { carbonData, loading, error };
}

// Usage in component
function CarbonDashboard({ userId, authToken }) {
  const { carbonData, loading, error } = useUserCarbon(userId, authToken);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Your Carbon Footprint</h2>
      <p>Total: {carbonData.total_carbon_kg} kg CO₂</p>
      <p>Journeys: {carbonData.journey_count}</p>
      <p>Average: {carbonData.average_per_journey} kg per journey</p>
    </div>
  );
}
```

---

## Database Queries

### Useful Queries for Development

```sql
-- Get carbon stats for a user
SELECT * FROM carbon_user_stats WHERE user_id = 123;

-- Get carbon stats for a meetup
SELECT * FROM carbon_meetup_stats WHERE meetup_id = 5;

-- Find users with highest emissions
SELECT user_id, total_carbon_kg, journey_count
FROM carbon_user_stats
ORDER BY total_carbon_kg DESC
LIMIT 10;

-- Find users with zero emissions (sustainable heroes)
SELECT user_id, journey_count
FROM carbon_user_stats
WHERE total_carbon_kg = 0
ORDER BY journey_count DESC;

-- Get mode distribution
SELECT 
  transit_mode,
  COUNT(*) as count,
  SUM(carbon_emitted) as total_emissions,
  AVG(carbon_emitted) as avg_emissions
FROM meetup_participants
WHERE carbon_emitted > 0
GROUP BY transit_mode
ORDER BY total_emissions DESC;
```

---

## Testing

### Manual API Testing

Use the provided test file to verify calculations:

```bash
cd backend
npm test -- carbon.test.js
```

### API Endpoint Testing with cURL

```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.token')

# 2. Calculate carbon preview
curl -X POST http://localhost:5000/api/carbon/calculate \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "origin": {"lat": 53.3498, "lng": -6.2603},
    "destination": {"lat": 53.3453, "lng": -6.2629},
    "mode_of_transport": "driving"
  }'

# 3. Get user carbon data
curl http://localhost:5000/api/carbon/user/1 \
  -H "Authorization: Bearer $TOKEN"

# 4. Get global stats
curl http://localhost:5000/api/carbon/stats \
  -H "Authorization: Bearer $TOKEN"

# 5. Compare modes
curl 'http://localhost:5000/api/carbon/comparison?distance=10' \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### Migration Fails

**Problem:** Migration script fails with constraint errors

**Solution:** Check if columns already exist:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'meetup_participants' 
  AND column_name IN ('distance_km', 'carbon_emitted');
```

If columns exist, the migration has already run. If not, check PostgreSQL logs for specific errors.

### Endpoints Return 404

**Problem:** Carbon endpoints return 404 Not Found

**Solution:** 
1. Verify server.js includes carbon routes:
   ```javascript
   const carbonRoutes = require('./routes/carbonRoutes');
   app.use('/api/carbon', carbonRoutes);
   ```
2. Restart the server
3. Check server logs for route registration

### Permission Errors

**Problem:** 403 Forbidden when accessing endpoints

**Solution:**
1. Verify JWT token is valid
2. For user endpoints: Ensure user_id matches authenticated user
3. For meetup endpoints: Ensure user is a participant

### Calculation Issues

**Problem:** Distance or carbon calculations seem incorrect

**Solution:**
1. Verify coordinates are valid (lat: -90 to 90, lng: -180 to 180)
2. Check mode of transport is one of: walking, bicycling, transit, driving
3. Review emission factors in carbonCalculator.js
4. Test with known distances using the comparison endpoint

---

## Performance Optimization

### Database Indexes

The migration creates the following indexes for optimal performance:

```sql
-- Indexes created by migration
idx_participants_user_carbon      -- For user carbon queries
idx_participants_meetup_carbon    -- For meetup carbon queries
idx_participants_joined_date      -- For date-based queries
```

### Caching Recommendations

For high-traffic scenarios, consider caching:

1. **Global stats** - Cache for 5-10 minutes
2. **Leaderboard** - Cache for 10-15 minutes
3. **User carbon data** - Cache with TTL after updates

Example caching with Node.js:

```javascript
const NodeCache = require('node-cache');
const statsCache = new NodeCache({ stdTTL: 300 }); // 5 minutes

router.get('/stats', authenticateToken, async (req, res) => {
  const cacheKey = 'global_carbon_stats';
  const cached = statsCache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  // Fetch from database
  const stats = await fetchCarbonStats(pool);
  
  // Cache the result
  statsCache.set(cacheKey, stats);
  
  res.json(stats);
});
```

---

## Monitoring and Logging

### Recommended Logging

Add logging for carbon calculations:

```javascript
// In carbonRoutes.js

console.log(`[CARBON] User ${userId} logged journey: ${distanceKm}km, ${carbonEmitted}kg CO₂`);
console.log(`[CARBON] Meetup ${meetupId} total: ${totalCarbon}kg CO₂`);
```

### Analytics Events

Track carbon-related events for analytics:

```javascript
// Example analytics events to track

trackEvent('carbon_journey_logged', {
  user_id: userId,
  meetup_id: meetupId,
  distance_km: distanceKm,
  carbon_kg: carbonEmitted,
  mode: modeOfTransport
});

trackEvent('carbon_dashboard_viewed', {
  user_id: userId,
  total_carbon_kg: totalCarbon
});

trackEvent('transport_mode_changed', {
  user_id: userId,
  from_mode: oldMode,
  to_mode: newMode,
  carbon_savings: savings
});
```

---

## Security Considerations

### Data Privacy

1. **User Data Access**: Users can only access their own carbon data
2. **Meetup Data Access**: Only participants can view meetup carbon data
3. **Leaderboard**: User names are visible, but detailed journey data is private

### Input Validation

All endpoints validate:
- Coordinate ranges (lat: -90 to 90, lng: -180 to 180)
- Mode of transport (must be from valid list)
- Distance values (must be non-negative)
- User authorization (JWT token required)

### Rate Limiting

Consider adding rate limiting for production:

```javascript
const rateLimit = require('express-rate-limit');

const carbonLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/carbon', carbonLimiter, carbonRoutes);
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Run migration on production database
- [ ] Test all endpoints with production credentials
- [ ] Set up proper environment variables for JWT_SECRET
- [ ] Configure SSL for database connections
- [ ] Add rate limiting
- [ ] Set up monitoring and error tracking
- [ ] Test with real user data
- [ ] Document any production-specific configurations
- [ ] Set up database backups
- [ ] Review and optimize database indexes

---

## Environment Variables

Add to your `.env` file:

```bash
# Carbon Tracking Configuration
CARBON_TRACKING_ENABLED=true
CARBON_CACHE_TTL=300  # 5 minutes

# Future: External API integration
GOOGLE_MAPS_API_KEY=your_api_key_here  # For real distance calculations
CARBON_API_KEY=your_api_key_here       # For real emission data
```

---

## Rollback Procedure

If you need to roll back the carbon tracking feature:

### Step 1: Create Rollback Migration

```sql
-- 005_carbon_tracking_rollback.sql

-- Remove constraints
ALTER TABLE meetup_participants
DROP CONSTRAINT IF EXISTS check_carbon_positive,
DROP CONSTRAINT IF EXISTS check_distance_positive;

-- Drop function
DROP FUNCTION IF EXISTS calculate_carbon_emission(DECIMAL, VARCHAR);

-- Drop views
DROP VIEW IF EXISTS carbon_user_stats;
DROP VIEW IF EXISTS carbon_meetup_stats;

-- Drop indexes
DROP INDEX IF EXISTS idx_participants_user_carbon;
DROP INDEX IF EXISTS idx_participants_meetup_carbon;
DROP INDEX IF EXISTS idx_participants_joined_date;

-- Remove columns
ALTER TABLE meetup_participants
DROP COLUMN IF EXISTS distance_km,
DROP COLUMN IF EXISTS carbon_emitted;
```

### Step 2: Remove Route Registration

Comment out in server.js:
```javascript
// const carbonRoutes = require('./routes/carbonRoutes');
// app.use('/api/carbon', carbonRoutes);
```

### Step 3: Restart Server

```bash
npm restart
```

---

## FAQ

### Q: Can I use real API instead of mock distance calculator?

**A:** Yes! The mock distance calculator can be easily replaced:

```javascript
// In mockDistanceCalculator.js, replace calculateDistance function

async function calculateDistance(lat1, lng1, lat2, lng2) {
  // Use Google Maps Distance Matrix API
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat1},${lng1}&destinations=${lat2},${lng2}&key=${API_KEY}`
  );
  
  const data = await response.json();
  return data.rows[0].elements[0].distance.value / 1000; // Convert to km
}
```

### Q: How do I change emission factors?

**A:** Edit the EMISSION_FACTORS object in `utils/carbonCalculator.js`:

```javascript
const EMISSION_FACTORS = {
  driving: 0.15,  // Update to your preferred values
  transit: 0.08,
  // ...
};
```

### Q: Can participants see each other's carbon data?

**A:** Yes, but only for meetups they're both participating in. The GET `/api/carbon/meetup/:id` endpoint shows all participants' data for transparency, but detailed journey histories remain private.

### Q: How is carbon calculated for walking/cycling?

**A:** Walking and cycling are assigned zero emissions as they produce no direct carbon output.

---

## Next Steps

1. **Frontend Integration**: Build UI components to display carbon data
2. **Notifications**: Notify users of their carbon footprint after meetups
3. **Gamification**: Add badges and achievements for low-carbon users
4. **Insights**: Generate monthly carbon reports for users
5. **Offsetting**: Partner with carbon offset providers

---

## Support

For technical support or questions:
- Review the [Carbon API Documentation](./CARBON_API_DOCUMENTATION.md)
- Check the test file for usage examples
- File an issue in the repository

**Feature Version:** 1.0.0  
**Last Updated:** December 2025
