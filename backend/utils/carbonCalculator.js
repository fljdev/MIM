/**
 * Carbon Calculator Utility
 * 
 * Provides functions to calculate carbon emissions based on distance and mode of transport.
 * Uses standard emission factors (kg CO2 per km).
 * 
 * Emission Factors Source: Based on average values from:
 * - UK Department for Transport
 * - European Environment Agency
 * - IPCC Guidelines
 */

/**
 * Emission factors in kg CO2 per kilometer
 */
const EMISSION_FACTORS = {
  driving: 0.12,    // Average car (petrol/diesel mix)
  transit: 0.06,    // Public transport (bus/train average)
  walking: 0.0,     // Zero emissions
  bicycling: 0.0,   // Zero emissions
  car: 0.12,        // Alias for driving
  bike: 0.0,        // Alias for bicycling
  bus: 0.06,        // Alias for transit
  train: 0.04       // Lower emissions than bus
};

/**
 * Get the emission factor for a given mode of transport
 * 
 * @param {string} modeOfTransport - Mode of transport (case-insensitive)
 * @returns {number} Emission factor in kg CO2 per km
 */
function getCarbonEmissionFactor(modeOfTransport) {
  if (!modeOfTransport) {
    console.warn('No mode of transport provided, defaulting to driving');
    return EMISSION_FACTORS.driving;
  }

  const mode = modeOfTransport.toLowerCase().trim();
  
  if (EMISSION_FACTORS.hasOwnProperty(mode)) {
    return EMISSION_FACTORS[mode];
  }

  // Default to driving if mode is unknown
  console.warn(`Unknown mode of transport: ${modeOfTransport}, defaulting to driving`);
  return EMISSION_FACTORS.driving;
}

/**
 * Calculate carbon emissions for a journey
 * 
 * @param {number} distanceKm - Distance traveled in kilometers
 * @param {string} modeOfTransport - Mode of transport used
 * @returns {number} Carbon emissions in kg CO2 (rounded to 4 decimal places)
 * 
 * @example
 * calculateCarbonEmission(10, 'driving') // Returns 1.2000
 * calculateCarbonEmission(10, 'transit') // Returns 0.6000
 * calculateCarbonEmission(10, 'walking') // Returns 0.0000
 */
function calculateCarbonEmission(distanceKm, modeOfTransport) {
  // Validate distance
  if (typeof distanceKm !== 'number' || distanceKm < 0 || isNaN(distanceKm)) {
    console.error(`Invalid distance: ${distanceKm}`);
    return 0;
  }

  // Get emission factor
  const emissionFactor = getCarbonEmissionFactor(modeOfTransport);

  // Calculate emissions
  const carbonEmitted = distanceKm * emissionFactor;

  // Round to 4 decimal places for precision
  return Math.round(carbonEmitted * 10000) / 10000;
}

/**
 * Calculate total carbon emissions for multiple journeys
 * 
 * @param {Array} journeys - Array of journey objects with distanceKm and modeOfTransport
 * @returns {Object} Summary object with total, average, and breakdown by mode
 * 
 * @example
 * const journeys = [
 *   { distanceKm: 10, modeOfTransport: 'driving' },
 *   { distanceKm: 5, modeOfTransport: 'transit' }
 * ];
 * calculateTotalEmissions(journeys)
 * // Returns: { total: 1.5, average: 0.75, byMode: {...} }
 */
function calculateTotalEmissions(journeys) {
  if (!Array.isArray(journeys) || journeys.length === 0) {
    return {
      total: 0,
      average: 0,
      byMode: {},
      journeyCount: 0
    };
  }

  let total = 0;
  const byMode = {};

  journeys.forEach(journey => {
    const emission = calculateCarbonEmission(journey.distanceKm, journey.modeOfTransport);
    total += emission;

    const mode = journey.modeOfTransport.toLowerCase();
    if (!byMode[mode]) {
      byMode[mode] = { count: 0, emissions: 0, distance: 0 };
    }
    byMode[mode].count++;
    byMode[mode].emissions += emission;
    byMode[mode].distance += journey.distanceKm;
  });

  return {
    total: Math.round(total * 10000) / 10000,
    average: Math.round((total / journeys.length) * 10000) / 10000,
    byMode: byMode,
    journeyCount: journeys.length
  };
}

/**
 * Get carbon savings comparison between modes
 * 
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} currentMode - Current mode of transport
 * @param {string} alternativeMode - Alternative mode to compare
 * @returns {Object} Comparison object with savings information
 * 
 * @example
 * getCarbonSavings(10, 'driving', 'transit')
 * // Returns: { current: 1.2, alternative: 0.6, savings: 0.6, percentReduction: 50 }
 */
function getCarbonSavings(distanceKm, currentMode, alternativeMode) {
  const currentEmission = calculateCarbonEmission(distanceKm, currentMode);
  const alternativeEmission = calculateCarbonEmission(distanceKm, alternativeMode);
  
  const savings = currentEmission - alternativeEmission;
  const percentReduction = currentEmission > 0 
    ? Math.round((savings / currentEmission) * 100) 
    : 0;

  return {
    current: currentEmission,
    alternative: alternativeEmission,
    savings: Math.round(savings * 10000) / 10000,
    percentReduction: percentReduction,
    isBetter: savings > 0
  };
}

/**
 * Format carbon emissions for display
 * 
 * @param {number} carbonKg - Carbon emissions in kg
 * @returns {string} Formatted string for display
 * 
 * @example
 * formatCarbonEmissions(1.2345) // Returns "1.23 kg CO₂"
 * formatCarbonEmissions(0.5) // Returns "0.50 kg CO₂"
 */
function formatCarbonEmissions(carbonKg) {
  if (typeof carbonKg !== 'number' || isNaN(carbonKg)) {
    return '0.00 kg CO₂';
  }

  return `${carbonKg.toFixed(2)} kg CO₂`;
}

/**
 * Get environmental context for carbon emissions
 * Provides relatable comparisons for carbon amounts
 * 
 * @param {number} carbonKg - Carbon emissions in kg
 * @returns {string} Human-readable context
 */
function getCarbonContext(carbonKg) {
  if (carbonKg < 0.1) {
    return 'Minimal environmental impact - equivalent to charging a smartphone a few times';
  } else if (carbonKg < 1) {
    return 'Low impact - similar to boiling water for several cups of tea';
  } else if (carbonKg < 5) {
    return 'Moderate impact - equivalent to a short car journey';
  } else if (carbonKg < 10) {
    return 'Significant impact - similar to running a laptop for a few days';
  } else {
    return 'High impact - consider sustainable transport alternatives when possible';
  }
}

// Export all functions
module.exports = {
  EMISSION_FACTORS,
  getCarbonEmissionFactor,
  calculateCarbonEmission,
  calculateTotalEmissions,
  getCarbonSavings,
  formatCarbonEmissions,
  getCarbonContext
};
