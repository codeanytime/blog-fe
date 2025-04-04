import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BlogPost from '../components/BlogPost';
import { getPostById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';

type PostParams = {
    id?: string;
};

const PostDetailPage: React.FC = () => {
    const { id } = useParams() as PostParams;
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) {
                setError('Post ID is missing');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const postData = await getPostById(id);
                setPost(postData);
                document.title = `${postData.title} | Blog Platform`;
            } catch (err) {
                console.error('Error fetching post:', err);
                setError('Failed to load the post. It may have been removed or is unavailable.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();

        return () => {
            document.title = 'Blog Platform';
        };
    }, [id]);

    const handleEditPost = () => {
        if (!id) return;
        navigate(`/admin/edit-post/${id}`);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading post...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="error-container">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h2>Post Not Found</h2>
                <p>{error || 'The post you are looking for does not exist.'}</p>
                <button onClick={() => navigate('/')} className="back-button">
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="post-detail-page">
            <div className="container">
                {isAdmin && (
                    <div className="admin-actions">
                        <button
                            className="edit-post-btn"
                            onClick={handleEditPost}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Edit Post
                        </button>
                    </div>
                )}

                <BlogPost post={post} isDetailView={true} />

                <div className="post-navigation">
                    <button
                        onClick={() => navigate('/')}
                        className="back-to-home"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back to Posts
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostDetailPage;