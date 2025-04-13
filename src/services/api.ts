import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Post, PageResponse } from '../types';

// Define the backend API URL based on environment
const getApiUrl = (): string => {
  // Get API base URL from environment variable
  const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  console.log('Using API URL:', apiUrl);
  return apiUrl;
};

const API_BASE_URL = getApiUrl();

// Log the API URL being used for debugging
console.log('Using API URL:', API_BASE_URL);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Needed for session cookies and authentication
});

// Add a request interceptor to include authentication token if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<AxiosError> => {
    // Handle session expiration or unauthorized access
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear local storage and redirect to login if needed
      if (error.response.data && (error.response.data as any).message !== 'User not authenticated') {
        localStorage.removeItem('authToken');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Posts endpoints
export const getPosts = async (
  page: number = 0, 
  size: number = 10, 
  search: string = ''
): Promise<PageResponse<Post>> => {
  try {
    const params: Record<string, any> = { page, size };
    if (search) {
      params.search = search;
    }
    const response = await api.get('/api/posts', { params });
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);
    
    let errorMessage = 'Failed to fetch posts from the server';
    
    if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Network error - backend service is unavailable';
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 404) {
        errorMessage = 'The requested resource was not found';
      } else if (error.response.status === 500) {
        errorMessage = 'Internal server error - the backend service encountered a problem';
      }
    } 
    
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).originalError = error;
    throw enhancedError;
  }
};

export const getPostById = async (id: number | string): Promise<Post> => {
  try {
    const response = await api.get(`/api/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export interface CreatePostData {
  title: string;
  content: string;
  coverImage?: string;
  published?: boolean;
  categoryIds?: number[];
  primaryCategoryId?: number;
}

export const createPost = async (postData: CreatePostData): Promise<Post> => {
  try {
    const response = await api.post('/api/posts', postData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const updatePost = async (id: number | string, postData: Partial<CreatePostData>): Promise<Post> => {
  try {
    const response = await api.put(`/api/posts/${id}`, postData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const deletePost = async (id: number | string): Promise<void> => {
  try {
    const response = await api.delete(`/api/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Menu endpoints
export const getMenu = async (): Promise<any[]> => {
  try {
    const response = await api.get('/api/menu');
    return response.data;
  } catch (error) {
    console.error('Menu API Error:', error);
    // Return a default menu for development
    return [
      { id: 1, label: 'Home', url: '/', order: 1, type: 'INTERNAL' },
      { id: 2, label: 'Technology', url: '/category/technology', order: 2, type: 'CATEGORY' },
      { id: 3, label: 'Business', url: '/category/business', order: 3, type: 'CATEGORY' }
    ];
  }
};

export default api;