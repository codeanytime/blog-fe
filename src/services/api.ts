import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Post, PageResponse } from '../types';
import { API_BASE_URL } from '../utils/apiConfig';

// Debug information
console.log('Using backend URL:', API_BASE_URL);
console.log('Running in Replit environment:', Boolean(process.env.REPLIT_DEV_DOMAIN));
console.log('Frontend env variables:', {
  REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'not set'
});

// Create axios instance with configuration from apiConfig
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  },
  withCredentials: true, // Enable credentials for authentication
  timeout: 30000, // 30 seconds timeout for requests
});

// Helper function to check if the user already has a valid auth token
const hasValidAuthToken = (): boolean => {
  const token = localStorage.getItem('authToken');
  return !!token; // Convert to boolean
};

// State to track if we're already processing a Google redirect
let isHandlingGoogleRedirect = false;

// Add a request interceptor to include authentication token if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('authToken');
    const authMethod = localStorage.getItem('auth_method') || 'unknown';
    
    // Always add X-Skip-Auth-Redirect header to prevent Google OAuth redirects
    // This is critical for preventing unwanted redirections
    config.headers['X-Skip-Auth-Redirect'] = 'true';
    
    // Always add X-Auth-Method header to indicate the current authentication method
    // This helps the backend know whether to allow Google OAuth redirects
    config.headers['X-Auth-Method'] = authMethod;
    
    // Critical fix: Prevent Google OAuth redirects when already authenticated
    // This specifically addresses the issue with post updates triggering Google OAuth
    if (config.url && 
        (config.url.includes('google') || config.url.includes('oauth')) && 
        config.url !== '/google-login' && 
        hasValidAuthToken() && 
        !isHandlingGoogleRedirect) {
      
      // Log and cancel inappropriate Google OAuth requests
      console.warn('🛑 BLOCKING GOOGLE OAUTH REQUEST - User already authenticated');
      
      // Create a controller to abort the request
      const controller = new AbortController();
      controller.abort('User already authenticated with token');
      config.signal = controller.signal;
      
      return config;
    }
    
    // If this is a username/password flow (authMethod === 'credentials'),
    // always ensure we don't trigger Google OAuth redirects
    if (authMethod === 'credentials') {
      console.log('🔒 Username/password auth flow detected - enforcing X-Skip-Auth-Redirect');
      config.headers['X-Skip-Auth-Redirect'] = 'true';
    }
    
    // Normal token handling
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Debug log for critical APIs
    if (config.url && (
        config.url.includes('/posts') || 
        config.url.includes('/user') || 
        config.url.includes('/login')
      )) {
      console.log('🔍 API Request:', {
        url: config.url,
        method: config.method,
        headers: {
          'Authorization': token ? 'Bearer [TOKEN EXISTS]' : 'Not provided',
          'X-Skip-Auth-Redirect': config.headers['X-Skip-Auth-Redirect'],
          'X-Auth-Method': config.headers['X-Auth-Method'],
          'Content-Type': config.headers['Content-Type'],
        }
      });
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
    // Detect and block Google OAuth redirects
    const url = error.response?.request?.responseURL;
    if (url && typeof url === 'string' && 
        (url.includes('accounts.google.com') || url.includes('oauth')) && 
        hasValidAuthToken() && 
        !isHandlingGoogleRedirect) {
      
      console.error('🛑 BLOCKING GOOGLE OAUTH REDIRECT - Already authenticated');
      
      // Don't allow redirects from regular operations like editing posts
      const customError = new Error('Authentication already exists - operation blocked') as any;
      customError.isAuthError = true;
      return Promise.reject(customError);
    }
    
    // Handle session expiration or unauthorized access
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Get the current auth method before clearing tokens
      const authMethod = localStorage.getItem('auth_method');
      console.log(`Auth error with auth method: ${authMethod || 'unknown'}`);
      
      // Clear local storage and redirect to login if needed
      if (error.response.data && (error.response.data as any).message !== 'User not authenticated') {
        localStorage.removeItem('authToken');
        
        // Keep the auth_method preference even after logout
        // This ensures that when we redirect to login page, it respects the previous auth flow
        
        // Only redirect if not already in the login process
        if (!window.location.pathname.includes('login')) {
          window.location.href = '/';
        }
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
    
    const postsEndpoint = `${API_BASE_URL}/posts`.replace('/api/api/', '/api/');
    console.log('Fetching posts with URL:', postsEndpoint);
    
    // For GET operations that access public endpoints, use direct axios call
    // This bypasses any potential issues with the configured API client
    const response = await axios.get(postsEndpoint, {
      params,
      withCredentials: true, // Changed to true for CORS with credentials
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);
    
    let errorMessage = 'Failed to fetch posts from the server';
    
    if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Network error - backend service is unavailable';
      console.log('Retrying posts fetch in 1000ms... (attempt 1/3)');
      
      // Add retry logic for network errors
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retryParams: Record<string, any> = { page, size };
        if (search) {
          retryParams.search = search;
        }
        
        const postsEndpoint = `${API_BASE_URL}/posts`.replace('/api/api/', '/api/');
        
        // Use direct axios for retry as well
        const response = await axios.get(postsEndpoint, {
          params: retryParams,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        return response.data;
      } catch (retryError: any) {
        console.error('First retry failed:', retryError);
        
        console.log('Retrying posts fetch in 2000ms... (attempt 2/3)');
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const retryParams: Record<string, any> = { page, size };
          if (search) {
            retryParams.search = search;
          }
          
          const postsEndpoint = `${API_BASE_URL}/posts`.replace('/api/api/', '/api/');
          const response = await axios.get(postsEndpoint, {
            params: retryParams,
            withCredentials: false,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });
          
          return response.data;
        } catch (retryError2: any) {
          console.error('Second retry failed:', retryError2);
          
          console.log('Retrying posts fetch in 4000ms... (attempt 3/3)');
          try {
            await new Promise(resolve => setTimeout(resolve, 4000));
            const retryParams: Record<string, any> = { page, size };
            if (search) {
              retryParams.search = search;
            }
            
            const postsEndpoint = `${API_BASE_URL}/posts`.replace('/api/api/', '/api/');
            const response = await axios.get(postsEndpoint, {
              params: retryParams,
              withCredentials: false,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              }
            });
            
            return response.data;
          } catch (finalError: any) {
            console.error('All retries failed:', finalError);
            throw finalError;
          }
        }
      }
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
    console.log(`Getting post with ID: ${id}`);
    const response = await api.get(`/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error('API Error when getting post by ID:', error);
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
    // First verify we have a valid token to prevent unwanted Google OAuth redirects
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found when attempting to create post');
      throw new Error('Authentication required. Please login before creating posts.');
    }
    
    console.log('Creating new post with valid token:', token ? 'Token exists' : 'No token');
    
    try {
      // Set isHandlingGoogleRedirect to false to ensure we block any OAuth redirects
      isHandlingGoogleRedirect = false;
      
      // Add extra authorization header for this specific request to prevent Google OAuth redirects
      const response = await api.post('/posts', postData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Skip-Auth-Redirect': 'true' // Tell backend to skip OAuth redirects
        }
      });
      
      console.log('Create post response:', response.data);
      return response.data;
    } catch (apiError: any) {
      // Special handling for Google OAuth errors during post creation
      if (apiError.message && 
          (apiError.message.includes('Google') || 
           apiError.message.includes('oauth') || 
           apiError.message.includes('accounts.google') ||
           apiError.isAuthError)) {
        
        console.error('🚫 Blocked Google OAuth redirect during post creation');
        throw new Error('Authentication error: Please logout and login again with username/password.');
      }
      
      // For other errors, pass them through
      throw apiError;
    }
  } catch (error: any) {
    console.error('Error creating post:', error);
    
    // Improve error messages for the user
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Your session has expired. Please login again.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error while creating post. Please try again later.');
    }
    
    throw error;
  }
};

export const updatePost = async (id: number | string, postData: Partial<CreatePostData>): Promise<Post> => {
  try {
    // First verify we have a valid token to prevent unwanted Google OAuth redirects
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found when attempting to update post');
      throw new Error('Authentication required. Please login before updating posts.');
    }
    
    console.log(`Updating post with ID: ${id} with valid token`, postData);
    
    try {
      // Set isHandlingGoogleRedirect to false to ensure we block any OAuth redirects
      isHandlingGoogleRedirect = false;
      
      // Add extra authorization header for this specific request
      const response = await api.put(`/posts/${id}`, postData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Skip-Auth-Redirect': 'true' // Tell backend to skip OAuth redirects
        }
      });
      
      console.log('Update post response:', response.data);
      return response.data;
    } catch (apiError: any) {
      // Special handling for Google OAuth errors during update
      if (apiError.message && 
          (apiError.message.includes('Google') || 
           apiError.message.includes('oauth') || 
           apiError.message.includes('accounts.google') ||
           apiError.isAuthError)) {
        
        console.error('🚫 Blocked Google OAuth redirect during post update');
        throw new Error('Authentication error: Please logout and login again with username/password.');
      }
      
      // For other errors, pass them through
      throw apiError;
    }
  } catch (error: any) {
    console.error('Error updating post:', error);
    
    // Improve error messages for the user
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Your session has expired. Please login again.');
    } else if (error.response?.status === 404) {
      throw new Error('Post not found. It may have been deleted.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error while updating post. Please try again later.');
    }
    
    throw error;
  }
};

export const deletePost = async (id: number | string): Promise<void> => {
  try {
    // First verify we have a valid token to prevent unwanted Google OAuth redirects
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found when attempting to delete post');
      throw new Error('Authentication required. Please login before deleting posts.');
    }
    
    console.log(`Deleting post with ID: ${id}`);
    
    try {
      // Set isHandlingGoogleRedirect to false to ensure we block any OAuth redirects
      isHandlingGoogleRedirect = false;
      
      // Fix for delete post API endpoint
      const deleteEndpoint = `${API_BASE_URL}/posts/${id}`.replace('/api/api/', '/api/');
      console.log('Using delete endpoint:', deleteEndpoint);
      
      // Use direct fetch for full control over the request
      console.log('Making DELETE request for post with ID:', id);
      const response = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Skip-Auth-Redirect': 'true', // Tell backend to skip OAuth redirects
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Delete request failed with status ${response.status}:`, errorText);
        
        if (response.status === 403) {
          throw new Error('Permission denied. You do not have admin privileges to delete posts.');
        } else if (response.status === 404) {
          throw new Error('Post not found. It may have been deleted already.');
        } else {
          throw new Error(`Server returned error: ${response.status}`);
        }
      }
      
      console.log('Post successfully deleted');
      return;
    } catch (apiError: any) {
      // Special handling for specific errors
      if (apiError.message && 
          (apiError.message.includes('Google') || 
           apiError.message.includes('oauth') || 
           apiError.message.includes('accounts.google') ||
           apiError.isAuthError)) {
        
        console.error('🚫 Blocked Google OAuth redirect during post deletion');
        throw new Error('Authentication error: Please logout and login again with username/password.');
      }
      
      // For other errors, pass them through
      throw apiError;
    }
  } catch (error: any) {
    console.error('Error deleting post:', error);
    
    // Use error message from the error object if it exists
    if (error.message) {
      throw error;
    }
    
    // Fallback to generic error messages based on HTTP status
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Your session has expired or you lack proper permissions. Please login again.');
    } else if (error.response?.status === 404) {
      throw new Error('Post not found. It may have been deleted already.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error while deleting post. Please try again later.');
    }
    
    throw new Error('Failed to delete post. Please try again.');
  }
};

// Menu endpoints
export const getMenu = async (): Promise<any[]> => {
  try {
    // Add a timeout of 10 seconds to prevent hanging requests
    console.log('Fetching menu data');
    
    const menuEndpoint = `${API_BASE_URL}/menu`.replace('/api/api/', '/api/');
    console.log('Fetching menu with URL:', menuEndpoint);
    
    // For GET operations that access public endpoints, use direct axios call
    // This bypasses any potential issues with the configured API client
    console.log('Making direct request to menu endpoint with credentials');
    const response = await api.get('/menu', {
      timeout: 30000
    });
    
    console.log('Menu response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Menu API Error:', error);
    
    // Handle common errors with more informative messages
    let errorMessage = 'Failed to fetch menu from the server';
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.warn('Network or timeout error when fetching menu');
      
      // Add retry logic
      try {
        console.log('Retrying menu fetch in 1000ms... (attempt 1/3)');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use direct axios for the retry
        const menuEndpoint = `${API_BASE_URL}/menu`.replace('/api/api/', '/api/');
        const retryResponse = await axios.get(menuEndpoint, {
          timeout: 30000,
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        return retryResponse.data;
      } catch (retryError) {
        console.error('Menu retry failed:', retryError);
        errorMessage = 'Network error - backend service is unavailable or timed out';
      }
    } else if (error.response) {
      // Handle HTTP error responses
      if (error.response.status === 504) {
        errorMessage = 'Gateway timeout - the backend service took too long to respond';
      } else if (error.response.status === 404) {
        errorMessage = 'Menu endpoint not found on the backend service';
      }
    }
    
    // Throw an informative error that can be handled by the component
    throw new Error(errorMessage);
  }
};

export default api;