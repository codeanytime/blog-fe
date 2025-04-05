
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initiateGoogleLogin } from '../services/auth';

const Login: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

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
                    <button
                        onClick={initiateGoogleLogin}
                        className="btn btn-primary w-100"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        <img src="https://www.google.com/favicon.ico" alt="Google" width="20" height="20" />
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
