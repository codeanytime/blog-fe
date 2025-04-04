import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MenuItem } from '../types';
import { getMenu } from '../services/api';
import Search from './Search';

const Header: React.FC = () => {
    const { isAuthenticated, isAdmin, currentUser, signInWithGoogle, signOut } = useAuth();
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                console.log('Fetching menu items...');
                const menu = await getMenu();
                console.log('Menu items received:', menu);
                setMenuItems(menu);
            } catch (error) {
                console.error('Failed to fetch menu:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, []);

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="header">
            <div className="container header-container">
                <Link to="/" className="logo">
                    <h1>Blog Platform</h1>
                </Link>

                <Search />

                <nav className="nav-menu">
                    <ul>
                        {!loading && menuItems.map(item => (
                            <li key={item.id}>
                                <Link to={item.url}>{item.label}</Link>
                            </li>
                        ))}
                        {isAdmin && (
                            <li><Link to="/admin">Admin</Link></li>
                        )}
                    </ul>
                </nav>

                <div className="auth-section">
                    {isAuthenticated ? (
                        <div className="user-info">
                            {currentUser && currentUser.pictureUrl && (
                                <img
                                    src={currentUser.pictureUrl}
                                    alt={currentUser.name}
                                    className="user-avatar"
                                />
                            )}
                            <span className="user-name">{currentUser?.name}</span>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleLogin} className="login-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5C13.6569 5 15 6.34315 15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8C9 6.34315 10.3431 5 12 5Z" fill="currentColor" />
                                <path d="M12 13C9.23858 13 7 15.2386 7 18C7 18.5523 7.44772 19 8 19H16C16.5523 19 17 18.5523 17 18C17 15.2386 14.7614 13 12 13Z" fill="currentColor" />
                            </svg>
                            Login with Google
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;