import React, { useState, useEffect } from 'react';
import { uploadImageToS3 } from '../../services/s3';
import api from '../../services/api';

interface ImageUploaderProps {
    initialImage?: string;
    onImageUpload: (imageUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ initialImage, onImageUpload }) => {
    const [imageUrl, setImageUrl] = useState<string>(initialImage || '');
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(initialImage || '');
    const [awsConfigured, setAwsConfigured] = useState<boolean | null>(null);

    // Function to check if AWS is configured
    const isAWSConfigured = async (): Promise<boolean> => {
        try {
            const response = await api.get('/s3/status');
            return response.data.configured;
        } catch (error) {
            console.error('AWS config check error:', error);
            return false; // Assume not configured on error
        }
    };

    // Check if AWS is configured when component mounts
    useEffect(() => {
        const checkAWSConfig = async () => {
            try {
                // Make a direct API call to check AWS configuration
                const response = await api.get('/s3/status');
                const configured = response.data.configured;
                setAwsConfigured(configured);
                if (!configured) {
                    setError('AWS S3 is not configured. Images will not be saved permanently. ' +
                        'Contact administrator to configure AWS_ACCESS_KEY, AWS_SECRET_KEY, and AWS_S3_BUCKET.');
                }
            } catch (err) {
                console.error('Error checking AWS configuration:', err);
                setAwsConfigured(false);
            }
        };

        checkAWSConfig();
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                setPreviewUrl(result);

                // If AWS is not configured, use the data URL directly
                if (awsConfigured === false) {
                    setImageUrl(result);
                    onImageUpload(result);
                    setIsUploading(false);
                    setError('Using local image data. This image will not persist if you refresh the page. ' +
                        'Configure AWS S3 for permanent storage.');
                }
            }
        };
        reader.readAsDataURL(file);

        // Only attempt S3 upload if AWS is configured
        if (awsConfigured !== false) {
            try {
                setIsUploading(true);
                setError(null);

                const imageUrl = await uploadImageToS3(file);

                setImageUrl(imageUrl);
                onImageUpload(imageUrl);
                setIsUploading(false);
            } catch (err: any) {
                if (err.message?.includes('AWS credentials')) {
                    // If S3 upload fails due to AWS credentials, use the data URL
                    setAwsConfigured(false);
                    // image URL will be set by the reader.onload handler
                } else {
                    setError('Failed to upload image: ' + (err.message || 'Please try again.'));
                    setIsUploading(false);
                }
                console.error(err);
            }
        }
    };

    const handleRemoveImage = () => {
        setImageUrl('');
        setPreviewUrl('');
        onImageUpload('');
    };

    return (
        <div className="image-uploader">
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {previewUrl ? (
                <div className="image-preview-container">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="image-preview"
                    />
                    {isUploading && (
                        <div className="image-uploading-overlay">
                            <div className="spinner"></div>
                            <p>Uploading...</p>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="btn btn-danger remove-image-btn"
                        disabled={isUploading}
                    >
                        Remove Image
                    </button>
                </div>
            ) : (
                <div className={`image-upload-placeholder ${isUploading ? 'uploading' : ''}`}>
                    {isUploading ? (
                        <>
                            <div className="spinner"></div>
                            <p>Uploading image...</p>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-cloud-upload-alt"></i>
                            <p>Click or drag to upload an image</p>
                        </>
                    )}
                </div>
            )}

            <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="image-upload-input"
                disabled={isUploading}
            />
        </div>
    );
};

export default ImageUploader;