import React, { useState, useRef } from 'react';
import '../styles/image-uploader.css';

interface ImageUploaderProps {
    onImageSelected: (file: File) => void;
    isUploading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    onImageSelected,
    isUploading = false
}) => {
    const [dragActive, setDragActive] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle drag events
    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    // Handle drop event
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    // Handle file input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    // Handle file button click
    const handleButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };

    // Process the selected file
    const handleFile = (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (jpg, png, etc.)');
            return;
        }

        // Pass file to parent component
        onImageSelected(file);
    };

    return (
        <div
            className={`image-uploader ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                ref={inputRef}
                className="hidden"
            />

            {isUploading ? (
                <div className="image-uploader-loading">
                    <div className="image-upload-spinner"></div>
                    <p>Uploading image...</p>
                </div>
            ) : (
                <>
                    <div>
                        <svg className="image-uploader-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 10L12 5L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 5V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="image-uploader-text">Drag and drop an image here, or click to select a file</p>
                        <p className="image-uploader-hint">Supported formats: JPG, PNG, GIF</p>
                    </div>

                    <button
                        type="button"
                        className="image-uploader-button"
                        onClick={handleButtonClick}
                    >
                        Select Image
                    </button>
                </>
            )}
        </div>
    );
};

export default ImageUploader;