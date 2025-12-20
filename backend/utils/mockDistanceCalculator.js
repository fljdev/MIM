/**
 * Mock Distance Calculator
 * 
 * Provides distance calculation functionality using the Haversine formula.
 * This is a mock implementation that can be easily replaced with real API calls
 * (e.g., Google Maps Distance Matrix API) in production.
 * 
 * The Haversine formula calculates the great-circle distance between two points
 * on a sphere given their longitudes and latitudes.
 */

/**
 * Calculate distance between two geographic points using Haversine formula
 * 
 * @param {number} lat1 - Latitude of first point (in degrees)
 * @param {number} lng1 - Longitude of first point (in degrees)
 * @param {number} lat2 - Latitude of second point (in degrees)
 * @param {number} lng2 - Longitude of second point (in degrees)
 * @returns {number} Distance in kilometers (rounded to 2 decimal places)
 * 
 * @example
 * calculateDistance(53.3498, -6.2603, 53.3381, -6.2592) // Returns ~1.31 km
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  // Validate inputs
  if (!isValidCoordinate(lat1, lng1) || !isValidCoordinate(lat2, lng2)) {
    console.error('Invalid coordinates provided to calculateDistance');
    return 0;
  }

  const R = 6371; // Radius of Earth in kilometers
  
  // Convert degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Calculate distance
  const distance = R * c;
  
  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

/**
 * Convert degrees to radians
 * 
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Validate coordinate pair
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if valid coordinates
 */
function isValidCoordinate(lat, lng) {
  // Convert to numbers if they are strings
  const numLat = Number(lat);
  const numLng = Number(lng);

  return (
    !isNaN(numLat) && !isNaN(numLng) &&
    numLat >= -90 && numLat <= 90 &&
    numLng >= -180 && numLng <= 180
  );
}

/**
 * Calculate distance for a participant to a venue
 * 
 * @param {Object} participant - Participant object with location_lat and location_lng
 * @param {Object} venue - Venue object with latitude and longitude
 * @returns {number} Distance in kilometers
 */
function calculateParticipantToVenueDistance(participant, venue) {
  if (!participant || !venue) {
    console.error('Participant or venue object missing');
    return 0;
  }

  const participantLat = participant.location_lat || participant.lat;
  const participantLng = participant.location_lng || participant.lng;
  const venueLat = venue.latitude || venue.lat;
  const venueLng = venue.longitude || venue.lng;

  if (!isValidCoordinate(participantLat, participantLng) || 
      !isValidCoordinate(venueLat, venueLng)) {
    console.error('Invalid coordinates in participant or venue');
    return 0;
  }

  return calculateDistance(participantLat, participantLng, venueLat, venueLng);
}

/**
 * Mock distance calculator with optional random variation
 * Useful for testing scenarios where slight variations are needed
 * 
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @param {boolean} addVariation - Whether to add random variation (±5%)
 * @returns {number} Distance in kilometers
 */
function getMockedDistance(lat1, lng1, lat2, lng2, addVariation = false) {
  const baseDistance = calculateDistance(lat1, lng1, lat2, lng2);
  
  if (!addVariation || baseDistance === 0) {
    return baseDistance;
  }

  // Add random variation of ±5% to simulate real-world conditions
  // (traffic, route variations, etc.)
  const variation = (Math.random() * 0.1 - 0.05); // -0.05 to +0.05
  const adjustedDistance = baseDistance * (1 + variation);
  
  return Math.round(adjustedDistance * 100) / 100;
}

/**
 * Calculate distances from multiple participants to a venue
 * 
 * @param {Array} participants - Array of participant objects
 * @param {Object} venue - Venue object with coordinates
 * @returns {Array} Array of distance objects with participant info
 * 
 * @example
 * const participants = [
 *   { id: 1, name: 'John', location_lat: 53.3498, location_lng: -6.2603 },
 *   { id: 2, name: 'Jane', location_lat: 53.3381, location_lng: -6.2592 }
 * ];
 * const venue = { latitude: 53.344, longitude: -6.260 };
 * calculateDistancesForParticipants(participants, venue);
 */
function calculateDistancesForParticipants(participants, venue) {
  if (!Array.isArray(participants) || !venue) {
    console.error('Invalid participants array or venue object');
    return [];
  }

  return participants.map(participant => {
    const distance = calculateParticipantToVenueDistance(participant, venue);
    return {
      participant_id: participant.id || participant.user_id,
      participant_name: participant.participant_name || participant.name,
      distance_km: distance,
      location_lat: participant.location_lat || participant.lat,
      location_lng: participant.location_lng || participant.lng
    };
  });
}

/**
 * Calculate total distance traveled by all participants to a venue
 * 
 * @param {Array} participants - Array of participant objects
 * @param {Object} venue - Venue object with coordinates
 * @returns {Object} Summary with total, average, min, max distances
 */
function calculateTotalDistance(participants, venue) {
  const distances = calculateDistancesForParticipants(participants, venue);
  
  if (distances.length === 0) {
    return { total: 0, average: 0, min: 0, max: 0, count: 0 };
  }

  const distanceValues = distances.map(d => d.distance_km);
  const total = distanceValues.reduce((sum, d) => sum + d, 0);
  
  return {
    total: Math.round(total * 100) / 100,
    average: Math.round((total / distances.length) * 100) / 100,
    min: Math.min(...distanceValues),
    max: Math.max(...distanceValues),
    count: distances.length
  };
}

/**
 * Generate mock distance data for testing
 * Creates realistic distance values within a specified range
 * 
 * @param {number} minKm - Minimum distance in km
 * @param {number} maxKm - Maximum distance in km
 * @returns {number} Random distance within range
 */
function generateMockDistance(minKm = 1, maxKm = 20) {
  const distance = Math.random() * (maxKm - minKm) + minKm;
  return Math.round(distance * 100) / 100;
}

module.exports = {
  calculateDistance,
  getMockedDistance,
  calculateParticipantToVenueDistance,
  calculateDistancesForParticipants,
  calculateTotalDistance,
  generateMockDistance,
  isValidCoordinate
};
