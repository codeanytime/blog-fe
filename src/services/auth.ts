import api from './api';
import { User, AuthResponse } from '../types';

// Get base URL from environment or API config
// const API_BASE_URL = api.defaults.baseURL?.replace('/api', '') || '';
const API_BASE_URL = 'http://localhost:8080';

export const initiateGoogleLogin = (): void => {
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/oauth2/callback/google`;
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
};

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
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('authToken');
    }
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Logout error:', error);
    localStorage.removeItem('authToken');
    throw error;
  }
};