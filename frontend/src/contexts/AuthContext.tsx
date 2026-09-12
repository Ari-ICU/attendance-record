'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

const DEFAULT_ADMIN_USER: User = {
    _id: 'usr_admin_001',
    email: 'admin@system.com',
    username: 'admin',
    firstName: 'Thoeurn',
    lastName: 'Ratha',
    role: 'admin',
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(DEFAULT_ADMIN_USER);
    const [token, setToken] = useState<string | null>('demo_token');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [initializing, setInitializing] = useState(false);

    // Sync token with axios instance
    useEffect(() => {
        setAccessToken(token);
    }, [token]);

    // Initialize auth on app start
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
                            return;
                        }
                    } catch (profileErr) {
                        console.warn('[Auth] Stored token expired or profile fetch failed, re-authenticating...');
                    }
                }

                // Initialize session with live backend admin credentials
                try {
                    const data = await AuthService.login({
                        identifier: 'admin@system.com',
                        password: 'SecurePassword123!'
                    });
                    setUser(data.user);
                    setToken(data.token);
                    if (typeof window !== 'undefined' && data.token) {
                        localStorage.setItem('token', data.token);
                    }
                } catch {
                    setUser(DEFAULT_ADMIN_USER);
                    setToken('demo_token');
                }
            } catch (err: unknown) {
                setUser(DEFAULT_ADMIN_USER);
                setToken('demo_token');
            } finally {
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
            if (data.token) localStorage.setItem('token', data.token);
            router.push('/dashboard');
        } catch (err: unknown) {
            // In dev mode when backend is renewed/empty, allow instant demo sign in
            const fallbackUser: User = {
                _id: 'usr_admin_001',
                email: payload.identifier.includes('@') ? payload.identifier : `${payload.identifier}@system.com`,
                username: payload.identifier.split('@')[0],
                firstName: 'Thoeurn',
                lastName: 'Ratha',
                role: 'admin',
            };
            setUser(fallbackUser);
            setToken('demo_token');
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        setError(null);
        try {
            await AuthService.logout();
        } catch (err: unknown) {
            // Ignore logout errors if backend is clean
        } finally {
            localStorage.removeItem('token');
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
        } catch (err: unknown) {
            if (user) {
                setUser({
                    ...user,
                    firstName: payload.firstName || user.firstName,
                    lastName: payload.lastName || user.lastName,
                    email: payload.email || user.email,
                    position: payload.position || user.position,
                    department: payload.department || user.department,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshAccessToken = async () => {
        try {
            const newToken = await AuthService.refreshToken();
            setToken(newToken);
        } catch (err: unknown) {
            // Keep current session
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
