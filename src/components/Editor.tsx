import React, { useState, useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import ImageUploader from './ImageUploader';
import { uploadImageToS3 } from '../services/s3';

interface EditorProps {
    initialContent?: string;
    onContentChange: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ initialContent = '', onContentChange }) => {
    const [content, setContent] = useState<string>(initialContent);
    const [showImageUploader, setShowImageUploader] = useState<boolean>(false);
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const editorRef = useRef<any>(null);

    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    const handleEditorChange = (_event: any, editor: any) => {
        const data = editor.getData();
        setContent(data);
        onContentChange(data);
    };

    const handleImageUpload = async (file: File) => {
        try {
            setUploadingImage(true);
            setError(null);

            const imageUrl = await uploadImageToS3(file);

            // Insert the image at the cursor position in the editor
            const editor = editorRef.current?.editor;
            if (editor) {
                const imgHtml = `<img src="${imageUrl}" alt="${file.name}" />`;
                editor.model.change(() => {
                    editor.model.insertContent(
                        editor.data.processor.toView(imgHtml),
                        editor.model.document.selection
                    );
                });
            }

            setShowImageUploader(false);
        } catch (err) {
            console.error('Error uploading image:', err);
            setError('Failed to upload image. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const editorConfig = {
        toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'blockQuote',
            'insertTable',
            '|',
            'undo',
            'redo'
        ],
        // Disable the default image upload as we're handling it ourselves
        removePlugins: ['ImageUpload']
    };

    return (
        <div className="editor-container">
            <CKEditor
                editor={ClassicEditor}
                data={content}
                config={editorConfig}
                onChange={handleEditorChange}
                onReady={(editor: any) => {
                    editorRef.current = { editor };
                }}
            />

            <div className="editor-toolbar">
                <button
                    type="button"
                    onClick={() => setShowImageUploader(true)}
                    className="image-upload-btn"
                    disabled={uploadingImage}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Add Image
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {showImageUploader && (
                <div className="image-uploader-modal">
                    <div className="image-uploader-content">
                        <button
                            className="close-modal-btn"
                            onClick={() => setShowImageUploader(false)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <h3>Upload Image</h3>
                        <ImageUploader onImageSelected={handleImageUpload} isUploading={uploadingImage} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Editor;