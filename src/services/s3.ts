import api from './api';
import { AxiosResponse, AxiosError } from 'axios';

interface S3UploadResponse {
  url: string;
}

/**
 * Check if AWS credentials are configured in the backend
 * @returns - True if AWS is properly configured, false otherwise
 */
export const isAWSConfigured = async (): Promise<boolean> => {
  try {
    const response: AxiosResponse<{configured: boolean}> = await api.get('/s3/status');
    return response.data.configured;
  } catch (error) {
    console.error('AWS config check error:', error);
    return false; // Assume not configured on error
  }
};

/**
 * Upload an image to S3 via the backend API
 * @param file - The image file to upload
 * @returns - The URL of the uploaded image
 */
export const uploadImageToS3 = async (file: File): Promise<string> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Set up request with form data
    const response: AxiosResponse<S3UploadResponse> = await api.post('/s3/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Return the URL of the uploaded image
    return response.data.url;
  } catch (error) {
    console.error('S3 upload error:', error);
    const axiosError = error as AxiosError<{message?: string}>;
    
    // Check if error is related to AWS configuration
    if (axiosError.response?.status === 503 || 
        axiosError.response?.data?.message?.includes('AWS')) {
      throw new Error('S3 upload failed: AWS credentials are not configured. ' +
        'Please configure AWS_ACCESS_KEY, AWS_SECRET_KEY, and AWS_S3_BUCKET.');
    }
    
    throw new Error('Failed to upload image: ' + 
      (axiosError.response?.data?.message || axiosError.message));
  }
};