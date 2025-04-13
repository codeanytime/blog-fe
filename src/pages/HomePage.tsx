import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPosts } from '../services/api';
import BlogPostList from '../components/BlogPostList';
import { Post, PageResponse } from '../types';

const HomePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const pageParam = searchParams.get('page');
    const [currentPage, setCurrentPage] = useState<number>(pageParam ? parseInt(pageParam, 10) : 0);

    const [posts, setPosts] = useState<Post[] | null>(null);
    const [pagination, setPagination] = useState<Omit<PageResponse<Post>, 'content'> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getPosts(currentPage, 5, query);

                setPosts(response.content);
                // Extract pagination data
                const { content, ...paginationData } = response;
                setPagination(paginationData);
            } catch (err: any) {
                console.error('Error fetching posts:', err);
                setError(err.message || 'Failed to load posts');
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [currentPage, query]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Update URL to include page
        const url = new URL(window.location.href);
        url.searchParams.set('page', page.toString());
        window.history.pushState({}, '', url);
    };

    return (
        <div className="home-page">
            {/* Page Title */}
            <div className="page-header mb-4">
                <h1>{query ? `Search Results for "${query}"` : 'Latest Blog Posts'}</h1>
                {query && (
                    <p className="text-muted">
                        Showing results for your search query
                    </p>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* Post Listing */}
            {loading ? (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading posts...</p>
                </div>
            ) : (
                <BlogPostList
                    posts={posts || []}
                    pagination={pagination}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    searchQuery={query}
                />
            )}
        </div>
    );
};

export default HomePage;