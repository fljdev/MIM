// Speed constants (km/h)
const SPEEDS = {
  walking: 5, // Updated from 3.5 to realistic brisk walking pace
  cycling: 20,
  driving: 40,
  transit: 25
};

// Calculate travel time in minutes between two points
export function calculateTravelTime(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  mode: string = 'driving'
): number {
  const distance = calculateDistance(lat1, lng1, lat2, lng2);
  const speed = SPEEDS[mode as keyof typeof SPEEDS] || SPEEDS.driving;
  return Math.round((distance / speed) * 60); // Convert to minutes, rounded
}

// Haversine formula (same as in mockVenueData)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate travel-time midpoint (weighted average of coordinates)
export function calculateTravelTimeMidpoint(
  person1Lat: number,
  person1Lng: number,
  person2Lat: number,
  person2Lng: number,
  mode: string = 'driving'
): { lat: number; lng: number } {
  // For MVP: use simple geographic midpoint
  // In future: could weight based on travel times
  return {
    lat: (person1Lat + person2Lat) / 2,
    lng: (person1Lng + person2Lng) / 2
  };
}

// Get max travel time for both people to a venue
export function getMaxTravelTime(
  person1Lat: number,
  person1Lng: number,
  person2Lat: number,
  person2Lng: number,
  venueLat: number,
  venueLng: number,
  mode: string = 'driving'
): number {
  const time1 = calculateTravelTime(person1Lat, person1Lng, venueLat, venueLng, mode);
  const time2 = calculateTravelTime(person2Lat, person2Lng, venueLat, venueLng, mode);
  return Math.max(time1, time2);
}

// Get travel time from one location to another (wrapper for calculateTravelTime)
export function getTravelTime(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  transitMode: string = 'walking'
): number {
  return calculateTravelTime(fromLat, fromLng, toLat, toLng, transitMode);
}

// Get Google Maps URL for directions from one location to another
export function getGoogleMapsDirectionsUrl(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  venueName?: string
): string {
  // Format: https://maps.google.com/?saddr=lat,lng&daddr=lat,lng&travelmode=walking
  return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&travelmode=walking`;
}

// Get Google Maps URL for a specific location
export function getGoogleMapsLocationUrl(
  lat: number,
  lng: number,
  venueName: string
): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(venueName)}/@${lat},${lng},15z`;
}
