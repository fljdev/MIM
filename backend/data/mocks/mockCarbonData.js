/**
 * Mock Carbon Data
 * 
 * Contains mock data for carbon tracking features including:
 * - Sample emission factors
 * - Sample journey data
 * - Environmental impact contexts
 */

/**
 * Standard emission factors for different modes of transport
 * Values in kg CO2 per kilometer
 */
const EMISSION_FACTORS = {
  driving: 0.12,      // Average petrol/diesel car
  transit: 0.06,      // Public transport (bus/train average)
  walking: 0.0,       // Zero emissions
  bicycling: 0.0,     // Zero emissions
  car: 0.12,          // Alias for driving
  bike: 0.0,          // Alias for bicycling
  bus: 0.06,          // Alias for transit
  train: 0.04,        // Electric train (lower than bus)
  electric_car: 0.05, // Electric vehicle (charging emissions)
  motorcycle: 0.08,   // Motorcycle/scooter
  taxi: 0.15          // Taxi (higher due to empty return trips)
};

/**
 * Sample journey data for testing and development
 */
const SAMPLE_JOURNEYS = [
  {
    user_id: 1,
    meetup_id: 1,
    distance_km: 8.5,
    mode_of_transport: 'transit',
    carbon_emitted: 0.51,
    origin: { lat: 53.3498, lng: -6.2603, name: 'Dublin City Centre' },
    destination: { lat: 53.3381, lng: -6.2592, name: 'Temple Bar' },
    date: '2025-12-15T14:30:00Z'
  },
  {
    user_id: 1,
    meetup_id: 2,
    distance_km: 15.8,
    mode_of_transport: 'driving',
    carbon_emitted: 1.896,
    origin: { lat: 53.3498, lng: -6.2603, name: 'Dublin City Centre' },
    destination: { lat: 53.2707, lng: -6.1478, name: 'Dundrum' },
    date: '2025-12-10T18:00:00Z'
  },
  {
    user_id: 2,
    meetup_id: 1,
    distance_km: 3.2,
    mode_of_transport: 'walking',
    carbon_emitted: 0.0,
    origin: { lat: 53.3444, lng: -6.2614, name: 'Trinity College' },
    destination: { lat: 53.3381, lng: -6.2592, name: 'Temple Bar' },
    date: '2025-12-15T14:30:00Z'
  }
];

/**
 * Carbon impact contexts for user-friendly messaging
 */
const CARBON_CONTEXTS = [
  {
    range: { min: 0, max: 0.1 },
    message: 'Excellent! Minimal environmental impact.',
    icon: '🌱',
    color: 'green',
    comparison: 'Equivalent to charging a smartphone a few times'
  },
  {
    range: { min: 0.1, max: 1 },
    message: 'Great choice! Low carbon footprint.',
    icon: '🍃',
    color: 'light-green',
    comparison: 'Similar to boiling water for several cups of tea'
  },
  {
    range: { min: 1, max: 5 },
    message: 'Moderate impact. Consider greener options next time.',
    icon: '🌍',
    color: 'yellow',
    comparison: 'Equivalent to a short car journey'
  },
  {
    range: { min: 5, max: 10 },
    message: 'Significant impact. Try public transport or cycling.',
    icon: '⚠️',
    color: 'orange',
    comparison: 'Similar to running a laptop for several days'
  },
  {
    range: { min: 10, max: Infinity },
    message: 'High impact. Please consider sustainable alternatives.',
    icon: '🚨',
    color: 'red',
    comparison: 'Consider carpooling or public transport for future meetups'
  }
];

/**
 * Mode-specific recommendations for reducing emissions
 */
const MODE_RECOMMENDATIONS = {
  driving: {
    alternatives: ['transit', 'bicycling', 'walking'],
    tip: 'Consider taking public transport or carpooling to reduce emissions by up to 50%',
    savingsPotential: 50 // percentage
  },
  transit: {
    alternatives: ['bicycling', 'walking'],
    tip: 'Great choice! For shorter distances, walking or cycling can reduce emissions to zero',
    savingsPotential: 100
  },
  walking: {
    alternatives: [],
    tip: 'Perfect! You\'re already making the most sustainable choice',
    savingsPotential: 0
  },
  bicycling: {
    alternatives: [],
    tip: 'Excellent! Cycling is one of the most sustainable transport options',
    savingsPotential: 0
  }
};

/**
 * Carbon offset equivalents for context
 * Helps users understand their carbon footprint in relatable terms
 */
const CARBON_EQUIVALENTS = {
  tree_absorption: {
    name: 'Trees needed (1 year)',
    factor: 21.77, // kg CO2 absorbed per tree per year
    unit: 'trees',
    description: 'Number of trees needed for 1 year to offset this carbon'
  },
  smartphone_charges: {
    name: 'Smartphone charges',
    factor: 0.008, // kg CO2 per full charge
    unit: 'charges',
    description: 'Equivalent smartphone charges in carbon emissions'
  },
  km_driven: {
    name: 'Kilometers driven',
    factor: 0.12, // kg CO2 per km (average car)
    unit: 'km',
    description: 'Equivalent kilometers driven in an average car'
  },
  flights_dublin_london: {
    name: 'Dublin-London flights',
    factor: 100, // kg CO2 per short-haul flight
    unit: 'flights',
    description: 'Equivalent short-haul flights (Dublin-London)'
  }
};

/**
 * Leaderboard mock data
 * Sample data for stats endpoint
 */
const MOCK_LEADERBOARD = [
  {
    user_id: 1,
    user_name: 'Eco Warrior',
    total_carbon_kg: 2.5,
    journey_count: 15,
    average_per_journey: 0.17,
    rank: 1,
    badge: 'Green Champion'
  },
  {
    user_id: 2,
    user_name: 'Transit Fan',
    total_carbon_kg: 5.8,
    journey_count: 12,
    average_per_journey: 0.48,
    rank: 2,
    badge: 'Public Transport Hero'
  },
  {
    user_id: 3,
    user_name: 'City Cyclist',
    total_carbon_kg: 0.0,
    journey_count: 20,
    average_per_journey: 0.0,
    rank: 3,
    badge: 'Zero Emissions'
  }
];

/**
 * Global carbon statistics mock data
 */
const MOCK_GLOBAL_STATS = {
  total_users_tracked: 150,
  total_journeys: 1247,
  total_carbon_kg: 456.8,
  average_per_journey: 0.37,
  average_per_user: 3.05,
  most_popular_mode: 'transit',
  lowest_emission_mode: 'walking',
  mode_distribution: {
    walking: { count: 450, percentage: 36.1 },
    bicycling: { count: 320, percentage: 25.7 },
    transit: { count: 387, percentage: 31.0 },
    driving: { count: 90, percentage: 7.2 }
  },
  carbon_saved_vs_all_driving: 1234.5 // kg CO2 saved compared to if everyone drove
};

/**
 * Helper function to get carbon context based on emission amount
 * 
 * @param {number} carbonKg - Carbon emissions in kg
 * @returns {Object} Context object with message, icon, color, and comparison
 */
function getCarbonContextData(carbonKg) {
  const context = CARBON_CONTEXTS.find(ctx => 
    carbonKg >= ctx.range.min && carbonKg < ctx.range.max
  );
  
  return context || CARBON_CONTEXTS[CARBON_CONTEXTS.length - 1];
}

/**
 * Calculate carbon equivalent in relatable terms
 * 
 * @param {number} carbonKg - Carbon emissions in kg
 * @param {string} equivalentType - Type of equivalent (tree_absorption, smartphone_charges, etc.)
 * @returns {Object} Equivalent calculation result
 */
function calculateCarbonEquivalent(carbonKg, equivalentType = 'tree_absorption') {
  const equivalent = CARBON_EQUIVALENTS[equivalentType];
  
  if (!equivalent) {
    console.error(`Unknown equivalent type: ${equivalentType}`);
    return null;
  }

  const value = carbonKg / equivalent.factor;
  
  return {
    value: Math.round(value * 100) / 100,
    unit: equivalent.unit,
    description: equivalent.description,
    formatted: `${Math.round(value * 100) / 100} ${equivalent.unit}`
  };
}

module.exports = {
  EMISSION_FACTORS,
  SAMPLE_JOURNEYS,
  CARBON_CONTEXTS,
  MODE_RECOMMENDATIONS,
  CARBON_EQUIVALENTS,
  MOCK_LEADERBOARD,
  MOCK_GLOBAL_STATS,
  getCarbonContextData,
  calculateCarbonEquivalent
};
