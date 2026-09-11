'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, QrCode, LogOut, LayoutDashboard, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { getFullImageUrl } from '@/utils/url.utils';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, initializing, loading } = useAuth();
    const { isConnected } = useSocket();
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!initializing && !user) {
            router.push('/login');
        }
    }, [user, initializing, router]);

    if (loading || initializing || !user) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200/80 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                            <Building2 size={17} />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-slate-900 leading-tight">
                                Corporate Workforce Portal
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium">Staff Self-Service Portal</span>
                        </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Live Clock */}
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-mono font-semibold text-slate-600">
                            <Clock size={14} className="text-blue-600" />
                            <span>{currentTime || '08:00:00 AM'}</span>
                        </div>


                        {/* Admin Link if Admin */}
                        {user.role === 'admin' && (
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                            >
                                <LayoutDashboard size={14} />
                                <span className="hidden sm:inline">Admin View</span>
                            </Link>
                        )}

                        {/* User Profile */}
                        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden shadow-2xs">
                                {user?.photoUrl ? (
                                    <img
                                        src={getFullImageUrl(user.photoUrl) || ''}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{user?.firstName?.[0] || 'E'}{user?.lastName?.[0] || ''}</span>
                                )}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-xs font-bold text-slate-900 leading-tight">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium capitalize">
                                    {user?.role || 'Employee'} • {isConnected ? 'Online' : 'Offline'}
                                </p>
                            </div>

                            <button
                                onClick={() => logout()}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                                title="Sign out"
                            >
                                <LogOut size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Body */}
            <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
