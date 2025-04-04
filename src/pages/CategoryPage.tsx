import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPostsByCategorySlug, getCategoryBySlug } from '../services/categories';
import { Post, Category, PageResponse } from '../types';
import BlogPostList from '../components/BlogPostList';

const CategoryPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [category, setCategory] = useState<Category | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [pagination, setPagination] = useState<Omit<PageResponse<Post>, 'content'> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);

    useEffect(() => {
        const fetchCategory = async () => {
            if (!slug) return;

            try {
                setLoading(true);
                const categoryData = await getCategoryBySlug(slug);
                setCategory(categoryData);

                const postsResponse = await getPostsByCategorySlug(slug, currentPage);
                setPosts(postsResponse.content);

                const { content, ...paginationData } = postsResponse;
                setPagination(paginationData);
            } catch (err) {
                console.error('Error fetching category data:', err);
                setError('Failed to load category data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [slug, currentPage]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    if (loading && !category) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!category) {
        return <div className="not-found">Category not found</div>;
    }

    return (
        <div className="category-page">
            <div className="category-header">
                <h1>{category.name}</h1>
                {category.description && <p className="category-description">{category.description}</p>}
            </div>

            <BlogPostList
                posts={posts}
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                emptyMessage={`No posts found in the "${category.name}" category.`}
            />
        </div>
    );
};

export default CategoryPage;