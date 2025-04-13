import React, { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import Login from './components/Login';
import NewPostPage from './pages/NewPostPage';
import EditPostPage from './pages/EditPostPage';
import AdminPage from './pages/AdminPage';

import './App.css';

// Protected route for admin content
interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>;
  }

  if (!isAuthenticated || !isAdmin) {
    // Redirect to login with state indicating from admin page
    return <Navigate to="/login" state={{ fromAdmin: true }} />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/new-post"
              element={
                <AdminRoute>
                  <NewPostPage />
                </AdminRoute>
              }
            />
            <Route
              path="/edit-post/:id"
              element={
                <AdminRoute>
                  <EditPostPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;