import api from './api';
import { User, AuthResponse } from '../types';

// Adding Google API types for the new Google Identity Services API
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          prompt: (callback?: (notification: {
            isDisplayed: () => boolean;
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getMomentType: () => string;
          }) => void) => void;
          renderButton: (element: HTMLElement, options: {
            theme?: string;
            size?: string;
            width?: string;
            text?: string;
            shape?: string;
          }) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

// Google OAuth client ID
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

// Initialize Google OAuth
export const initGoogleAuth = (): void => {
  // The new Google Identity Services API doesn't require explicit initialization
  // It's automatically initialized when the Google Sign-In script loads
  console.log('Google Identity Services API ready');
};

// Login with Google - This function is now a wrapper to trigger the Google Sign-In flow
export const loginWithGoogle = async (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    try {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        console.error('Google Identity Services not loaded');
        reject(new Error('Google Identity Services not loaded'));
        return;
      }
      
      // Display the One Tap UI or the Sign In With Google button
      window.google.accounts.id.prompt();
      
      // Since we can't reliably determine if the prompt was shown, we'll just resolve
      // The actual authentication will happen in the callback provided during initialization
      
      // This will be called from the Login component when Google returns the credentials
      // We're just setting up the structure here
      resolve(null);
    } catch (error) {
      console.error('Google login preparation error:', error);
      reject(error);
    }
  });
};

// This function handles the token received from Google Identity Services
export const handleGoogleCredential = async (credential: string): Promise<User> => {
  try {
    // Send the ID token to the backend
    const response = await api.post<AuthResponse>('/auth/google', { idToken: credential });
    
    // Store authentication data
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    
    return response.data.user;
  } catch (error) {
    console.error('Google credential handling error:', error);
    throw error;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('authToken');
    
    // With the new Google Identity Services API, there's no explicit sign-out method
    // The token is simply discarded
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove token on frontend even if backend logout fails
    localStorage.removeItem('authToken');
    throw error;
  }
};

// Get current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }
    
    const response = await api.get<User>('/auth/me');
    return response.data;
  } catch (error: any) {
    console.error('Get current user error:', error);
    // Clear token if it's invalid or expired
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('authToken');
    }
    return null;
  }
};