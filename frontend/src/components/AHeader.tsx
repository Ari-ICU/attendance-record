import Link from 'next/link';
import { Bell, Search, Menu, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullImageUrl } from '@/utils/url.utils';

interface AHeaderProps {
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

export default function AHeader({ sidebarCollapsed, setSidebarCollapsed }: AHeaderProps) {
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 w-full bg-slate-900/40 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Left: Sidebar Toggle & Search */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 -ml-2 rounded-lg text-slate-400 hover:bg-white/5 transition-colors lg:hidden"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="hidden sm:flex items-center max-w-md w-full relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="
                                w-full bg-slate-950/50 border border-white/5 
                                focus:bg-slate-950 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 
                                rounded-full py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 
                                transition-all duration-200 outline-none
                            "
                        />
                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-3 sm:gap-4">

                    {/* Notifications */}
                    <button className="relative p-2 rounded-full text-slate-400 hover:bg-white/5 transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-900" />
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 p-1 pl-3 pr-1 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                        >
                            <div className="hidden md:flex flex-col items-end mr-1">
                                <span className="text-sm font-semibold text-slate-200 leading-none">
                                    {user?.firstName} {user?.lastName}
                                </span>
                                <span className="text-xs text-slate-400 mt-1">
                                    {user?.role || 'Admin'}
                                </span>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-blue-500/20">
                                <div className="h-full w-full rounded-full bg-slate-900 overflow-hidden text-[10px]">
                                    {user?.photoUrl ? (
                                        <img
                                            src={getFullImageUrl(user.photoUrl) || ''}
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-slate-800 text-slate-100 font-bold">
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsProfileOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-56 bg-slate-900/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 origin-top-right"
                                    >
                                        <div className="p-4 border-b border-white/5 bg-white/5">
                                            <p className="text-sm font-semibold text-white">Signed in as</p>
                                            <p className="text-sm text-slate-400 truncate">{user?.email}</p>
                                        </div>

                                        <div className="p-1">
                                            <Link href="/dashboard/profile" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors">
                                                <User size={16} />
                                                My Profile
                                            </Link>
                                            <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors">
                                                <Settings size={16} />
                                                Settings
                                            </Link>
                                            <div className="h-px bg-white/5 my-1" />
                                            <button
                                                onClick={() => logout()}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <LogOut size={16} />
                                                Sign out
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}

