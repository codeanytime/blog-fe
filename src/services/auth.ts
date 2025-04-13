import api from './api';
import { User, LoginCredentials } from '../types';

/**
 * Login with username and password
 * @param credentials The login credentials (username and password)
 * @returns The authenticated user
 */
export const loginWithCredentials = async (credentials: LoginCredentials): Promise<User | null> => {
  try {
    // Use the correct endpoint with error handling
    console.log("Attempting login with credentials");
    const response = await api.post('/api/login', credentials);
    console.log("Login response:", response.data);
    
    // Store the JWT token in localStorage for auth
    if (response.data && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      return response.data.user;
    } else {
      throw new Error("Invalid response format from login endpoint");
    }
  } catch (error: any) {
    console.error('Login error:', error);
    
    // For development, if we can't connect to the backend, use a mock token
    if (error.message?.includes('Network Error') || error.message?.includes('Backend')) {
      console.log('Using mock authentication in development mode');
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBleGFtcGxlLmNvbSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      localStorage.setItem('authToken', mockToken);
      return {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
        pictureUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        username: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    throw error;
  }
};

/**
 * Register a new user
 * @param userData The user data for registration
 * @returns The registered user
 */
export const registerUser = async (userData: { username: string; password: string; email: string; name: string }): Promise<User | null> => {
  try {
    console.log("Attempting user registration");
    const response = await api.post('/api/register', userData);
    console.log("Registration response:", response.data);
    
    // Store the JWT token in localStorage for auth if provided
    if (response.data && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      return response.data.user;
    } else {
      return response.data;
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Authenticate with Google using the Google Identity Services API
 * This function should ONLY be called explicitly when the user wants to login with Google
 * @returns A Promise that resolves to the authenticated User or null
 */
export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    console.log("Explicitly attempting Google login by user request");
    
    // Don't proceed if we're already authenticated with a token
    // This prevents accidental Google OAuth redirects during normal operations
    const existingToken = localStorage.getItem('authToken');
    if (existingToken) {
      console.log('User is already authenticated with a token, skipping Google login');
      const currentUser = await getCurrentUser();
      if (currentUser) {
        return currentUser;
      }
    }
    
    // Define our client ID from environment variable
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
      console.error('Google Client ID is not configured');
      throw new Error('Google Client ID is not configured');
    }
    
    // Use our simplified google-login endpoint
    try {
      console.log('Calling /api/google-login endpoint...');
      const response = await api.post('/api/google-login', {});
      console.log("Google login response:", response.data);
      
      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        return response.data.user;
      } else {
        throw new Error("Invalid response format from Google login endpoint");
      }
    } catch (apiError) {
      console.error("Google login API error:", apiError);
      throw apiError;
    }
  } catch (error: any) {
    console.error('Google login error:', error);
    
    // For development, if we can't connect to the backend, use a mock token
    if (error.message?.includes('Network Error') || error.message?.includes('Backend')) {
      console.log('Using mock Google authentication in development mode');
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBleGFtcGxlLmNvbSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      localStorage.setItem('authToken', mockToken);
      return {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
        pictureUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        username: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    throw error;
  }
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  try {
    console.log("Attempting to logout");
    await api.post('/api/logout');
    localStorage.removeItem('authToken');
    
    // Revoke Google authentication if available
    // Typecasting window to access Google auth
    const windowWithGoogle = window as any;
    if (windowWithGoogle.google && windowWithGoogle.google.accounts) {
      windowWithGoogle.google.accounts.id.disableAutoSelect();
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove token on frontend even if backend logout fails
    localStorage.removeItem('authToken');
    throw error;
  }
};

/**
 * Get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }
    
    console.log("Retrieving current user from /api/user");
    const response = await api.get('/api/user');
    return response.data;
  } catch (error: any) {
    console.error('Get current user error:', error);
    
    // For development, if we can't connect to the backend, use a mock user
    if (error.message?.includes('Network Error') || error.message?.includes('Backend')) {
      console.log('Using mock user in development mode');
      return {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
        pictureUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        username: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    // Clear token if it's invalid or expired
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('authToken');
    }
    return null;
  }
};