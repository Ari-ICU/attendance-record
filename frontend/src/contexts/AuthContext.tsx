'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { setAccessToken } from '@/api/axiosInstance';
import { AuthResponse, AuthState, LoginPayload, UpdateProfilePayload, User } from '@/types/Auth';

interface AuthContextProps extends AuthState {
    login: (payload: LoginPayload) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
    refreshAccessToken: () => Promise<void>;
    initializing: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [initializing, setInitializing] = useState<boolean>(true);

    // Sync token with axios instance
    useEffect(() => {
        setAccessToken(token);
    }, [token]);

    // Initialize auth on app start from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                if (storedToken) {
                    setAccessToken(storedToken);
                    setToken(storedToken);
                    try {
                        const profile = await AuthService.getProfile();
                        if (profile) {
                            setUser(profile);
                        } else {
                            throw new Error('No profile data returned');
                        }
                    } catch (err) {
                        console.warn('[Auth] Stored session invalid or expired');
                        localStorage.removeItem('token');
                        setAccessToken(null);
                        setToken(null);
                        setUser(null);
                    }
                } else {
                    setAccessToken(null);
                    setToken(null);
                    setUser(null);
                }
            } catch {
                setUser(null);
                setToken(null);
            } finally {
                setInitializing(false);
            }
        };

        initializeAuth();
    }, []);

    // Redirect to login if unauthenticated on protected dashboard routes
    useEffect(() => {
        if (!initializing && !user && pathname?.startsWith('/dashboard')) {
            router.push('/login');
        }
    }, [user, initializing, pathname, router]);

    const login = async (payload: LoginPayload) => {
        setLoading(true);
        setError(null);
        try {
            const data: AuthResponse = await AuthService.login(payload);
            if (!data?.token || !data?.user) {
                throw new Error('Authentication failed: Missing token or user profile');
            }
            setUser(data.user);
            setToken(data.token);
            setAccessToken(data.token);
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', data.token);
            }
            router.push('/dashboard');
        } catch (err: any) {
            const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Invalid credentials provided';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        setError(null);
        try {
            await AuthService.logout();
        } catch {
            // Ignore backend logout errors if connection dropped
        } finally {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
            }
            setAccessToken(null);
            setUser(null);
            setToken(null);
            setLoading(false);
            router.push('/login');
        }
    };

    const updateProfile = async (payload: UpdateProfilePayload) => {
        setLoading(true);
        setError(null);
        try {
            const updatedUser = await AuthService.updateProfile(payload);
            setUser(updatedUser);
        } catch (err: any) {
            const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update profile';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const refreshAccessToken = async () => {
        try {
            const newToken = await AuthService.refreshToken();
            setToken(newToken);
            setAccessToken(newToken);
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', newToken);
            }
        } catch (err: any) {
            console.error('[Auth] Refresh token failed:', err.message);
            await logout();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                error,
                initializing,
                login,
                logout,
                updateProfile,
                refreshAccessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

