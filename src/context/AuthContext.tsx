import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { loginWithGoogle, logout, getCurrentUser } from '../services/auth';
import { User } from '../types';

interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
    signInWithGoogle: () => Promise<User | null>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
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

    const signInWithGoogle = async (): Promise<User | null> => {
        try {
            setLoading(true);
            const user = await loginWithGoogle();
            if (user) {
                setCurrentUser(user);
                setIsAuthenticated(true);
                setIsAdmin(user.role === 'ADMIN');
            }
            return user;
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async (): Promise<void> => {
        try {
            setLoading(true);
            await logout();
            setCurrentUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
        } catch (error) {
            console.error('Logout error:', error);
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
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};