/**
 * Common API configuration for the application
 * Contains centralized configuration for backend URLs and other API settings
 */

// Backend URL configuration
// Priority order:
// 1. Environment variable REACT_APP_API_BASE_URL
// 2. Direct localhost connection (for development)
// 3. Fallback to relative path with proxy
export const getBackendUrl = (): string => {
  console.log('Frontend env variables:', {
    REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL
  });
  
  // First priority: Use environment variable if available
  if (process.env.REACT_APP_API_BASE_URL) {
    console.log('Using API URL from environment variable');
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Second priority: Direct connection to localhost backend
  if (process.env.NODE_ENV === 'development') {
    console.log('Using direct connection to local backend');
    return 'http://localhost:8000/api';
  }
  
  // Fallback to proxy (relative URL) - this will be rewritten by setupProxy.js
  console.log('Using relative URL with proxy for backend communication');
  return '/api';
};

export const API_BASE_URL = getBackendUrl();

// Helper function to build API endpoint URLs
export const getApiEndpoint = (endpoint: string): string => {
  const baseUrl = API_BASE_URL;
  // Remove trailing slash from baseUrl if present
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Remove leading slash from endpoint if present
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  return `${normalizedBaseUrl}/${normalizedEndpoint}`;
};