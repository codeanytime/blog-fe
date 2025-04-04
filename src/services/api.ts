import axios, { 
  AxiosResponse, 
  AxiosError, 
  AxiosInstance, 
  InternalAxiosRequestConfig 
} from 'axios';
import { Post, PageResponse, MenuItem } from '../types';

// Define the backend API URL
// Get API base URL from environment or use a default
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// For debugging
console.log('Environment variable REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Don't include cookies for cross-origin requests
});

// Add a request interceptor to include authentication token if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
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
      if (error.response.data && typeof error.response.data === 'object' && 
          'message' in error.response.data && 
          error.response.data.message !== 'User not authenticated') {
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
    const response: AxiosResponse<PageResponse<Post>> = await api.get('/posts', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getPostById = async (id: number | string): Promise<Post> => {
  try {
    const response: AxiosResponse<Post> = await api.get(`/posts/${id}`);
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
    const response: AxiosResponse<Post> = await api.post('/posts', postData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const updatePost = async (id: number | string, postData: Partial<CreatePostData>): Promise<Post> => {
  try {
    const response: AxiosResponse<Post> = await api.put(`/posts/${id}`, postData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const deletePost = async (id: number | string): Promise<void> => {
  try {
    await api.delete(`/posts/${id}`);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Menu endpoint
export const getMenu = async (): Promise<MenuItem[]> => {
  try {
    console.log('Making request to:', `${API_BASE_URL}/menu`);
    const response: AxiosResponse<MenuItem[]> = await api.get('/menu');
    console.log('Menu API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Menu API Error:', error);
    // Create a fallback menu just with Home for debugging
    console.log('Using fallback menu');
    return [{ id: 0, label: 'Home', url: '/', order: 0, type: 'home' }];
  }
};

export default api;