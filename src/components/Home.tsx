import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../services/api';
import { Post } from '../types';

const Home: React.FC = () => {
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRecentPosts = async () => {
            try {
                setIsLoading(true);
                // Get most recent posts (first page with limited number of posts)
                const response = await getPosts(0, 5);
                setRecentPosts(response.content);
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load recent posts');
                setIsLoading(false);
                console.error(err);
            }
        };

        loadRecentPosts();
    }, []);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading posts...</p>
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

    // Helper function to create an excerpt
    const createExcerpt = (content: string, maxLength: number = 150): string => {
        // Remove HTML tags
        const strippedContent = content.replace(/<[^>]*>/g, '');
        if (strippedContent.length <= maxLength) return strippedContent;
        return strippedContent.substring(0, maxLength) + '...';
    };

    return (
        <div className="home-container">
            <section className="hero">
                <div className="hero-content">
                    <h1>Welcome to the Blog Platform</h1>
                    <p>
                        Discover insightful articles, tips, and stories from our community.
                    </p>
                    <Link to="/" className="btn btn-primary">
                        Browse All Posts
                    </Link>
                </div>
            </section>

            <section className="recent-posts" id="latest-posts">
                <h2>Recent Posts</h2>
                {recentPosts.length === 0 ? (
                    <p>No posts available at the moment.</p>
                ) : (
                    <div className="post-list">
                        {recentPosts.map(post => (
                            <div key={post.id} className="card post-card">
                                {post.coverImage && (
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="post-image"
                                    />
                                )}
                                <div className="card-body">
                                    <h3 className="post-title">{post.title}</h3>
                                    <p className="post-excerpt">
                                        {createExcerpt(post.content)}
                                    </p>
                                    <div className="post-meta">
                                        <span className="post-date">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                        <Link to={`/post/${post.id}`} className="btn btn-primary">
                                            Read More
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;