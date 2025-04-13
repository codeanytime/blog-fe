import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPostById } from '../services/api';
import { Post } from '../types';

const PostDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPost = async () => {
            try {
                setIsLoading(true);
                if (id) {
                    const fetchedPost = await getPostById(id);
                    setPost(fetchedPost);
                }
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load post');
                setIsLoading(false);
                console.error(err);
            }
        };

        loadPost();
    }, [id]);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading post...</p>
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

    if (!post) {
        return (
            <div className="not-found-container">
                <h2>Post Not Found</h2>
                <p>The post you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <div className="post-detail-wrapper">
            <article className="blog-post blog-post-detail">
                {post.coverImage && (
                    <div className="blog-post-image">
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="full-width-image"
                        />
                    </div>
                )}

                <div className="blog-post-content">
                    <header className="post-detail-header">
                        <h1 className="post-detail-title">{post.title}</h1>
                        <div className="post-detail-meta">
                            <div className="post-author">
                                {post.author?.pictureUrl ? (
                                    <img
                                        src={post.author.pictureUrl}
                                        alt={post.author.name}
                                        className="post-author-avatar"
                                    />
                                ) : (
                                    <div className="post-author-avatar-placeholder">
                                        {post.author?.name?.charAt(0) || 'A'}
                                    </div>
                                )}
                                <span>{post.author?.name || 'Anonymous'}</span>
                            </div>
                            <div className="post-date">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                        </div>
                    </header>

                    <div className="blog-post-body">
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />

                        {post.tags && post.tags.length > 0 && (
                            <div className="blog-post-tags">
                                {post.tags.map((tag, index) => (
                                    <span key={index} className="tag">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </article>
        </div>
    );
};

export default PostDetail;