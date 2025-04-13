import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts, deletePost } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Post } from '../../types';
import { createSampleCategories } from '../../services/categories';

const AdminDashboard: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCategoryCreating, setIsCategoryCreating] = useState<boolean>(false);
    const [categoryMessage, setCategoryMessage] = useState<string | null>(null);
    const { isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            navigate('/login');
            return;
        }

        const loadPosts = async () => {
            try {
                setIsLoading(true);
                const response = await getPosts();
                setPosts(response.content);
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load posts');
                setIsLoading(false);
                console.error(err);
            }
        };

        loadPosts();
    }, [isAuthenticated, isAdmin, navigate]);

    const handleDeletePost = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            await deletePost(id);
            setPosts(posts.filter(post => post.id !== id));
        } catch (err) {
            setError('Failed to delete post');
            console.error(err);
        }
    };

    const handleCreateSampleCategories = async () => {
        if (!window.confirm('Are you sure you want to create sample categories?')) {
            return;
        }

        try {
            setIsCategoryCreating(true);
            setCategoryMessage(null);
            const categories = await createSampleCategories();
            setCategoryMessage(`Successfully created ${categories.length} sample categories!`);
            setIsCategoryCreating(false);
        } catch (err) {
            setCategoryMessage('Failed to create sample categories. They may already exist.');
            setIsCategoryCreating(false);
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading admin dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-container">
            <h1>Admin Dashboard</h1>

            <div className="admin-actions">
                <Link to="/new-post" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>Create New Post
                </Link>
                <button
                    className="btn btn-secondary ms-2"
                    onClick={handleCreateSampleCategories}
                    disabled={isCategoryCreating}
                >
                    <i className="bi bi-folder-plus me-2"></i>{isCategoryCreating ? 'Creating...' : 'Create Sample Categories'}
                </button>
            </div>

            {categoryMessage && (
                <div className={`alert ${categoryMessage.includes('Failed') ? 'alert-danger' : 'alert-success'} mt-3`}>
                    {categoryMessage}
                </div>
            )}

            <div className="admin-posts mt-4">
                <h2>Manage Posts</h2>

                {posts.length === 0 ? (
                    <p>No posts available.</p>
                ) : (
                    <div className="admin-post-list">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map(post => (
                                    <tr key={post.id}>
                                        <td>{post.title}</td>
                                        <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="admin-post-actions">
                                                <Link to={`/post/${post.id}`} className="btn btn-sm btn-outline-secondary me-2" title="View Post">
                                                    <i className="bi bi-eye"></i>
                                                </Link>
                                                <Link to={`/edit-post/${post.id}`} className="btn btn-sm btn-outline-primary me-2" title="Edit Post">
                                                    <i className="bi bi-pencil-square"></i>
                                                </Link>
                                                <button
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Delete Post"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;