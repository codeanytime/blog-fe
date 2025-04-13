import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { loginWithGoogle, logout, getCurrentUser, loginWithCredentials, registerUser } from '../services/auth';
import { User, LoginCredentials } from '../types';

interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
    signInWithGoogle: () => Promise<User | null>;
    signInWithCredentials: (credentials: LoginCredentials) => Promise<User | null>;
    register: (userData: { username: string; password: string; email: string; name: string }) => Promise<User | null>;
    signOut: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const user = await getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                    setIsAuthenticated(true);
                    setIsAdmin(user.role === 'ADMIN');
                }
            } catch (error) {
                console.error('Authentication initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const signInWithCredentials = async (credentials: LoginCredentials): Promise<User | null> => {
        try {
            setLoading(true);
            setError(null);

            const user = await loginWithCredentials(credentials);
            if (user) {
                setCurrentUser(user);
                setIsAuthenticated(true);
                setIsAdmin(user.role === 'ADMIN');
            }
            return user;
        } catch (error: any) {
            console.error('Sign-in error:', error);
            setError(error.message || 'Failed to sign in. Please check your credentials.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: { username: string; password: string; email: string; name: string }): Promise<User | null> => {
        try {
            setLoading(true);
            setError(null);

            const user = await registerUser(userData);
            if (user) {
                setCurrentUser(user);
                setIsAuthenticated(true);
                setIsAdmin(user.role === 'ADMIN');
            }
            return user;
        } catch (error: any) {
            console.error('Registration error:', error);
            setError(error.message || 'Failed to register. Please try again.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async (): Promise<User | null> => {
        try {
            setLoading(true);
            setError(null);

            console.log('Starting Google sign-in flow...');
            const user = await loginWithGoogle();

            if (user) {
                console.log('Google sign-in successful, user:', user);
                setCurrentUser(user);
                setIsAuthenticated(true);
                setIsAdmin(user.role === 'ADMIN');
                return user;
            }

            return null;
        } catch (error: any) {
            console.error('Google sign-in error:', error);
            setError(error.message || 'Failed to sign in with Google.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            await logout();
            setCurrentUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
        } catch (error: any) {
            console.error('Logout error:', error);
            setError(error.message || 'Failed to log out.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const value: AuthContextType = {
        currentUser,
        isAuthenticated,
        isAdmin,
        loading,
        signInWithGoogle,
        signInWithCredentials,
        register,
        signOut,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};