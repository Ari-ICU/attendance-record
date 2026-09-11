import { Bell, Search, Menu, User, Settings, LogOut, ChevronRight, X, Trash2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullImageUrl } from '@/utils/url.utils';
import { formatDistanceToNow } from 'date-fns';

interface AHeaderProps {
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

import { searchablePages } from '@/config/menuItems';

export default function AHeader({ sidebarCollapsed, setSidebarCollapsed }: AHeaderProps) {
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useSocket();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const filteredResults = searchQuery
        ? searchablePages.filter(page =>
            page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            page.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];


    const handleSearchSelect = (href: string) => {
        router.push(href);
        setSearchQuery('');
        setIsSearchFocused(false);
    };

    return (
        <header className="sticky top-0 z-30 w-full bg-slate-900 border-b border-slate-800 transition-colors">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Left: Sidebar Toggle & Search */}
                <div className="flex items-center gap-4 flex-1">
                    {/* Mobile: Hide menu when search is focused and screen is small */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={`p-2 -ml-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors lg:hidden ${isSearchFocused ? 'hidden sm:block' : ''}`}
                    >
                        <Menu size={22} />
                    </button>

                    <div className={`flex items-center w-full relative group z-50 transition-all duration-300 ${isSearchFocused ? 'max-w-full absolute left-0 pr-4 pl-4 bg-slate-900 h-16 sm:relative sm:max-w-sm lg:max-w-md sm:h-auto sm:p-0' : 'max-w-[40px] sm:max-w-sm lg:max-w-md'}`}>
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearchFocused ? 'text-blue-400' : 'text-slate-500'}`} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            placeholder="Quick search... (Type to find pages)"
                            className={`
                                w-full py-2 pl-9 pr-10 sm:pr-14 text-sm 
                                transition-all outline-none rounded-xl
                                ${isSearchFocused
                                    ? 'bg-slate-950 border border-blue-500 ring-1 ring-blue-500 text-slate-100 placeholder-slate-500 opacity-100'
                                    : 'bg-transparent sm:bg-slate-950 border border-transparent sm:border-slate-800 text-transparent sm:text-slate-200 placeholder-transparent sm:placeholder-slate-500 cursor-pointer sm:cursor-text w-[40px] sm:w-full'
                                }
                            `}
                        />

                        {!searchQuery && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </div>
                        )}

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {isSearchFocused && searchQuery && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden max-h-96 overflow-y-auto"
                                >
                                    {filteredResults.length > 0 ? (
                                        <div className="py-2">
                                            <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                Search Results ({filteredResults.length})
                                            </div>
                                            {filteredResults.map((result, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSearchSelect(result.href)}
                                                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-200 group-hover:text-white">
                                                                {result.name}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                                                                In {result.category}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-1 group-hover:translate-x-0" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-400">
                                            <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                                            <p className="text-sm font-medium text-slate-300">No results found</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Try searching for 'Settings' or 'Employee'</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-3 sm:gap-4">

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                        >
                            <Bell size={19} className={unreadCount > 0 ? "text-slate-100" : ""} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-blue-600 rounded-full ring-2 ring-slate-900 flex items-center justify-center text-[10px] font-bold text-white px-1">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotificationsOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsNotificationsOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 rounded-xl shadow-xl border border-slate-800 overflow-hidden z-50 origin-top-right flex flex-col max-h-[80vh]"
                                    >
                                        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
                                            <h3 className="font-semibold text-sm text-white">Notifications</h3>
                                            <div className="flex items-center gap-2">
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="text-[10px] uppercase font-bold text-blue-400 hover:text-blue-300 transition-colors"
                                                        title="Mark all as read"
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={clearNotifications}
                                                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                                                    title="Clear all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto min-h-[200px]">
                                            {notifications.length > 0 ? (
                                                <div className="divide-y divide-slate-800">
                                                    {notifications.map((notification) => (
                                                        <div
                                                            key={notification.id}
                                                            className={`p-4 hover:bg-slate-800/60 transition-colors relative group ${!notification.read ? 'bg-blue-950/20' : ''}`}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-slate-700'}`} />
                                                                <div className="flex-1 space-y-1">
                                                                    <p className={`text-sm leading-snug ${!notification.read ? 'text-slate-100 font-medium' : 'text-slate-400'}`}>
                                                                        {notification.message}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-500 font-mono">
                                                                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                                                    </p>
                                                                </div>
                                                                {!notification.read && (
                                                                    <button
                                                                        onClick={() => markAsRead(notification.id)}
                                                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-all absolute top-2 right-2"
                                                                        title="Mark as read"
                                                                    >
                                                                        <CheckCircle2 size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                                    <Bell className="w-10 h-10 text-slate-700 mb-3" />
                                                    <p className="text-sm font-medium text-slate-300">All caught up!</p>
                                                    <p className="text-xs text-slate-500 mt-1">No new notifications to display</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 p-1.5 pl-3 pr-2 rounded-xl hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
                        >
                            <div className="hidden md:flex flex-col items-end mr-1">
                                <span className="text-sm font-semibold text-slate-200 leading-none">
                                    {user?.firstName} {user?.lastName}
                                </span>
                                <span className="text-xs text-slate-400 mt-1">
                                    {user?.role || 'Admin'}
                                </span>
                            </div>
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                {user?.photoUrl ? (
                                    <img
                                        src={getFullImageUrl(user.photoUrl) || ''}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                                )}
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
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-xl shadow-xl border border-slate-800 overflow-hidden z-50 origin-top-right"
                                    >
                                        <div className="p-4 border-b border-slate-800 bg-slate-950">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                                            <p className="text-sm text-slate-200 font-medium truncate mt-0.5">{user?.email}</p>
                                        </div>

                                        <div className="p-1.5">
                                            <Link href="/dashboard/profile" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                                                <User size={16} />
                                                My Profile
                                            </Link>
                                            <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                                                <Settings size={16} />
                                                Settings
                                            </Link>
                                            <div className="h-px bg-slate-800 my-1" />
                                            <button
                                                onClick={() => logout()}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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

