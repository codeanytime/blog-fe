import React from 'react';
import { useLocation } from 'react-router-dom';
import BlogPostList from '../components/BlogPostList';

const HomePage: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('q') || '';

    return (
        <div className="home-page">
            <div className="container">
                <div className="header-section">
                    {searchQuery ? (
                        <h1>Search Results for: "{searchQuery}"</h1>
                    ) : (
                        <>
                            <h1>Welcome to our Blog</h1>
                            <p className="subtitle">Discover our latest thoughts, ideas and insights</p>
                        </>
                    )}
                </div>

                <div id="latest-posts" className="blog-section">
                    <BlogPostList searchQuery={searchQuery} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;