// API Helpers - Service layer for weather and traffic data
// This file provides a clean interface to switch between mock and real APIs
// Simply change USE_REAL_APIS to true when you're ready to use real API calls

import { getMockWeather, isWeatherGoodForOutdoorTransit, getWeatherWarning } from './mocks/mockWeatherData';
import { 
  getMockDirectionsWithTraffic, 
  getTrafficDelay, 
  getTrafficDisplayInfo,
  getCurrentTrafficCondition,
  isRushHour 
} from './mocks/mockTrafficData';

// ============================================
// CONFIGURATION - FLIP THIS TO SWITCH TO REAL APIS
// ============================================
const USE_REAL_APIS = false;

// API Keys (add these to environment variables in production)
const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || 'your_key_here';
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'your_key_here';

// ============================================
// WEATHER SERVICE
// ============================================

/**
 * Get weather data for a specific location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Weather data in OpenWeatherMap format
 */
export const getWeatherForLocation = async (lat, lng) => {
  if (USE_REAL_APIS) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching real weather data:', error);
      // Fallback to mock data if real API fails
      return getMockWeather(lat, lng);
    }
  } else {
    // Return mock data
    return getMockWeather(lat, lng);
  }
};

/**
 * Check if weather is suitable for outdoor transit (walking/biking)
 * @param {Object} weatherData - Weather data from getWeatherForLocation
 * @returns {boolean} True if weather is good for outdoor transit
 */
export const checkWeatherSuitability = (weatherData) => {
  return isWeatherGoodForOutdoorTransit(weatherData);
};

/**
 * Get weather warning message if applicable
 * @param {Object} weatherData - Weather data from getWeatherForLocation
 * @returns {string|null} Warning message or null if no warning
 */
export const getWeatherWarningMessage = (weatherData) => {
  return getWeatherWarning(weatherData);
};

// ============================================
// TRAFFIC SERVICE
// ============================================

/**
 * Get directions with traffic data
 * @param {Object} origin - {lat, lng}
 * @param {Object} destination - {lat, lng}
 * @param {string} mode - "driving" | "walking" | "bicycling" | "transit"
 * @param {number} baseDurationMinutes - Estimated base duration without traffic
 * @returns {Promise<Object>} Directions data in Google Directions API format
 */
export const getDirectionsWithTraffic = async (origin, destination, mode, baseDurationMinutes) => {
  if (USE_REAL_APIS) {
    try {
      const originStr = `${origin.lat},${origin.lng}`;
      const destinationStr = `${destination.lat},${destination.lng}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&mode=${mode}&departure_time=now&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Directions API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Directions API returned status: ${data.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching real directions data:', error);
      // Fallback to mock data if real API fails
      return getMockDirectionsWithTraffic(origin, destination, mode, baseDurationMinutes);
    }
  } else {
    // Return mock data
    return getMockDirectionsWithTraffic(origin, destination, mode, baseDurationMinutes);
  }
};

/**
 * Calculate traffic delay for a route
 * @param {number} baseDurationMinutes - Base duration without traffic
 * @param {string} transitMode - "driving" | "walking" | "bicycling" | "transit"
 * @returns {number} Delay in minutes
 */
export const calculateTrafficDelay = (baseDurationMinutes, transitMode) => {
  const baseDurationSeconds = baseDurationMinutes * 60;
  const delaySeconds = getTrafficDelay(baseDurationSeconds, transitMode);
  return Math.round(delaySeconds / 60);
};

/**
 * Get current traffic condition
 * @returns {Object} {level: string, multiplier: number, description: string}
 */
export const getCurrentTraffic = () => {
  return getCurrentTrafficCondition();
};

/**
 * Get formatted traffic info for display
 * @param {number} baseDurationMinutes - Base duration without traffic
 * @param {string} transitMode - Transit mode
 * @returns {Object} {emoji: string, text: string, delay: number, totalTime: number}
 */
export const getTrafficInfo = (baseDurationMinutes, transitMode) => {
  return getTrafficDisplayInfo(baseDurationMinutes, transitMode);
};

/**
 * Check if it's currently rush hour
 * @returns {boolean} True if rush hour
 */
export const checkRushHour = () => {
  return isRushHour();
};

// ============================================
// COMBINED HELPERS
// ============================================

/**
 * Get all relevant data for a route (weather + traffic)
 * @param {Object} params
 * @param {Object} params.origin - {lat, lng}
 * @param {Object} params.destination - {lat, lng}
 * @param {string} params.mode - Transit mode
 * @param {number} params.baseDurationMinutes - Base duration estimate
 * @returns {Promise<Object>} Combined weather and traffic data
 */
export const getRouteConditions = async ({ origin, destination, mode, baseDurationMinutes }) => {
  try {
    // Get weather for origin and destination
    const [originWeather, destinationWeather] = await Promise.all([
      getWeatherForLocation(origin.lat, origin.lng),
      getWeatherForLocation(destination.lat, destination.lng)
    ]);
    
    // Get traffic info
    const trafficInfo = getTrafficInfo(baseDurationMinutes, mode);
    
    // Check weather suitability for outdoor modes
    const isWeatherSuitable = mode === 'walking' || mode === 'bicycling' 
      ? checkWeatherSuitability(originWeather) && checkWeatherSuitability(destinationWeather)
      : true;
    
    // Get any weather warnings
    const originWarning = getWeatherWarningMessage(originWeather);
    const destinationWarning = getWeatherWarningMessage(destinationWeather);
    
    return {
      origin: {
        weather: originWeather,
        warning: originWarning
      },
      destination: {
        weather: destinationWeather,
        warning: destinationWarning
      },
      traffic: trafficInfo,
      isWeatherSuitable,
      isRushHour: checkRushHour(),
      adjustedDuration: trafficInfo.totalTime,
      recommendations: generateRecommendations({
        mode,
        isWeatherSuitable,
        traffic: trafficInfo,
        originWeather,
        destinationWeather
      })
    };
  } catch (error) {
    console.error('Error fetching route conditions:', error);
    return null;
  }
};

/**
 * Generate recommendations based on conditions
 */
const generateRecommendations = ({ mode, isWeatherSuitable, traffic, originWeather, destinationWeather }) => {
  const recommendations = [];
  
  // Weather recommendations
  if (!isWeatherSuitable && (mode === 'walking' || mode === 'bicycling')) {
    recommendations.push({
      type: 'warning',
      message: 'Consider using transit or driving due to weather conditions'
    });
  }
  
  // Traffic recommendations
  if (traffic.delay > 10 && mode === 'driving') {
    recommendations.push({
      type: 'warning',
      message: `Heavy traffic expected. Consider leaving ${traffic.delay} minutes earlier or using public transit`
    });
  }
  
  // Rush hour recommendations
  if (checkRushHour() && mode === 'driving') {
    recommendations.push({
      type: 'info',
      message: 'Rush hour traffic - transit may be faster'
    });
  }
  
  // Good weather recommendations
  if (isWeatherSuitable && originWeather.weather[0].main === 'Clear' && mode === 'driving') {
    recommendations.push({
      type: 'tip',
      message: 'Great weather for cycling! 🚴'
    });
  }
  
  return recommendations;
};

/**
 * Get API status (for debugging/settings page)
 * @returns {Object} Current API configuration
 */
export const getApiStatus = () => {
  return {
    usingRealApis: USE_REAL_APIS,
    weatherApiConfigured: OPENWEATHER_API_KEY !== 'your_key_here',
    googleMapsApiConfigured: GOOGLE_MAPS_API_KEY !== 'your_key_here',
    apis: {
      weather: USE_REAL_APIS ? 'OpenWeatherMap (Live)' : 'Mock Data',
      traffic: USE_REAL_APIS ? 'Google Directions (Live)' : 'Mock Data'
    }
  };
};

// Export the flag for external checking if needed
export const isUsingRealApis = () => USE_REAL_APIS;
