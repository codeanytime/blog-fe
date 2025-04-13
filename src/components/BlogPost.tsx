import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import '../styles/post-detail.css';

interface BlogPostProps {
    post: Post;
    isDetailView?: boolean;
}

const BlogPost: React.FC<BlogPostProps> = ({ post, isDetailView = false }) => {
    const { isAdmin } = useAuth();

    if (!post) {
        return <div>Post not found</div>;
    }

    return (
        <article className={`blog-post ${isDetailView ? 'blog-post-detail' : ''}`}>
            {/* Post Header */}
            <header style={{ position: 'relative' }}>
                <h1>{post.title}</h1>

                <div className="post-meta">
                    {post.author && (
                        <span className="post-author">
                            By {post.author.name}
                        </span>
                    )}
                    <span className="post-date">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </div>

                {isAdmin && isDetailView && (
                    <div className="post-detail-actions">
                        <Link
                            to={`/edit-post/${post.id}`}
                            className="edit-button"
                            title="Edit Post"
                            aria-label="Edit this post"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                        </Link>
                    </div>
                )}
            </header>

            {/* Cover Image */}
            {post.coverImage && (
                <div className="cover-image">
                    <img
                        src={post.coverImage}
                        alt={post.title}
                    />
                </div>
            )}

            {/* Content */}
            <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Categories and Tags (if available) */}
            {post.categories && post.categories.length > 0 && (
                <div className="categories-section">
                    <h5>Categories</h5>
                    <div>
                        {post.categories.map(category => (
                            <Link
                                key={category.id}
                                to={`/category/${category.slug}`}
                                className="category-badge"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {post.tags && post.tags.length > 0 && (
                <div className="tags-section">
                    <h5>Tags</h5>
                    <div>
                        {post.tags.map(tag => (
                            <span
                                key={tag}
                                className="tag-badge"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {!isDetailView && (
                <div className="mt-4">
                    <Link
                        to={`/post/${post.id}`}
                        className="btn btn-primary"
                    >
                        Read Full Article
                    </Link>
                </div>
            )}
        </article>
    );
};

export default BlogPost;