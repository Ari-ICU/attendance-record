'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import Button from '../button/Button';
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
            else setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-pane rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/10 relative overflow-hidden group">
                {/* Decorative glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 blur-[100px] rounded-full group-hover:bg-blue-500/30 transition-all duration-500" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[100px] rounded-full group-hover:bg-indigo-500/30 transition-all duration-500" />

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 rotate-3 group-hover:rotate-6 transition-all duration-300">
                            <span className="text-white font-black text-2xl">SA</span>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Welcome Back</h2>
                        <p className="text-slate-400 mt-2 font-medium">Elevating attendance management</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="identifier" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                                Email or Username
                            </label>
                            <div className="flex items-center bg-slate-950/50 border border-white/5 rounded-2xl focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300 group/input hover:bg-slate-950/80">
                                <Mail size={20} className="ml-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    id="identifier"
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full p-4 bg-transparent text-white placeholder-slate-600 focus:outline-none [-webkit-autofill]:bg-transparent [-webkit-autofill]:shadow-[0_0_0px_1000px_transparent_inset] [-webkit-autofill]:[-webkit-text-fill-color:white]"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                                Password
                            </label>
                            <div className="flex items-center bg-slate-950/50 border border-white/5 rounded-2xl focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300 group/input hover:bg-slate-950/80">
                                <Lock size={20} className="ml-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-4 bg-transparent text-white placeholder-slate-600 focus:outline-none [-webkit-autofill]:bg-transparent [-webkit-autofill]:shadow-[0_0_0px_1000px_transparent_inset] [-webkit-autofill]:[-webkit-text-fill-color:white]"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="pr-4 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98] mt-4"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
