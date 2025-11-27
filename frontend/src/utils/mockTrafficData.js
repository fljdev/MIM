// Mock Traffic Data - Matches Google Directions API "duration_in_traffic" format
// Structure based on: https://developers.google.com/maps/documentation/directions
// Real API returns "duration_in_traffic" when departure_time parameter is included

// Traffic levels throughout the day (Dublin time)
const trafficLevelsByHour = {
  // Night: 0-6 AM - Almost no traffic
  0: { level: "light", multiplier: 1.0, description: "No traffic" },
  1: { level: "light", multiplier: 1.0, description: "No traffic" },
  2: { level: "light", multiplier: 1.0, description: "No traffic" },
  3: { level: "light", multiplier: 1.0, description: "No traffic" },
  4: { level: "light", multiplier: 1.0, description: "No traffic" },
  5: { level: "light", multiplier: 1.05, description: "Very light traffic" },
  6: { level: "light", multiplier: 1.1, description: "Light traffic" },
  
  // Morning Rush: 7-9 AM
  7: { level: "moderate", multiplier: 1.4, description: "Morning rush hour building" },
  8: { level: "heavy", multiplier: 1.7, description: "Heavy morning traffic" },
  9: { level: "moderate", multiplier: 1.3, description: "Morning rush hour ending" },
  
  // Mid-day: 10 AM - 3 PM - Moderate
  10: { level: "moderate", multiplier: 1.15, description: "Light to moderate traffic" },
  11: { level: "moderate", multiplier: 1.2, description: "Moderate traffic" },
  12: { level: "moderate", multiplier: 1.25, description: "Lunch hour traffic" },
  13: { level: "moderate", multiplier: 1.25, description: "Lunch hour traffic" },
  14: { level: "moderate", multiplier: 1.2, description: "Moderate traffic" },
  15: { level: "moderate", multiplier: 1.15, description: "Light to moderate traffic" },
  
  // Evening Rush: 4-7 PM
  16: { level: "moderate", multiplier: 1.4, description: "Evening rush hour building" },
  17: { level: "heavy", multiplier: 1.8, description: "Heavy evening traffic" },
  18: { level: "heavy", multiplier: 1.6, description: "Heavy evening traffic" },
  19: { level: "moderate", multiplier: 1.3, description: "Evening rush hour ending" },
  
  // Evening: 8 PM - Midnight
  20: { level: "light", multiplier: 1.15, description: "Light evening traffic" },
  21: { level: "light", multiplier: 1.1, description: "Light traffic" },
  22: { level: "light", multiplier: 1.05, description: "Very light traffic" },
  23: { level: "light", multiplier: 1.0, description: "No traffic" }
};

// Mock response matching Google Directions API structure
// This is what you'd get when adding &departure_time=now to your API call
export const createMockDirectionsResponse = (origin, destination, mode, baseDurationSeconds) => {
  const currentHour = new Date().getHours();
  const trafficInfo = trafficLevelsByHour[currentHour];
  
  // Calculate traffic-adjusted duration
  const trafficMultiplier = mode === "driving" ? trafficInfo.multiplier : 1.0;
  const durationInTraffic = Math.round(baseDurationSeconds * trafficMultiplier);
  const delaySeconds = durationInTraffic - baseDurationSeconds;
  
  // Format times
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };
  
  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };
  
  // Calculate distance (rough estimate: average speed)
  const avgSpeed = mode === "driving" ? 13.89 : mode === "bicycling" ? 4.17 : mode === "walking" ? 1.39 : 8.33; // m/s
  const distance = Math.round(baseDurationSeconds * avgSpeed);
  
  // This matches the exact structure from Google Directions API
  return {
    geocoded_waypoints: [
      {
        geocoder_status: "OK",
        place_id: "mock_place_id_origin",
        types: ["street_address"]
      },
      {
        geocoder_status: "OK",
        place_id: "mock_place_id_destination",
        types: ["street_address"]
      }
    ],
    routes: [
      {
        bounds: {
          northeast: { lat: Math.max(origin.lat, destination.lat), lng: Math.max(origin.lng, destination.lng) },
          southwest: { lat: Math.min(origin.lat, destination.lat), lng: Math.min(origin.lng, destination.lng) }
        },
        copyrights: "Mock data",
        legs: [
          {
            distance: {
              text: formatDistance(distance),
              value: distance
            },
            duration: {
              text: formatDuration(baseDurationSeconds),
              value: baseDurationSeconds
            },
            // THIS IS THE KEY FIELD - only present when departure_time is specified
            duration_in_traffic: {
              text: formatDuration(durationInTraffic),
              value: durationInTraffic
            },
            end_address: `${destination.lat}, ${destination.lng}`,
            end_location: destination,
            start_address: `${origin.lat}, ${origin.lng}`,
            start_location: origin,
            steps: [],  // Simplified for mock
            traffic_speed_entry: [],
            via_waypoint: []
          }
        ],
        overview_polyline: {
          points: "mock_encoded_polyline"  // Normally this would be an encoded polyline
        },
        summary: mode === "driving" ? "Main route" : mode.charAt(0).toUpperCase() + mode.slice(1),
        warnings: [],
        waypoint_order: []
      }
    ],
    status: "OK"
  };
};

// Get current traffic condition
export const getCurrentTrafficCondition = () => {
  const hour = new Date().getHours();
  return trafficLevelsByHour[hour];
};

// Calculate delay for a specific route and transit mode
export const getTrafficDelay = (baseDurationSeconds, transitMode) => {
  const hour = new Date().getHours();
  const trafficInfo = trafficLevelsByHour[hour];
  
  // Transit modes affected by traffic differently
  const modeMultipliers = {
    driving: 1.0,      // Fully affected by traffic
    transit: 0.3,      // Buses affected, trains not much
    walking: 0.0,      // Not affected
    bicycling: 0.1     // Slightly affected (bike lanes less congested)
  };
  
  const modeMultiplier = modeMultipliers[transitMode] || 0;
  const trafficMultiplier = (trafficInfo.multiplier - 1.0) * modeMultiplier;
  
  return Math.round(baseDurationSeconds * trafficMultiplier);
};

// Get traffic level for display
export const getTrafficLevel = () => {
  const hour = new Date().getHours();
  return trafficLevelsByHour[hour].level;
};

// Get traffic description
export const getTrafficDescription = () => {
  const hour = new Date().getHours();
  return trafficLevelsByHour[hour].description;
};

// Check if it's rush hour
export const isRushHour = () => {
  const hour = new Date().getHours();
  return (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
};

// Get traffic emoji for UI
export const getTrafficEmoji = () => {
  const level = getTrafficLevel();
  switch (level) {
    case "light":
      return "🟢";
    case "moderate":
      return "🟡";
    case "heavy":
      return "🔴";
    default:
      return "🟢";
  }
};

// Format traffic info for display
export const getTrafficDisplayInfo = (baseDurationMinutes, transitMode) => {
  const baseDurationSeconds = baseDurationMinutes * 60;
  const delaySeconds = getTrafficDelay(baseDurationSeconds, transitMode);
  const delayMinutes = Math.round(delaySeconds / 60);
  
  const condition = getCurrentTrafficCondition();
  const emoji = getTrafficEmoji();
  
  if (delayMinutes === 0) {
    return {
      emoji: emoji,
      text: `${condition.description}`,
      delay: 0,
      totalTime: baseDurationMinutes
    };
  }
  
  return {
    emoji: emoji,
    text: `${condition.description} (+${delayMinutes} min delay)`,
    delay: delayMinutes,
    totalTime: baseDurationMinutes + delayMinutes
  };
};

// Mock function that simulates Google Directions API call with traffic
export const getMockDirectionsWithTraffic = (origin, destination, mode, baseDurationMinutes) => {
  const baseDurationSeconds = baseDurationMinutes * 60;
  return createMockDirectionsResponse(origin, destination, mode, baseDurationSeconds);
};

// Export for testing/debugging
export const getHourlyTrafficPattern = () => trafficLevelsByHour;
