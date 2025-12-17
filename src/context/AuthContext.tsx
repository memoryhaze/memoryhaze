import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    userId?: string;
    email: string;
    name: string;
}

interface AuthContextType {
    token: string | null;
    isAdmin: boolean;
    profile: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
    updateProfile: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [profile, setProfile] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Decode JWT token to extract payload
    const decodeToken = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            const decoded = decodeToken(storedToken);
            if (decoded && decoded.exp * 1000 > Date.now()) {
                setToken(storedToken);
                const adminFlag = decoded?.user?.isAdmin ?? decoded?.isAdmin;
                setIsAdmin(!!adminFlag);
                // Optionally fetch full profile from /api/auth/me
            } else {
                // Token expired
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string) => {
        const decoded = decodeToken(newToken);
        if (decoded) {
            setToken(newToken);
            const adminFlag = decoded?.user?.isAdmin ?? decoded?.isAdmin;
            setIsAdmin(!!adminFlag);
            localStorage.setItem('token', newToken);
        }
    };

    const logout = () => {
        setToken(null);
        setIsAdmin(false);
        setProfile(null);
        localStorage.removeItem('token');
        navigate('/');
    };

    const updateProfile = (user: User) => {
        setProfile(user);
    };

    const value: AuthContextType = {
        token,
        isAdmin,
        profile,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
