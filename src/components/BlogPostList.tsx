import React from 'react';
import { Link } from 'react-router-dom';
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
    searchQuery,
    posts = [],
    pagination = null,
    currentPage = 0,
    onPageChange,
    emptyMessage = "No posts found"
}) => {
    // Generate pagination controls
    const renderPagination = () => {
        if (!pagination || pagination.totalPages <= 1) return null;

        const pages = [];
        const startPage = Math.max(0, currentPage - 2);
        const endPage = Math.min(pagination.totalPages - 1, currentPage + 2);

        // Previous button
        pages.push(
            <li key="prev" className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                <button
                    className="page-link"
                    onClick={() => onPageChange && onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                >
                    Previous
                </button>
            </li>
        );

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => onPageChange && onPageChange(i)}
                    >
                        {i + 1}
                    </button>
                </li>
            );
        }

        // Next button
        pages.push(
            <li key="next" className={`page-item ${currentPage === pagination.totalPages - 1 ? 'disabled' : ''}`}>
                <button
                    className="page-link"
                    onClick={() => onPageChange && onPageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages - 1}
                >
                    Next
                </button>
            </li>
        );

        return (
            <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center mt-4">
                    {pages}
                </ul>
            </nav>
        );
    };

    // Render loading state if posts are null
    if (posts === null) {
        return (
            <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading posts...</p>
            </div>
        );
    }

    // Render empty state if no posts
    if (posts.length === 0) {
        return (
            <div className="text-center my-5">
                <div className="alert alert-info">
                    {searchQuery ? `No posts found matching "${searchQuery}"` : emptyMessage}
                </div>
            </div>
        );
    }

    return (
        <div className="blog-post-list">
            {posts.map(post => (
                <div key={post.id} className="card mb-4">
                    <div className="row g-0">
                        {post.coverImage && (
                            <div className="col-md-4">
                                <img
                                    src={post.coverImage}
                                    className="img-fluid rounded-start"
                                    alt={post.title}
                                    style={{ height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        )}
                        <div className={post.coverImage ? 'col-md-8' : 'col-12'}>
                            <div className="card-body">
                                <h5 className="card-title">
                                    <Link to={`/post/${post.id}`} className="text-decoration-none">
                                        {post.title}
                                    </Link>
                                </h5>
                                <div className="card-text">
                                    {/* Strip HTML and limit to ~150 chars */}
                                    {post.content
                                        .replace(/<[^>]*>/g, '')
                                        .substring(0, 150)
                                        .trim()}
                                    {post.content.length > 150 ? '...' : ''}
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div className="small text-muted">
                                        By {post.author?.name || 'Unknown'} | {new Date(post.createdAt).toLocaleDateString()}
                                    </div>
                                    <Link to={`/post/${post.id}`} className="btn btn-sm btn-outline-primary">
                                        Read More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {renderPagination()}
        </div>
    );
};

export default BlogPostList;