
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const { isAuthenticated, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const googleButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

        if (!googleClientId) {
            if (googleButtonRef.current) {
                googleButtonRef.current.innerHTML =
                    '<div class="alert alert-warning">Google authentication is disabled. Please configure GOOGLE_CLIENT_ID to enable it.</div>';
            }
            return;
        }

        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: handleCredentialResponse,
            });

            if (googleButtonRef.current) {
                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    { theme: 'outline', size: 'large', width: '100%' }
                );
            }
        } else {
            if (googleButtonRef.current) {
                googleButtonRef.current.innerHTML =
                    '<div class="alert alert-danger">Google Identity Services not loaded. Please check your internet connection.</div>';
            }
            console.error('Google Identity Services not loaded');
        }
    }, []);

    const handleCredentialResponse = async (response: { credential: string }) => {
        if (!signInWithGoogle) return;

        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Error during Google sign-in:', error);
            if (googleButtonRef.current) {
                googleButtonRef.current.innerHTML =
                    '<div class="alert alert-danger">Authentication failed. Please try again.</div>';
            }
        }
    };

    return (
        <div className="login-container">
            <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
                <div className="card-header">
                    <h2>Login to Blog Platform</h2>
                </div>
                <div className="card-body">
                    <p style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                        Sign in with your Google account to continue
                    </p>
                    <div ref={googleButtonRef} className="google-signin-button"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
