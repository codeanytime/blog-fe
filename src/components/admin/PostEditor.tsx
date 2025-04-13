import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, createPost, updatePost } from '../../services/api';
import { getAllCategories } from '../../services/categories';
import Editor from '../Editor';
import ImageUploader from './ImageUploader';
import { Post, Category } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface PostFormData {
    title: string;
    content: string;
    coverImage?: string;
    published: boolean;
    categories: number[];
    primaryCategoryId?: number;
}

const PostEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin } = useAuth();

    const [formData, setFormData] = useState<PostFormData>({
        title: '',
        content: '',
        coverImage: '',
        published: true,
        categories: [],
        primaryCategoryId: undefined
    });

    const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(!!id);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const isEditMode = !!id;

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch all categories
                const categories = await getAllCategories();
                setAvailableCategories(categories);

                // If in edit mode, fetch the post data
                if (isEditMode && id) {
                    setIsLoading(true);
                    const post = await getPostById(parseInt(id, 10));

                    setFormData({
                        title: post.title,
                        content: post.content,
                        coverImage: post.coverImage || '',
                        published: post.published,
                        categories: post.categories?.map(cat => cat.id) || [],
                        primaryCategoryId: post.primaryCategory?.id
                    });

                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again.');
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, isAuthenticated, isAdmin, navigate, isEditMode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox' && 'checked' in e.target) {
            setFormData(prev => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else if (name === 'primaryCategoryId') {
            setFormData(prev => ({
                ...prev,
                [name]: value ? parseInt(value, 10) : undefined
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleContentChange = (content: string) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const categoryId = parseInt(value, 10);

        setFormData(prev => {
            const updatedCategories = checked
                ? [...prev.categories, categoryId]
                : prev.categories.filter(id => id !== categoryId);

            // If the primary category is removed, reset primaryCategoryId
            const updatedPrimaryCategory = prev.primaryCategoryId &&
                !updatedCategories.includes(prev.primaryCategoryId)
                ? undefined
                : prev.primaryCategoryId;

            return {
                ...prev,
                categories: updatedCategories,
                primaryCategoryId: updatedPrimaryCategory
            };
        });
    };

    // This function is no longer needed as we now use the ImageUploader component directly
    // The handleImageSelected functionality is now handled inside the ImageUploader component

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }

        try {
            setIsSaving(true);

            const postData = {
                title: formData.title,
                content: formData.content,
                coverImage: formData.coverImage,
                published: formData.published,
                categoryIds: formData.categories,
                primaryCategoryId: formData.primaryCategoryId
            };

            if (isEditMode && id) {
                await updatePost(parseInt(id, 10), postData);
            } else {
                await createPost(postData);
            }

            setIsSaving(false);
            navigate('/admin');
        } catch (err) {
            console.error('Failed to save post:', err);
            setError('Failed to save post. Please try again.');
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading post editor...</p>
            </div>
        );
    }

    return (
        <div className="post-editor">
            <h1 className="page-title">{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>

            {error && (
                <div className="error-alert">
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="post-form">
                <div className="form-group">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Cover Image</label>
                    <ImageUploader
                        initialImage={formData.coverImage}
                        onImageUpload={(imageUrl) => {
                            setFormData(prev => ({ ...prev, coverImage: imageUrl }));
                        }}
                    />
                    {formData.coverImage && (
                        <div className="image-preview">
                            <img src={formData.coverImage} alt="Cover preview" />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Categories</label>
                    <div className="categories-container">
                        {availableCategories.map(category => (
                            <div key={category.id} className="category-checkbox">
                                <input
                                    type="checkbox"
                                    id={`category-${category.id}`}
                                    name="categories"
                                    value={category.id}
                                    checked={formData.categories.includes(category.id)}
                                    onChange={handleCategoryChange}
                                />
                                <label htmlFor={`category-${category.id}`}>{category.name}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {formData.categories.length > 0 && (
                    <div className="form-group">
                        <label htmlFor="primaryCategoryId" className="form-label">Primary Category</label>
                        <select
                            id="primaryCategoryId"
                            name="primaryCategoryId"
                            value={formData.primaryCategoryId || ''}
                            onChange={handleInputChange}
                            className="form-control"
                        >
                            <option value="">-- Select Primary Category --</option>
                            {availableCategories
                                .filter(category => formData.categories.includes(category.id))
                                .map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="content" className="form-label">Content</label>
                    <Editor
                        initialContent={formData.content}
                        onContentChange={handleContentChange}
                    />
                </div>

                <div className="form-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="published"
                            checked={formData.published}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, published: e.target.checked }));
                            }}
                        />
                        Publish this post
                    </label>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="btn btn-secondary"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : isEditMode ? 'Update Post' : 'Create Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostEditor;