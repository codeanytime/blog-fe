import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';

interface BlogPostProps {
    post: Post;
    isDetailView?: boolean;
}

const BlogPost: React.FC<BlogPostProps> = ({ post, isDetailView = false }) => {
    // Format the date for display
    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Create a short excerpt from the content for list view
    const createExcerpt = (content: string, maxLength: number = 150): string => {
        // Remove HTML tags
        const strippedContent = content.replace(/<[^>]*>/g, '');
        if (strippedContent.length <= maxLength) return strippedContent;
        return strippedContent.substring(0, maxLength) + '...';
    };

    return (
        <article className={`blog-post ${isDetailView ? 'blog-post-detail' : ''}`}>
            {post.coverImage && (
                <div className="blog-post-image">
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className={isDetailView ? 'full-width-image' : 'thumbnail-image'}
                    />
                </div>
            )}

            <div className="blog-post-content">
                <header>
                    <h2 className="blog-post-title">
                        {isDetailView ? (
                            post.title
                        ) : (
                            <Link to={`/post/${post.id}`}>{post.title}</Link>
                        )}
                    </h2>

                    <div className="blog-post-meta">
                        <span className="post-date">{formatDate(post.createdAt)}</span>
                        {post.author && (
                            <span className="post-author">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {post.author.name}
                            </span>
                        )}
                    </div>
                </header>

                {isDetailView ? (
                    <div
                        className="blog-post-body"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                ) : (
                    <div className="blog-post-excerpt">
                        <p>{createExcerpt(post.content)}</p>
                        <Link to={`/post/${post.id}`} className="read-more">
                            Read More
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    </div>
                )}

                {isDetailView && post.tags && post.tags.length > 0 && (
                    <div className="blog-post-tags">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 7H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {post.tags.map((tag: string, index: number) => (
                            <span key={index} className="tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
};

export default BlogPost;