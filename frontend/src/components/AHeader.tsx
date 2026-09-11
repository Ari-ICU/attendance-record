import { Bell, Search, Menu, User, Settings, LogOut, ChevronRight, X, Trash2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullImageUrl } from '@/utils/url.utils';
import { formatDistanceToNow } from 'date-fns';
import { searchablePages } from '@/config/menuItems';

interface AHeaderProps {
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

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
        <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-xs border-b border-slate-200/80 transition-colors">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left: Sidebar Toggle & Search */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={`p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors lg:hidden ${isSearchFocused ? 'hidden sm:block' : ''}`}
                    >
                        <Menu size={20} />
                    </button>

                    <div className={`flex items-center w-full relative group z-50 transition-all duration-300 ${isSearchFocused ? 'max-w-full absolute left-0 pr-4 pl-4 bg-white h-16 sm:relative sm:max-w-sm lg:max-w-md sm:h-auto sm:p-0' : 'max-w-[40px] sm:max-w-sm lg:max-w-md'}`}>
                        <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearchFocused ? 'text-blue-600' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            placeholder="Quick search... (Staff, Departments, Attendance, Payroll)"
                            className={`
                                w-full py-2 pl-9 pr-10 sm:pr-14 text-xs sm:text-sm
                                transition-all outline-none rounded-xl
                                ${isSearchFocused
                                    ? 'bg-white border border-blue-500 ring-2 ring-blue-500/10 text-slate-800 placeholder-slate-400'
                                    : 'bg-transparent sm:bg-slate-100/90 border border-transparent sm:border-slate-200/60 text-transparent sm:text-slate-800 placeholder-transparent sm:placeholder-slate-400 cursor-pointer sm:cursor-text w-[40px] sm:w-full'
                                }
                            `}
                        />

                        {!searchQuery && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400">
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
                                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-96 overflow-y-auto"
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
                                                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between group transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                                        <div>
                                                            <div className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-blue-600">
                                                                {result.name}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                                                                In {result.category}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-1 group-hover:translate-x-0" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-400">
                                            <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                                            <p className="text-xs font-medium">No results found for &ldquo;{searchQuery}&rdquo;</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Notifications & Profile */}
                <div className="flex items-center gap-3">
                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className={`p-2 rounded-xl border transition-colors relative ${
                                isNotificationsOpen
                                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                                    : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
                            }`}
                            title="Notifications"
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        <AnimatePresence>
                            {isNotificationsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50"
                                >
                                    <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-900">Notifications</span>
                                            {unreadCount > 0 && (
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-200">
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </div>
                                        {notifications.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={() => markAllAsRead()}
                                                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => clearNotifications()}
                                                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                                    title="Clear all"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => markAsRead(notif.id)}
                                                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                                                        !notif.read ? 'bg-blue-50/40' : ''
                                                    }`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                                        !notif.read ? 'bg-blue-600' : 'bg-transparent'
                                                    }`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-slate-800 leading-snug">
                                                            {notif.message}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                                                            {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-slate-400">
                                                <Bell size={28} className="mx-auto mb-2 opacity-30" />
                                                <p className="text-xs font-medium">No new notifications</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User Profile Popover */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 transition-colors shadow-xs"
                        >
                            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                                {user?.photoUrl ? (
                                    <img
                                        src={getFullImageUrl(user.photoUrl) || ''}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{user?.firstName?.[0] || 'A'}</span>
                                )}
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-semibold text-slate-900 leading-tight">
                                    {user?.firstName || 'Admin'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium capitalize">
                                    {user?.role || 'Administrator'}
                                </span>
                            </div>
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50"
                                >
                                    <div className="px-3.5 py-2 border-b border-slate-100">
                                        <p className="text-xs font-bold text-slate-900 truncate">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-mono truncate">
                                            {user?.email}
                                        </p>
                                    </div>

                                    <div className="py-1">
                                        <Link
                                            href="/dashboard/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                        >
                                            <User size={14} className="text-slate-400" />
                                            <span>My Profile</span>
                                        </Link>
                                        <Link
                                            href="/dashboard/settings"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                        >
                                            <Settings size={14} className="text-slate-400" />
                                            <span>System Settings</span>
                                        </Link>
                                    </div>

                                    <div className="pt-1 border-t border-slate-100">
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                logout();
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                                        >
                                            <LogOut size={14} />
                                            <span>Sign out</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}
