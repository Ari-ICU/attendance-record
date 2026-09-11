'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, Eye, EyeOff, School } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!identifier || !password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        try {
            await login({ identifier, password });
            router.push('/dashboard');
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError('Invalid credentials provided');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-sm">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg shadow-xs">
                        <School size={22} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance System</h1>
                    <p className="text-xs text-slate-500 mt-1">Sign in with your campus account</p>
                </div>

                {error && (
                    <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="identifier" className="text-xs font-semibold text-slate-700">
                            Email or Username
                        </label>
                        <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-colors">
                            <Mail size={16} className="ml-3 text-slate-400" />
                            <input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                                placeholder="admin@campus.edu"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                            Password
                        </label>
                        <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-colors">
                            <Lock size={16} className="ml-3 text-slate-400" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Sign In to Portal</span>
                                <LogIn size={15} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
