import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';

enum AuthMode {
    LOGIN = 'login',
    REGISTER = 'register'
}

const Login: React.FC = () => {
    const { isAuthenticated, isAdmin, signInWithGoogle, signInWithCredentials, register, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = useState<AuthMode>(AuthMode.LOGIN);

    // Form states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    // Check if user was redirected from admin page
    const fromAdmin = location.state?.fromAdmin || false;

    useEffect(() => {
        if (isAuthenticated) {
            // Redirect to admin page if they're an admin and were trying to access admin pages
            if (isAdmin && fromAdmin) {
                navigate('/admin');
            } else {
                // Regular users go to home page
                navigate('/');
            }
        }
    }, [isAuthenticated, isAdmin, navigate, fromAdmin]);

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            // Navigation is handled in the useEffect
        } catch (error) {
            console.error('Google login error:', error);
        }
    };

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!username || !password) {
            setFormError('Username and password are required');
            return;
        }

        try {
            await signInWithCredentials({ username, password });
            // Navigation is handled in the useEffect
        } catch (error: any) {
            console.error('Login error:', error);
            setFormError(error.message || 'Invalid username or password');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!username || !password || !email || !name) {
            setFormError('All fields are required');
            return;
        }

        if (password.length < 6) {
            setFormError('Password must be at least 6 characters');
            return;
        }

        try {
            await register({ username, password, email, name });
            // Navigation is handled in the useEffect
        } catch (error: any) {
            console.error('Registration error:', error);
            setFormError(error.message || 'Failed to register');
        }
    };

    const toggleMode = () => {
        setMode(mode === AuthMode.LOGIN ? AuthMode.REGISTER : AuthMode.LOGIN);
        setFormError(null);
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">{mode === AuthMode.LOGIN ? 'Login' : 'Register'}</h3>
                        </div>
                        <div className="card-body">
                            {(formError || error) && (
                                <div className="alert alert-danger" role="alert">
                                    {formError || error}
                                </div>
                            )}

                            {mode === AuthMode.LOGIN ? (
                                <form onSubmit={handleCredentialsLogin}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter your username"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                    <div className="d-grid gap-2">
                                        <button
                                            type="submit"
                                            className="btn btn-lg d-flex align-items-center justify-content-center gap-2 w-100 border"
                                            style={{
                                                backgroundColor: '#4285F4',
                                                color: '#ffffff',
                                                transition: 'all 0.2s ease-in-out',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                                                padding: '8px 16px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                <path fill="#ffffff" d="M12 2a10 10 0 00-6.88 17.26l-.44.29a1 1 0 00-.37.41 1 1 0 001.6 1.13L12 17l6.09 4.08a1 1 0 001.59-1.13 1 1 0 00-.37-.4l-.44-.3A10 10 0 0012 2zm0 18a8 8 0 01-5.55-2.25 1 1 0 00-.1.09L12 22l5.65-3.79a.56.56 0 00-.1-.21A8 8 0 1112 20z" />
                                            </svg>
                                            <span>Login with Email</span>
                                        </button>
                                        <GoogleLoginButton onClick={handleGoogleLogin} text="Sign in with Google" />
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleRegister}>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Choose a username"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create a password"
                                        />
                                        <div className="form-text">Password must be at least 6 characters long.</div>
                                    </div>
                                    <div className="d-grid">
                                        <button
                                            type="submit"
                                            className="btn btn-lg d-flex align-items-center justify-content-center gap-2 w-100 border"
                                            style={{
                                                backgroundColor: '#4285F4',
                                                color: '#ffffff',
                                                transition: 'all 0.2s ease-in-out',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                                                padding: '8px 16px',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                <path fill="#ffffff" d="M16 2H8a2 2 0 00-2 2v16a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2zm-3 19h-2v-1h2zm4-3H7V4h10z" />
                                            </svg>
                                            <span>Create Account</span>
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="mt-3 text-center">
                                <button className="btn btn-link" onClick={toggleMode}>
                                    {mode === AuthMode.LOGIN
                                        ? "Don't have an account? Register"
                                        : "Already have an account? Login"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card bg-light shadow-sm h-100">
                        <div className="card-body d-flex flex-column justify-content-center">
                            <h2 className="text-center mb-4">Welcome to Blog Platform</h2>
                            <p className="text-center mb-4">
                                Join our community to read and share amazing content.
                            </p>
                            <div className="card-text">
                                <h5><i className="bi bi-check-circle-fill text-success me-2"></i>Read articles from expert writers</h5>
                                <h5><i className="bi bi-check-circle-fill text-success me-2"></i>Engage with the community through comments</h5>
                                <h5><i className="bi bi-check-circle-fill text-success me-2"></i>Stay updated with the latest trends</h5>
                            </div>
                            {mode === AuthMode.LOGIN && (
                                <div className="alert alert-info mt-4" role="alert">
                                    <i className="bi bi-info-circle-fill me-2"></i>
                                    Login with your credentials or use Google Sign-In for faster access.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;