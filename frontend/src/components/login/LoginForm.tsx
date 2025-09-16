'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import Button from '../button/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
    const [identifier, setIdentifier] = useState(''); // Changed from email to identifier
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1A1F2E] text-gray-900 dark:text-gray-100 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">Login to My App</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <label htmlFor="identifier" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Email or Username
                        </label>
                        <div className="flex items-center border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-600 focus-within:ring-2 focus-within:ring-blue-400 dark:focus-within:ring-blue-600 transition-all duration-200 shadow-sm">
                            <Mail size={20} className="ml-3 text-gray-400 dark:text-gray-500" />
                            <input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full p-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none autofill:bg-transparent autofill:shadow-[0_0_0px_1000px_theme(colors.gray.700)_inset] dark:autofill:shadow-[0_0_0px_1000px_theme(colors.gray.700)_inset]"
                                placeholder="Enter your email or username"
                                aria-describedby={error ? 'identifier-error' : undefined}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <div className="flex items-center dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-600 focus-within:ring-2 focus-within:ring-blue-400 dark:focus-within:ring-blue-600 transition-all duration-200 shadow-sm">
                            <Lock size={20} className="ml-3 text-gray-400 dark:text-gray-500" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none"
                                placeholder="Enter your password"
                                aria-describedby={error ? 'password-error' : undefined}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="pr-3 text-gray-400 dark:text-gray-500"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={isLoading}
                            icon={<LogIn size={20} />}
                        >
                            Login
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}