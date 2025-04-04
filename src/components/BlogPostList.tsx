import React, { useState, useEffect } from 'react';
import BlogPost from './BlogPost';
import { getPosts } from '../services/api';
import { Post, PageResponse } from '../types';

interface BlogPostListProps {
    searchQuery?: string;
    posts?: Post[];
    pagination?: Omit<PageResponse<Post>, 'content'> | null;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    emptyMessage?: string;
}

const BlogPostList: React.FC<BlogPostListProps> = ({
    searchQuery = '',
    posts: propPosts,
    pagination,
    currentPage: propCurrentPage,
    onPageChange,
    emptyMessage
}) => {
    const [posts, setPosts] = useState<Post[]>(propPosts || []);
    const [loading, setLoading] = useState<boolean>(!propPosts);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(propCurrentPage || 0);
    const [hasMore, setHasMore] = useState<boolean>(pagination ? !pagination.last : true);
    const postsPerPage = 5;

    // If component is controlled by props
    const isControlled = propPosts !== undefined && pagination !== undefined;

    useEffect(() => {
        if (propPosts) {
            setPosts(propPosts);
        }
    }, [propPosts]);

    useEffect(() => {
        if (pagination) {
            setHasMore(!pagination.last);
        }
    }, [pagination]);

    useEffect(() => {
        if (propCurrentPage !== undefined) {
            setPage(propCurrentPage);
        }
    }, [propCurrentPage]);

    useEffect(() => {
        // Only fetch if not controlled by props
        if (isControlled) return;

        // Reset when search query changes
        setPosts([]);
        setPage(0);
        setHasMore(true);
        setLoading(true);
        setError(null);
    }, [searchQuery, isControlled]);

    useEffect(() => {
        // Don't fetch if component is controlled by props
        if (isControlled) return;

        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response: PageResponse<Post> = await getPosts(page, postsPerPage, searchQuery);

                if (page === 0) {
                    setPosts(response.content);
                } else {
                    setPosts(prevPosts => [...prevPosts, ...response.content]);
                }

                setHasMore(!response.last);
                setError(null);
            } catch (err) {
                setError('Failed to load blog posts. Please try again later.');
                console.error('Error fetching posts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [page, searchQuery, isControlled]);

    const loadMore = () => {
        if (!loading && hasMore) {
            if (onPageChange) {
                // If controlled, call the provided callback
                onPageChange(page + 1);
            } else {
                // If not controlled, handle pagination internally
                setPage(prevPage => prevPage + 1);
            }
        }
    };

    const handleRetry = () => {
        if (onPageChange) {
            onPageChange(0);
        } else {
            setPage(0);
        }
    };

    if (error) {
        return (
            <div className="error-container">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p>{error}</p>
                <button onClick={handleRetry} className="retry-button">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="blog-post-list">
            {posts.length === 0 && !loading ? (
                <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 17H15M9.00001 3H15C16.1046 3 17 3.89543 17 5V19C17 20.1046 16.1046 21 15 21H9.00001C7.89544 21 7.00001 20.1046 7.00001 19V5C7.00001 3.89543 7.89544 3 9.00001 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <h3>No posts found</h3>
                    {searchQuery ? (
                        <p>No results for "{searchQuery}". Try a different search term.</p>
                    ) : (
                        <p>{emptyMessage || 'There are no blog posts available yet.'}</p>
                    )}
                </div>
            ) : (
                <>
                    {posts.map(post => (
                        <BlogPost key={post.id} post={post} />
                    ))}

                    {loading && (
                        <div className="loading-indicator">
                            <div className="loading-spinner"></div>
                            <span>Loading posts...</span>
                        </div>
                    )}

                    {hasMore && !loading && (
                        <div className="load-more-container">
                            <button onClick={loadMore} className="load-more-button">
                                Load More Posts
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BlogPostList;