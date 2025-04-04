import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
    onImageSelected: (file: File) => void;
    isUploading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isUploading = false }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    const maxSizeMB = 5;

    const validateFile = (file: File | null): string | null => {
        if (!file) return 'No file selected';

        if (!allowedTypes.includes(file.type)) {
            return 'Invalid file type. Please upload JPG, PNG, GIF, SVG, or WEBP images.';
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            return `File size exceeds ${maxSizeMB}MB limit.`;
        }

        return null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            handleFile(file);
        }
    };

    const handleFile = (file: File) => {
        setError(null);

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            onImageSelected(selectedFile);
        }
    };

    return (
        <div className="image-uploader">
            <div
                className={`drop-area ${dragActive ? 'active' : ''} ${error ? 'error' : ''}`}
                onClick={triggerFileInput}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={allowedTypes.join(',')}
                    className="file-input"
                />

                {previewUrl ? (
                    <div className="image-preview">
                        <img src={previewUrl} alt="Preview" />
                    </div>
                ) : (
                    <div className="upload-prompt">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="upload-text">Drop your image here, or click to browse</p>
                        <p className="upload-hint">Supports JPG, PNG, GIF, SVG, WEBP (max {maxSizeMB}MB)</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="upload-actions">
                <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setError(null);
                    }}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    className="upload-btn"
                    disabled={!selectedFile || isUploading}
                    onClick={handleUpload}
                >
                    {isUploading ? (
                        <>
                            <div className="spinner"></div>
                            Uploading...
                        </>
                    ) : (
                        'Upload Image'
                    )}
                </button>
            </div>
        </div>
    );
};

export default ImageUploader;