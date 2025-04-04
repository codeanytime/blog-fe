import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '../components/Editor';
import ImageUploader from '../components/ImageUploader';
import { getPostById, updatePost } from '../services/api';
import { uploadImageToS3 } from '../services/s3';
import { Post } from '../types';

interface FormErrors {
    title?: string;
    content?: string;
    coverImage?: string;
    fetch?: string;
    submit?: string;
}

type PostParams = {
    id?: string;
};

const EditPostPage: React.FC = () => {
    const { id } = useParams() as PostParams;
    const navigate = useNavigate();

    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [coverImageUrl, setCoverImageUrl] = useState<string>('');
    const [tags, setTags] = useState<string>('');
    const [published, setPublished] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [showCoverImageUploader, setShowCoverImageUploader] = useState<boolean>(false);
    const [uploadingCoverImage, setUploadingCoverImage] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        document.title = 'Edit Post | Blog Platform';

        const fetchPost = async () => {
            if (!id) {
                setErrors({ fetch: 'Invalid post ID' });
                setLoading(false);
                return;
            }

            try {
                const post = await getPostById(id);
                setTitle(post.title);
                setContent(post.content);
                setCoverImageUrl(post.coverImage || '');
                setTags(post.tags ? post.tags.join(', ') : '');
                setPublished(post.published);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching post:', error);
                setErrors({ fetch: 'Failed to load post. Please try again.' });
                setLoading(false);
            }
        };

        fetchPost();

        return () => {
            document.title = 'Blog Platform';
        };
    }, [id]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!content.trim()) {
            newErrors.content = 'Content is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCoverImageUpload = async (file: File) => {
        try {
            setUploadingCoverImage(true);
            const imageUrl = await uploadImageToS3(file);
            setCoverImageUrl(imageUrl);
            setShowCoverImageUploader(false);
        } catch (error) {
            console.error('Error uploading cover image:', error);
            setErrors({
                ...errors,
                coverImage: 'Failed to upload cover image. Please try again.'
            });
        } finally {
            setUploadingCoverImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !id) {
            return;
        }

        try {
            setSubmitting(true);

            const postData = {
                title,
                content,
                coverImage: coverImageUrl,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                published
            };

            await updatePost(id, postData);
            navigate(`/post/${id}`);
        } catch (error) {
            console.error('Error updating post:', error);
            setErrors({
                ...errors,
                submit: 'Failed to update post. Please try again.'
            });
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading post...</p>
            </div>
        );
    }

    if (errors.fetch) {
        return (
            <div className="error-container">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h2>Error</h2>
                <p>{errors.fetch}</p>
                <button onClick={() => navigate('/admin')} className="back-button">
                    Back to Admin
                </button>
            </div>
        );
    }

    return (
        <div className="edit-post-page">
            <div className="container">
                <div className="page-header">
                    <h1>Edit Post</h1>
                </div>

                <form onSubmit={handleSubmit} className="post-form">
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={errors.title ? 'error' : ''}
                            placeholder="Enter post title"
                        />
                        {errors.title && <span className="error-message">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="cover-image">Cover Image</label>
                        {coverImageUrl ? (
                            <div className="cover-image-preview">
                                <img src={coverImageUrl} alt="Cover" />
                                <button
                                    type="button"
                                    className="remove-image-btn"
                                    onClick={() => setCoverImageUrl('')}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="upload-cover-btn"
                                onClick={() => setShowCoverImageUploader(true)}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Upload Cover Image
                            </button>
                        )}
                        {errors.coverImage && <span className="error-message">{errors.coverImage}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <Editor
                            initialContent={content}
                            onContentChange={setContent}
                        />
                        {errors.content && <span className="error-message">{errors.content}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="tags">Tags (comma separated)</label>
                        <input
                            id="tags"
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g. technology, programming, web development"
                        />
                    </div>

                    <div className="form-group publish-option">
                        <label>
                            <input
                                type="checkbox"
                                checked={published}
                                onChange={(e) => setPublished(e.target.checked)}
                            />
                            Published
                        </label>
                    </div>

                    {errors.submit && (
                        <div className="form-error-message">
                            {errors.submit}
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/admin')}
                            className="cancel-btn"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <div className="spinner-small"></div>
                                    Updating...
                                </>
                            ) : (
                                'Update Post'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Cover Image Upload Modal */}
            {showCoverImageUploader && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Upload Cover Image</h3>
                            <button
                                onClick={() => setShowCoverImageUploader(false)}
                                className="close-modal-btn"
                                disabled={uploadingCoverImage}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <ImageUploader
                                onImageSelected={handleCoverImageUpload}
                                isUploading={uploadingCoverImage}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditPostPage;