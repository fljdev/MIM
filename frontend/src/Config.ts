// API configuration
// Uses REACT_APP_BACKEND_URL environment variable in production, localhost in development
export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://172.29.74.27:5000';
