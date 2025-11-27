// Development Mode Configuration
// Toggle between mock data (dev) and real APIs (production)

// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Feature flags for development
export const DEV_CONFIG = {
  // Toggle mock data (set to true during development)
  USE_MOCK_VENUES: true,
  USE_MOCK_GEOCODING: false, // Keep false since you have real locations
  
  // Mock API delays (makes it feel more real)
  MOCK_API_DELAY: 300, // ms
  
  // Development helpers
  SHOW_DEBUG_INFO: true,
  LOG_API_CALLS: true,
  SKIP_AUTH: false, // Set true to bypass login during testing
  
  // Test user credentials
  TEST_USER: {
    email: 'john@test.mim',
    password: 'test123', // You'll need to set this
    name: 'John Test'
  }
};

// API endpoint helper
export function getApiUrl(endpoint: string): string {
  const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  return `${baseUrl}${endpoint}`;
}

// Development logger
export function devLog(message: string, data?: any) {
  if (DEV_CONFIG.SHOW_DEBUG_INFO && isDevelopment) {
    console.log(`[DEV] ${message}`, data || '');
  }
}

// Example usage in components:
/*
import { DEV_CONFIG, devLog } from './config/devConfig';
import { getMockVenues } from './mockVenueData';

async function findVenues(midpoint) {
  if (DEV_CONFIG.USE_MOCK_VENUES) {
    devLog('Using mock venues');
    await mockApiDelay(DEV_CONFIG.MOCK_API_DELAY);
    return getMockVenues(midpoint);
  } else {
    devLog('Calling real Google Places API');
    return await realGooglePlacesCall(midpoint);
  }
}
*/