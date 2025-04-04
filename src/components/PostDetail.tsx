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
        <div className="post-detail-container">
            <article className="post-article">
                <header className="post-header">
                    <h1 className="post-title">{post.title}</h1>
                    <div className="post-meta">
                        <span className="post-date">
                            Published on {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        {post.author && (
                            <span className="post-author">by {post.author.name}</span>
                        )}
                    </div>
                </header>

                {post.coverImage && (
                    <div className="post-image-container">
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="post-detail-image"
                        />
                    </div>
                )}

                <div
                    className="post-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>
        </div>
    );
};

export default PostDetail;