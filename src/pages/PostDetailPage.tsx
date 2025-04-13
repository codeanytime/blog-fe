import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById } from '../services/api';
import BlogPost from '../components/BlogPost';
import { Post } from '../types';
import '../styles/post-detail.css';

type PostParams = {
    id?: string;
};

const PostDetailPage: React.FC = () => {
    const { id } = useParams<PostParams>();
    const navigate = useNavigate();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) {
                setError('Post ID is missing');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const postData = await getPostById(id);
                setPost(postData);
            } catch (err: any) {
                console.error('Error fetching post:', err);
                setError(err.message || 'Failed to load post');
                setPost(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    // Handle back button
    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="post-detail-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading post...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="post-detail-page">
                <div className="error-container">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h4>Error Loading Post</h4>
                    <p>{error || 'Post not found'}</p>
                    <button
                        className="back-button"
                        onClick={handleBack}
                    >
                        Back to Posts
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="post-detail-page">
            <div className="post-detail-header">
                <button
                    className="back-button"
                    onClick={handleBack}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back
                </button>
            </div>

            <BlogPost post={post} isDetailView={true} />
        </div>
    );
};

export default PostDetailPage;