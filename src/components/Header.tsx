import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MenuItem } from '../types';
import { getMenu } from '../services/api';
import Search from './Search';

const Header: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { isAuthenticated, isAdmin, currentUser, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Fetch menu items
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const menuData = await getMenu();
                setMenuItems(menuData);
            } catch (error) {
                console.error('Failed to load menu:', error);
            }
        };

        fetchMenu();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-container">
                    <Link className="logo" to="/">
                        <h1>Inspire<span className="logo-accent">Blog</span></h1>
                    </Link>

                    {/* Mobile menu toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={toggleMobileMenu}
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                        </span>
                    </button>

                    {/* Main navigation */}
                    <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
                        <ul>
                            <li className={location.pathname === '/' ? 'active' : ''}>
                                <Link to="/">Home</Link>
                            </li>

                            {/* Dynamic Menu Items */}
                            {menuItems.map(item => (
                                <li
                                    key={item.id}
                                    className={location.pathname === item.url ? 'active' : ''}
                                >
                                    <Link to={item.url}>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="header-actions">
                        {/* Search Component */}
                        <Search />

                        {/* User Authentication */}
                        <div className="auth-section">
                            {isAuthenticated ? (
                                <div className="user-menu-container" ref={userMenuRef}>
                                    <div
                                        className="user-info"
                                        onClick={toggleUserMenu}
                                    >
                                        {currentUser?.pictureUrl ? (
                                            <img
                                                src={currentUser.pictureUrl}
                                                alt={currentUser.name}
                                                className="user-avatar"
                                            />
                                        ) : (
                                            <div className="user-avatar-placeholder">
                                                {currentUser?.name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                        <span className="user-name">{currentUser?.name}</span>
                                    </div>

                                    {userMenuOpen && (
                                        <div className="user-dropdown">
                                            {isAdmin && (
                                                <>
                                                    <Link to="/admin" className="dropdown-item">
                                                        <span className="dropdown-icon">⚙️</span>
                                                        Admin Dashboard
                                                    </Link>
                                                    <Link to="/new-post" className="dropdown-item">
                                                        <span className="dropdown-icon">✏️</span>
                                                        New Post
                                                    </Link>
                                                    <div className="dropdown-divider"></div>
                                                </>
                                            )}
                                            <Link to="/profile" className="dropdown-item">
                                                <span className="dropdown-icon">👤</span>
                                                My Profile
                                            </Link>
                                            <button onClick={handleLogout} className="dropdown-item">
                                                <span className="dropdown-icon">🚪</span>
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="login-btn">
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;