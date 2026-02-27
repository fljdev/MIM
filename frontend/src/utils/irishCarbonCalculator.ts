/**
 * Irish Carbon Calculator Utility
 * 
 * Provides functions to calculate carbon emissions based on Irish transport research data.
 * Emission factors in grams CO2 per passenger km.
 * 
 * Sources:
 * - ScienceDirect Irish transport study (doi:10.1016/j.trd.2008.01.004)
 * - Irish Times transport emissions report
 * - SEAI Ireland transport statistics
 */

/**
 * Irish emission factors in grams CO2 per passenger kilometer
 */
export const IRISH_EMISSION_FACTORS = {
  // Public transport (per passenger km)
  bus: 15,      // Dublin Bus
  luas: 64,     // Luas tram
  dart: 11,     // DART train
  
  // Private transport (per passenger km)
  car: 170,     // Car/Taxi (average)
  taxi: 170,    // Same as car
  
  // Other modes (approximations)
  walking: 0,
  cycling: 0,
  specialized: 120, // Specialized transport estimate
  car_parking: 170, // Driving & parking
} as const;

export type TransportMode = keyof typeof IRISH_EMISSION_FACTORS;

/**
 * Get the emission factor for a given transport mode
 * 
 * @param mode - Transport mode (case-insensitive)
 * @returns Emission factor in grams CO2 per km
 */
export function getIrishEmissionFactor(mode: string): number {
  if (!mode) return IRISH_EMISSION_FACTORS.car;
  
  const modeKey = mode.toLowerCase() as TransportMode;
  return IRISH_EMISSION_FACTORS[modeKey] || IRISH_EMISSION_FACTORS.car;
}

/**
 * Calculate carbon emissions for a journey
 * 
 * @param distanceKm - Distance traveled in kilometers
 * @param transportMode - Transport mode used
 * @returns Carbon emissions in grams CO2
 */
export function calculateIrishCarbonEmissions(distanceKm: number, transportMode: string): number {
  if (typeof distanceKm !== 'number' || distanceKm < 0 || isNaN(distanceKm)) {
    return 0;
  }
  
  const emissionFactor = getIrishEmissionFactor(transportMode);
  return distanceKm * emissionFactor;
}

/**
 * Calculate carbon savings compared to driving a car
 * 
 * @param distanceKm - Distance traveled in kilometers
 * @param chosenMode - Transport mode chosen by user
 * @returns Object containing emissions data and savings message
 */
export function calculateIrishCarbonSavings(
  distanceKm: number, 
  chosenMode: string
): {
  emissionsGrams: number;
  carEmissionsGrams: number;
  savingsGrams: number;
  savingsPerKm: number;
  modeName: string;
  message: string;
} {
  // Calculate emissions for chosen mode
  const emissionsGrams = calculateIrishCarbonEmissions(distanceKm, chosenMode);
  
  // Calculate emissions if driving instead
  const carEmissionsGrams = calculateIrishCarbonEmissions(distanceKm, 'car');
  
  // Calculate savings (positive if less than car, negative if more)
  const savingsGrams = carEmissionsGrams - emissionsGrams;
  const savingsPerKm = savingsGrams / distanceKm;
  
  // Get display name for the mode
  const modeName = getModeDisplayName(chosenMode);
  
  // Format the savings message
  const message = formatSavingsMessage(modeName, savingsPerKm);
  
  return {
    emissionsGrams,
    carEmissionsGrams,
    savingsGrams,
    savingsPerKm,
    modeName,
    message
  };
}

/**
 * Get display name for a transport mode
 */
function getModeDisplayName(mode: string): string {
  const modeLower = mode.toLowerCase();
  
  switch (modeLower) {
    case 'bus':
      return 'Dublin Bus';
    case 'luas':
      return 'Luas';
    case 'dart':
      return 'DART';
    case 'car':
      return 'driving';
    case 'taxi':
      return 'taxi';
    case 'walking':
      return 'walking';
    case 'cycling':
      return 'cycling';
    case 'specialized':
      return 'specialized transport';
    case 'car_parking':
      return 'driving & parking';
    default:
      return modeLower;
  }
}

/**
 * Format savings message according to spec
 */
function formatSavingsMessage(modeName: string, savingsPerKm: number): string {
  // Never show negative savings or comparisons for car/taxi
  if (savingsPerKm <= 0) {
    return '';
  }
  
  // Format the amount (grams or kilograms)
  let amountText: string;
  const absSavings = Math.abs(savingsPerKm);
  
  if (absSavings >= 1000) {
    const kg = absSavings / 1000;
    amountText = `${kg.toFixed(1)}kg`;
  } else {
    amountText = `${Math.round(absSavings)}g`;
  }
  
  return `🌱 Choosing the ${modeName} saves approx ${amountText} of CO₂ per km compared to driving.`;
}

/**
 * Check if a transport mode should show carbon savings indicator
 * Only show for public transport modes (Bus, Luas, DART)
 */
export function shouldShowCarbonSavings(mode: string): boolean {
  const modeLower = mode.toLowerCase();
  return ['bus', 'luas', 'dart'].includes(modeLower);
}

/**
 * Format carbon amount for display
 * Automatically chooses grams or kilograms based on magnitude
 */
export function formatCarbonAmount(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg.toFixed(1)} kg CO₂`;
  } else {
    return `${Math.round(grams)}g CO₂`;
  }
}

/**
 * Get source attribution text
 */
export function getSourceText(): string {
  return 'Estimates based on average occupancy. Source: SEAI & Irish transport research.';
}