import { Category, PageResponse, Post } from '../types';
import api from './api';

export const getAllCategories = async (): Promise<Category[]> => {
  const response = await api.get('/api/categories');
  return response.data;
};

export const getMenuCategories = async (): Promise<Category[]> => {
  const response = await api.get('/api/categories/menu');
  return response.data;
};

export const getCategoryById = async (id: number): Promise<Category> => {
  const response = await api.get(`/api/categories/${id}`);
  return response.data;
};

export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  const response = await api.get(`/api/categories/slug/${slug}`);
  return response.data;
};

export const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  const response = await api.post('/api/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id: number, categoryData: Partial<Category>): Promise<Category> => {
  const response = await api.put(`/api/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/api/categories/${id}`);
};

export const getPostsByCategory = async (
  categoryId: number,
  page = 0,
  size = 10
): Promise<PageResponse<Post>> => {
  const response = await api.get(`/api/categories/${categoryId}/posts?page=${page}&size=${size}`);
  return response.data;
};

export const getPostsByCategorySlug = async (
  slug: string,
  page = 0,
  size = 10
): Promise<PageResponse<Post>> => {
  const response = await api.get(`/api/categories/slug/${slug}/posts?page=${page}&size=${size}`);
  return response.data;
};

export const createSampleCategories = async (): Promise<Category[]> => {
  const response = await api.post('/api/categories/sample');
  return response.data;
};