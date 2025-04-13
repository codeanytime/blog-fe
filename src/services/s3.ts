import api from './api';

interface S3UploadResponse {
  url: string;
}

/**
 * Check if AWS credentials are configured in the backend
 * @returns - True if AWS is properly configured, false otherwise
 */
export const isAWSConfigured = async (): Promise<boolean> => {
  try {
    const response = await api.get('/s3/status');
    return response.data.configured;
  } catch (error) {
    console.error('Error checking AWS configuration:', error);
    return false;
  }
};

/**
 * Upload an image to S3 via the backend API
 * @param file - The image file to upload
 * @returns - The URL of the uploaded image
 */
export const uploadImageToS3 = async (file: File): Promise<string> => {
  try {
    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload to S3 via backend
    const response = await api.post<S3UploadResponse>('/s3/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.url;
  } catch (error) {
    console.error('S3 upload failed:', error);
    // For development, return a placeholder image URL
    console.log('Using placeholder image for development');
    return `https://via.placeholder.com/800x600?text=${encodeURIComponent(file.name)}`;
  }
};