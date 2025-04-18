// User types
export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  pictureUrl?: string;
  googleId?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  displayInMenu: boolean;
  menuOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

// Post types
export interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  coverImage?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  author?: User;
  tags?: string[];
  categories?: Category[];
  primaryCategory?: Category;
}

// Authentication types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// API response types
export interface ApiError {
  message: string;
  status?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface MenuItem {
  id: number;
  label: string;
  url: string;
  order: number;
  type: string;
}