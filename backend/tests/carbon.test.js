/**
 * Carbon Tracking Feature - Unit Tests
 * 
 * Tests for carbon emission calculation, distance calculation,
 * and API endpoints.
 * 
 * Run with: npm test
 */

const {
  calculateCarbonEmission,
  getCarbonEmissionFactor,
  calculateTotalEmissions,
  getCarbonSavings,
  EMISSION_FACTORS
} = require('../utils/carbonCalculator');

const {
  calculateDistance,
  getMockedDistance,
  isValidCoordinate,
  calculateParticipantToVenueDistance,
  generateMockDistance
} = require('../utils/mockDistanceCalculator');

const {
  getCarbonContextData,
  calculateCarbonEquivalent
} = require('../data/mocks/mockCarbonData');

// ============================================
// CARBON CALCULATOR TESTS
// ============================================

describe('Carbon Calculator', () => {
  
  describe('getCarbonEmissionFactor', () => {
    test('should return correct factor for driving', () => {
      expect(getCarbonEmissionFactor('driving')).toBe(0.12);
    });

    test('should return correct factor for transit', () => {
      expect(getCarbonEmissionFactor('transit')).toBe(0.06);
    });

    test('should return zero for walking', () => {
      expect(getCarbonEmissionFactor('walking')).toBe(0.0);
    });

    test('should return zero for bicycling', () => {
      expect(getCarbonEmissionFactor('bicycling')).toBe(0.0);
    });

    test('should be case-insensitive', () => {
      expect(getCarbonEmissionFactor('DRIVING')).toBe(0.12);
      expect(getCarbonEmissionFactor('Transit')).toBe(0.06);
    });

    test('should default to driving for unknown modes', () => {
      expect(getCarbonEmissionFactor('flying')).toBe(0.12);
      expect(getCarbonEmissionFactor('')).toBe(0.12);
    });
  });

  describe('calculateCarbonEmission', () => {
    test('should calculate emissions for driving correctly', () => {
      const result = calculateCarbonEmission(10, 'driving');
      expect(result).toBe(1.2);
    });

    test('should calculate emissions for transit correctly', () => {
      const result = calculateCarbonEmission(10, 'transit');
      expect(result).toBe(0.6);
    });

    test('should return zero for walking', () => {
      const result = calculateCarbonEmission(10, 'walking');
      expect(result).toBe(0);
    });

    test('should return zero for bicycling', () => {
      const result = calculateCarbonEmission(5, 'bicycling');
      expect(result).toBe(0);
    });

    test('should handle decimal distances', () => {
      const result = calculateCarbonEmission(7.5, 'driving');
      expect(result).toBe(0.9);
    });

    test('should handle zero distance', () => {
      const result = calculateCarbonEmission(0, 'driving');
      expect(result).toBe(0);
    });

    test('should handle invalid distance', () => {
      expect(calculateCarbonEmission(-5, 'driving')).toBe(0);
      expect(calculateCarbonEmission(NaN, 'driving')).toBe(0);
      expect(calculateCarbonEmission('invalid', 'driving')).toBe(0);
    });

    test('should round to 4 decimal places', () => {
      const result = calculateCarbonEmission(8.333333, 'driving');
      expect(result).toBe(1.0);
    });
  });

  describe('calculateTotalEmissions', () => {
    test('should calculate total for multiple journeys', () => {
      const journeys = [
        { distanceKm: 10, modeOfTransport: 'driving' },
        { distanceKm: 5, modeOfTransport: 'transit' },
        { distanceKm: 3, modeOfTransport: 'walking' }
      ];

      const result = calculateTotalEmissions(journeys);
      expect(result.total).toBe(1.5); // 1.2 + 0.3 + 0
      expect(result.average).toBe(0.5);
      expect(result.journeyCount).toBe(3);
    });

    test('should handle empty array', () => {
      const result = calculateTotalEmissions([]);
      expect(result.total).toBe(0);
      expect(result.average).toBe(0);
      expect(result.journeyCount).toBe(0);
    });

    test('should break down by mode', () => {
      const journeys = [
        { distanceKm: 10, modeOfTransport: 'driving' },
        { distanceKm: 10, modeOfTransport: 'driving' },
        { distanceKm: 10, modeOfTransport: 'transit' }
      ];

      const result = calculateTotalEmissions(journeys);
      expect(result.byMode.driving.count).toBe(2);
      expect(result.byMode.transit.count).toBe(1);
    });
  });

  describe('getCarbonSavings', () => {
    test('should calculate savings from driving to transit', () => {
      const result = getCarbonSavings(10, 'driving', 'transit');
      expect(result.current).toBe(1.2);
      expect(result.alternative).toBe(0.6);
      expect(result.savings).toBe(0.6);
      expect(result.percentReduction).toBe(50);
      expect(result.isBetter).toBe(true);
    });

    test('should show no savings when switching to worse mode', () => {
      const result = getCarbonSavings(10, 'transit', 'driving');
      expect(result.savings).toBe(-0.6);
      expect(result.isBetter).toBe(false);
    });

    test('should handle switching to zero-emission modes', () => {
      const result = getCarbonSavings(10, 'driving', 'walking');
      expect(result.alternative).toBe(0);
      expect(result.savings).toBe(1.2);
      expect(result.percentReduction).toBe(100);
    });
  });
});

// ============================================
// DISTANCE CALCULATOR TESTS
// ============================================

describe('Distance Calculator', () => {
  
  describe('isValidCoordinate', () => {
    test('should validate correct coordinates', () => {
      expect(isValidCoordinate(53.3498, -6.2603)).toBe(true);
      expect(isValidCoordinate(0, 0)).toBe(true);
      expect(isValidCoordinate(-90, 180)).toBe(true);
    });

    test('should reject invalid coordinates', () => {
      expect(isValidCoordinate(91, 0)).toBe(false);
      expect(isValidCoordinate(0, 181)).toBe(false);
      expect(isValidCoordinate('invalid', 0)).toBe(false);
      expect(isValidCoordinate(NaN, 0)).toBe(false);
    });
  });

  describe('calculateDistance', () => {
    test('should calculate distance between Dublin locations', () => {
      // Dublin City Centre to Temple Bar (approx 0.6 km)
      const distance = calculateDistance(53.3498, -6.2603, 53.3453, -6.2629);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(2);
    });

    test('should return zero for same location', () => {
      const distance = calculateDistance(53.3498, -6.2603, 53.3498, -6.2603);
      expect(distance).toBe(0);
    });

    test('should handle invalid coordinates', () => {
      const distance = calculateDistance(200, 200, 53.3498, -6.2603);
      expect(distance).toBe(0);
    });

    test('should be symmetric', () => {
      const d1 = calculateDistance(53.3498, -6.2603, 53.3381, -6.2592);
      const d2 = calculateDistance(53.3381, -6.2592, 53.3498, -6.2603);
      expect(d1).toBe(d2);
    });
  });

  describe('getMockedDistance', () => {
    test('should return same as calculateDistance without variation', () => {
      const base = calculateDistance(53.3498, -6.2603, 53.3381, -6.2592);
      const mocked = getMockedDistance(53.3498, -6.2603, 53.3381, -6.2592, false);
      expect(mocked).toBe(base);
    });

    test('should add variation when requested', () => {
      const base = calculateDistance(53.3498, -6.2603, 53.3381, -6.2592);
      const mocked = getMockedDistance(53.3498, -6.2603, 53.3381, -6.2592, true);
      
      // Variation should be within ±5%
      expect(mocked).toBeGreaterThanOrEqual(base * 0.95);
      expect(mocked).toBeLessThanOrEqual(base * 1.05);
    });
  });

  describe('calculateParticipantToVenueDistance', () => {
    test('should calculate distance with participant and venue objects', () => {
      const participant = { location_lat: 53.3498, location_lng: -6.2603 };
      const venue = { latitude: 53.3381, longitude: -6.2592 };
      
      const distance = calculateParticipantToVenueDistance(participant, venue);
      expect(distance).toBeGreaterThan(0);
    });

    test('should handle missing participant', () => {
      const venue = { latitude: 53.3381, longitude: -6.2592 };
      const distance = calculateParticipantToVenueDistance(null, venue);
      expect(distance).toBe(0);
    });

    test('should handle invalid coordinates', () => {
      const participant = { location_lat: 'invalid', location_lng: -6.2603 };
      const venue = { latitude: 53.3381, longitude: -6.2592 };
      
      const distance = calculateParticipantToVenueDistance(participant, venue);
      expect(distance).toBe(0);
    });
  });

  describe('generateMockDistance', () => {
    test('should generate distance within specified range', () => {
      const distance = generateMockDistance(5, 15);
      expect(distance).toBeGreaterThanOrEqual(5);
      expect(distance).toBeLessThanOrEqual(15);
    });

    test('should use default range when not specified', () => {
      const distance = generateMockDistance();
      expect(distance).toBeGreaterThanOrEqual(1);
      expect(distance).toBeLessThanOrEqual(20);
    });
  });
});

// ============================================
// CARBON CONTEXT TESTS
// ============================================

describe('Carbon Context Data', () => {
  
  describe('getCarbonContextData', () => {
    test('should return minimal impact for very low emissions', () => {
      const context = getCarbonContextData(0.05);
      expect(context.message).toContain('Minimal');
      expect(context.icon).toBe('🌱');
    });

    test('should return low impact for emissions < 1', () => {
      const context = getCarbonContextData(0.5);
      expect(context.message).toContain('Low');
      expect(context.icon).toBe('🍃');
    });

    test('should return moderate impact for emissions 1-5', () => {
      const context = getCarbonContextData(3);
      expect(context.message).toContain('Moderate');
      expect(context.icon).toBe('🌍');
    });

    test('should return high impact for large emissions', () => {
      const context = getCarbonContextData(15);
      expect(context.message).toContain('High');
      expect(context.icon).toBe('🚨');
    });
  });

  describe('calculateCarbonEquivalent', () => {
    test('should calculate tree absorption equivalent', () => {
      const result = calculateCarbonEquivalent(21.77, 'tree_absorption');
      expect(result.value).toBe(1);
      expect(result.unit).toBe('trees');
    });

    test('should calculate smartphone charge equivalent', () => {
      const result = calculateCarbonEquivalent(0.08, 'smartphone_charges');
      expect(result.value).toBe(10);
      expect(result.unit).toBe('charges');
    });

    test('should handle unknown equivalent type', () => {
      const result = calculateCarbonEquivalent(10, 'unknown_type');
      expect(result).toBeNull();
    });
  });
});

// ============================================
// INTEGRATION SCENARIOS
// ============================================

describe('Integration Scenarios', () => {
  
  test('Complete journey: Calculate distance and emissions', () => {
    // Scenario: User drives from Dublin City Centre to Temple Bar
    const origin = { lat: 53.3498, lng: -6.2603 };
    const destination = { lat: 53.3453, lng: -6.2629 };
    const mode = 'driving';

    // Step 1: Calculate distance
    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    expect(distance).toBeGreaterThan(0);

    // Step 2: Calculate emissions
    const emissions = calculateCarbonEmission(distance, mode);
    expect(emissions).toBeGreaterThan(0);

    // Step 3: Get context
    const context = getCarbonContextData(emissions);
    expect(context).toBeDefined();
    expect(context.message).toBeDefined();
  });

  test('Complete journey: Zero emissions for walking', () => {
    const origin = { lat: 53.3498, lng: -6.2603 };
    const destination = { lat: 53.3453, lng: -6.2629 };
    const mode = 'walking';

    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const emissions = calculateCarbonEmission(distance, mode);
    
    expect(emissions).toBe(0);
  });

  test('Compare modes for same journey', () => {
    const distance = 10; // km
    
    const driving = calculateCarbonEmission(distance, 'driving');
    const transit = calculateCarbonEmission(distance, 'transit');
    const walking = calculateCarbonEmission(distance, 'walking');

    expect(driving).toBeGreaterThan(transit);
    expect(transit).toBeGreaterThan(walking);
    expect(walking).toBe(0);

    // Verify exact values
    expect(driving).toBe(1.2);
    expect(transit).toBe(0.6);
  });

  test('Multiple participants to same venue', () => {
    const participants = [
      { id: 1, location_lat: 53.3498, location_lng: -6.2603, transit_mode: 'driving' },
      { id: 2, location_lat: 53.3381, location_lng: -6.2592, transit_mode: 'transit' },
      { id: 3, location_lat: 53.3400, location_lng: -6.2600, transit_mode: 'walking' }
    ];

    const venue = { latitude: 53.3453, longitude: -6.2629 };

    const journeys = participants.map(p => {
      const distance = calculateDistance(p.location_lat, p.location_lng, venue.latitude, venue.longitude);
      return {
        distanceKm: distance,
        modeOfTransport: p.transit_mode
      };
    });

    const totals = calculateTotalEmissions(journeys);
    
    expect(totals.journeyCount).toBe(3);
    expect(totals.total).toBeGreaterThan(0);
    expect(totals.byMode).toHaveProperty('driving');
    expect(totals.byMode).toHaveProperty('transit');
    expect(totals.byMode).toHaveProperty('walking');
  });

  test('Calculate savings by switching modes', () => {
    const distance = 15; // km typical commute
    
    const savings = getCarbonSavings(distance, 'driving', 'transit');
    
    expect(savings.current).toBe(1.8); // 15 * 0.12
    expect(savings.alternative).toBe(0.9); // 15 * 0.06
    expect(savings.savings).toBe(0.9);
    expect(savings.percentReduction).toBe(50);
    expect(savings.isBetter).toBe(true);
  });
});

// ============================================
// EDGE CASES AND ERROR HANDLING
// ============================================

describe('Edge Cases and Error Handling', () => {
  
  test('should handle very small distances', () => {
    const emissions = calculateCarbonEmission(0.1, 'driving');
    expect(emissions).toBe(0.012);
  });

  test('should handle very large distances', () => {
    const emissions = calculateCarbonEmission(1000, 'driving');
    expect(emissions).toBe(120);
  });

  test('should handle coordinates at equator', () => {
    const distance = calculateDistance(0, 0, 0, 1);
    expect(distance).toBeGreaterThan(0);
  });

  test('should handle coordinates at poles', () => {
    const distance = calculateDistance(90, 0, -90, 0);
    expect(distance).toBeGreaterThan(0);
  });

  test('should handle null/undefined gracefully', () => {
    expect(calculateCarbonEmission(null, 'driving')).toBe(0);
    expect(calculateCarbonEmission(10, null)).toBeGreaterThan(0);
  });
});

// ============================================
// MOCK CONSOLE WARNINGS
// ============================================

// Suppress console warnings during tests
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.warn.mockRestore();
  console.error.mockRestore();
});

// ============================================
// PERFORMANCE TESTS
// ============================================

describe('Performance Tests', () => {
  
  test('should calculate distance quickly for many points', () => {
    const start = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      calculateDistance(53.3498, -6.2603, 53.3381, -6.2592);
    }
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
  });

  test('should calculate emissions quickly for many journeys', () => {
    const start = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      calculateCarbonEmission(10, 'driving');
    }
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in less than 100ms
  });
});

// ============================================
// REALISTIC JOURNEY SCENARIOS
// ============================================

describe('Realistic Journey Scenarios', () => {
  
  test('Short urban walk (500m)', () => {
    const distance = 0.5;
    const emissions = calculateCarbonEmission(distance, 'walking');
    expect(emissions).toBe(0);
  });

  test('Typical bus journey (5km)', () => {
    const distance = 5;
    const emissions = calculateCarbonEmission(distance, 'transit');
    expect(emissions).toBe(0.3); // 5 * 0.06
  });

  test('Suburban car commute (20km)', () => {
    const distance = 20;
    const emissions = calculateCarbonEmission(distance, 'driving');
    expect(emissions).toBe(2.4); // 20 * 0.12
  });

  test('Bike ride across city (8km)', () => {
    const distance = 8;
    const emissions = calculateCarbonEmission(distance, 'bicycling');
    expect(emissions).toBe(0);
  });
});

// Note: API endpoint tests would require a test database and server setup
// These can be added in a separate integration test file
// Example structure:

/*
describe('Carbon API Endpoints', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    // Setup test database
    // Create test user
    // Get auth token
  });

  afterAll(async () => {
    // Cleanup test data
    // Close database connection
  });

  describe('POST /api/carbon/journey', () => {
    test('should log a journey successfully', async () => {
      // Test implementation
    });
  });

  describe('GET /api/carbon/user/:id', () => {
    test('should return user carbon data', async () => {
      // Test implementation
    });
  });
});
*/
