'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
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
            setError('Please enter your email/username and password');
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
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-100 font-sans select-none">
            <div className="w-full max-w-md bg-white border border-slate-300 rounded-3xl p-8 sm:p-10 shadow-xs">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mx-auto mb-4 font-black text-base shadow-xs">
                        SF
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                        StaffFlow Portal
                    </h1>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                        Sign in to access your administrative management center
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="identifier" className="text-xs font-black text-black uppercase tracking-wider">
                            Email or Username
                        </label>
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-2xl focus-within:bg-white focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition-all">
                            <Mail size={16} className="ml-3.5 text-black shrink-0" />
                            <input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full px-3 py-3 bg-transparent text-xs sm:text-sm font-bold text-black placeholder-slate-500 focus:outline-hidden"
                                placeholder="admin@system.com"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-xs font-black text-black uppercase tracking-wider">
                                Password
                            </label>
                        </div>
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-2xl focus-within:bg-white focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition-all">
                            <Lock size={16} className="ml-3.5 text-black shrink-0" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-3 bg-transparent text-xs sm:text-sm font-bold text-black placeholder-slate-500 focus:outline-hidden"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="pr-3.5 text-slate-700 hover:text-black transition-colors cursor-pointer"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-3 bg-black hover:bg-slate-900 text-white text-xs sm:text-sm font-black rounded-2xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Sign In to Dashboard</span>
                                <ArrowRight size={15} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Security Notice */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-800">
                    <ShieldCheck size={14} className="text-black" />
                    <span>256-bit Encrypted Session • Enterprise Security</span>
                </div>
            </div>
        </div>
    );
}
