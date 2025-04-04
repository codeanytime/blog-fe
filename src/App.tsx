import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import AdminPage from './pages/AdminPage';
import NewPostPage from './pages/NewPostPage';
import EditPostPage from './pages/EditPostPage';
import CategoryPage from './pages/CategoryPage';

interface AdminRouteProps {
  children: ReactNode;
}

function App() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Protected route component
  const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    if (loading) return <div className="loading">Loading...</div>;
    if (!isAuthenticated || !isAdmin) return <Navigate to="/" />;
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/post/:id" element={<PostDetailPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              } />
              <Route path="/admin/new-post" element={
                <AdminRoute>
                  <NewPostPage />
                </AdminRoute>
              } />
              <Route path="/admin/edit-post/:id" element={
                <AdminRoute>
                  <EditPostPage />
                </AdminRoute>
              } />
            </Routes>
          )}
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;