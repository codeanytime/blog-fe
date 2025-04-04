import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../services/api';
import { Post } from '../types';

const PostList: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                setIsLoading(true);
                const response = await getPosts(0, 100); // Assuming we get paginated response
                setPosts(response.content);
                setFilteredPosts(response.content);
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load posts');
                setIsLoading(false);
                console.error(err);
            }
        };

        loadPosts();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPosts(posts);
        } else {
            const filtered = posts.filter(post =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPosts(filtered);
        }
    }, [searchTerm, posts]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

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

    return (
        <div className="post-list-container">
            <h1>Blog Posts</h1>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="form-control"
                />
            </div>

            {filteredPosts.length === 0 ? (
                <p>No posts found.</p>
            ) : (
                <div className="post-list">
                    {filteredPosts.map(post => (
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
                                    {/* Create excerpt by stripping HTML and limiting length */}
                                    {post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
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
        </div>
    );
};

export default PostList;