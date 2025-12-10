const express = require('express');
const router = express.Router();
const { MOCK_VENUES, calculateDistance, getSpeedForMode } = require('../data/mocks/mockVenueData');

// POST /api/midpoint - Find meeting spot based on locations and preferences
router.post('/', async (req, res) => {
  try {
    const { locations, transitModes, maxTravelTime, venueType, budgetMode, priceLevels } = req.body;

    // Validation: Check if locations exist
    if (!locations || !Array.isArray(locations)) {
      return res.status(400).json({ 
        error: 'locations must be an array' 
      });
    }

    // Validation: Check if transitModes exists and is an array
    if (!transitModes || !Array.isArray(transitModes)) {
      return res.status(400).json({ 
        error: 'transitModes must be an array' 
      });
    }

    // Validation: Check if transitModes length matches locations length
    if (transitModes.length !== locations.length) {
      return res.status(400).json({ 
        error: 'Number of transit modes must match number of locations' 
      });
    }

    // Validation: Check if each transit mode is valid
    const validModes = ['WALKING', 'DRIVING', 'TRANSIT', 'BICYCLING'];
    for (const mode of transitModes) {
      if (!validModes.includes(mode)) {
        return res.status(400).json({ 
          error: `Invalid transit mode: ${mode}. Must be one of: ${validModes.join(', ')}` 
        });
      }
    }

    // Validation: Check if each location has lat/lng
    for (let i = 0; i < locations.length; i++) {
      if (!locations[i].lat || !locations[i].lng) {
        return res.status(400).json({
          error: `Location at index ${i} must have lat and lng properties`
        });
      }
    }

    // Request validation passed

    // Calculate travel times for each venue based on each person's location and transit mode
    let venues = MOCK_VENUES.map((venue, venueIndex) => {
      // Calculate travel time for each person to this venue
      const travelTimes = locations.map((location, index) => {
        // Calculate distance using Haversine formula
        const distanceKm = calculateDistance(
          location.lat,
          location.lng,
          venue.latitude,
          venue.longitude
        );

        // Get speed based on transit mode
        const mode = transitModes[index];
        const speedKmh = getSpeedForMode(mode);

        // Calculate duration in minutes
        const durationMinutes = (distanceKm / speedKmh) * 60;

        // Calculate travel time for each person

        return {
          personIndex: index,
          mode: mode,
          duration: Math.round(durationMinutes)
        };
      });

      // Return venue with travel times

      return {
        ...venue,
        travelTimes: travelTimes
      };
    });

    // Filter: Only keep venues where ALL people can reach within maxTravelTime
    venues = venues.filter(venue => {
      const maxPersonTime = Math.max(...venue.travelTimes.map(t => t.duration));
      return maxPersonTime <= maxTravelTime;
    });


    // Filter by budget if budget mode is enabled with specific price levels
    if (budgetMode && priceLevels && priceLevels.length > 0) {
      venues = venues.filter(venue => {
        return venue.priceLevel !== undefined && priceLevels.includes(venue.priceLevel);
      });
    }
    // If budgetMode is true but no price levels selected, show all venues (no filtering)
    // Sort by max travel time (venues where the slowest person arrives fastest come first)
    venues.sort((a, b) => {
      const maxA = Math.max(...a.travelTimes.map(t => t.duration));
      const maxB = Math.max(...b.travelTimes.map(t => t.duration));
      return maxA - maxB;
    });

    res.json({
      success: true,
      venues: venues,
      transitModes: transitModes,
      message: 'Using mock data with calculated travel times based on individual transit modes'
    });

  } catch (error) {
    console.error('Error in midpoint endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

module.exports = router;
