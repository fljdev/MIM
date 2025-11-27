const { calculateDistance, getSpeedForMode } = require('../routes/mockVenueData');

/**
 * Calculate travel time in minutes for a participant to reach a venue
 */
function calculateTravelTime(participantLat, participantLng, venueLat, venueLng, mode) {
  const distanceKm = calculateDistance(participantLat, participantLng, venueLat, venueLng);
  const speedKmh = getSpeedForMode(mode);
  const timeHours = distanceKm / speedKmh;
  const timeMinutes = timeHours * 60;
  return Math.round(timeMinutes);
}

/**
 * Calculate travel times for all participants to a venue
 */
function calculateVenueTravelTimes(venue, participants) {
  const travelTimes = participants.map((participant, index) => ({
    personIndex: index,
    personName: participant.participant_name,
    mode: participant.transit_mode,
    duration: calculateTravelTime(
      participant.location_lat,
      participant.location_lng,
      venue.latitude,
      venue.longitude,
      participant.transit_mode
    )
  }));

  const maxTravelTime = Math.max(...travelTimes.map(t => t.duration));

  return {
    ...venue,
    travelTimes,
    maxTravelTime,
    fairnessScore: maxTravelTime
  };
}

/**
 * FASTEST MODE: Minimize the maximum travel time
 * Prioritizes venues where the slowest person arrives quickest
 */
function calculateFastest(venues, participants) {
  // Calculate travel times for each venue
  const venuesWithTimes = venues.map(venue =>
    calculateVenueTravelTimes(venue, participants)
  );

  // Sort by maxTravelTime ascending (fastest max time first)
  return venuesWithTimes.sort((a, b) => a.maxTravelTime - b.maxTravelTime);
}

/**
 * SUSTAINABLE MODE: Penalize venues requiring driving
 * Adds 15-minute penalty to venues where ANY participant drives
 */
function calculateSustainable(venues, participants) {
  // Calculate travel times for each venue
  const venuesWithTimes = venues.map(venue => {
    const venueData = calculateVenueTravelTimes(venue, participants);

    // Check if any participant is driving
    const hasDriving = venueData.travelTimes.some(t => t.mode === 'DRIVING');

    // Apply penalty if driving is used
    const penalizedTime = hasDriving
      ? venueData.maxTravelTime + 15
      : venueData.maxTravelTime;

    return {
      ...venueData,
      fairnessScore: penalizedTime
    };
  });

  // Sort by penalized time (fairnessScore)
  return venuesWithTimes.sort((a, b) => a.fairnessScore - b.fairnessScore);
}

/**
 * ACCESSIBLE MODE: Only wheelchair-accessible venues
 * Hard filter for accessibility, then apply fastest algorithm
 */
function calculateAccessible(venues, participants) {
  // Filter for accessible venues only
  const accessibleVenues = venues.filter(v => v.accessible === true);

  // Check if any accessible venues exist
  if (accessibleVenues.length === 0) {
    throw new Error('No wheelchair-accessible venues within travel time');
  }

  // Apply fastest algorithm to accessible venues
  return calculateFastest(accessibleVenues, participants);
}

/**
 * Main fairness calculation router
 */
function calculateFairness(venues, participants, mode) {
  switch (mode) {
    case 'fastest':
      return calculateFastest(venues, participants);
    case 'sustainable':
      return calculateSustainable(venues, participants);
    case 'accessible':
      return calculateAccessible(venues, participants);
    default:
      throw new Error(`Unknown fairness mode: ${mode}`);
  }
}

/**
 * Calculate geographic midpoint of all participants
 */
function calculateMidpoint(participants) {
  if (participants.length === 0) {
    throw new Error('No participants to calculate midpoint');
  }

  const sumLat = participants.reduce((sum, p) => sum + p.location_lat, 0);
  const sumLng = participants.reduce((sum, p) => sum + p.location_lng, 0);

  return {
    lat: sumLat / participants.length,
    lng: sumLng / participants.length
  };
}

module.exports = {
  calculateFastest,
  calculateSustainable,
  calculateAccessible,
  calculateFairness,
  calculateMidpoint,
  calculateTravelTime
};
