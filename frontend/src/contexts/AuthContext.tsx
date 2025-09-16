'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
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
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [initializing, setInitializing] = useState(true);

    // 🔑 initialize auth on app start
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const newToken = await AuthService.refreshToken();
                setToken(newToken);

                const profile = await AuthService.getProfile();
                setUser(profile);
            } catch (err: unknown) {
                setToken(null);
                setUser(null);

                if (err instanceof Error) {
                    console.error('Auth error:', err.message);
                } else {
                    console.error('Auth error:', err);
                }
            }

            finally {
                setInitializing(false);
            }
        };
        initializeAuth();
    }, []);


    const login = async (payload: LoginPayload) => {
        setLoading(true);
        setError(null);
        try {
            const data: AuthResponse = await AuthService.login(payload);
            setUser(data.user);
            setToken(data.token);
            router.push('/dashboard');
        } catch (err: unknown) {
            setUser(null);
            setToken(null);
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        setError(null);
        try {
            await AuthService.logout();
            setUser(null);
            setToken(null);
            router.push('/login');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Logout failed');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (payload: UpdateProfilePayload) => {
        if (!token) throw new Error('Not authenticated');
        setLoading(true);
        setError(null);
        try {
            const updatedUser = await AuthService.updateProfile(payload);
            setUser(updatedUser);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const refreshAccessToken = async () => {
        setLoading(true);
        setError(null);
        try {
            const newToken = await AuthService.refreshToken();
            setToken(newToken);
        } catch (err: unknown) {
            setUser(null);
            setToken(null);
            setError(err instanceof Error ? err.message : 'Failed to refresh token');
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, error, login, logout, updateProfile, refreshAccessToken, initializing }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
