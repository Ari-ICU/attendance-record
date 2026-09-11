'use client';

import { Bell, Menu, User, Settings, LogOut, Trash2, CheckCircle2 } from 'lucide-react';
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

export default function AHeader({ sidebarCollapsed, setSidebarCollapsed }: AHeaderProps) {
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useSocket();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const userName = user?.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : user?.username || 'Administrator';

    return (
        <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 select-none">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left: Mobile Sidebar Toggle */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 -ml-2 rounded-xl text-slate-800 hover:bg-slate-100 hover:text-black transition-colors lg:hidden cursor-pointer"
                        title="Toggle menu"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                {/* Right: Notification & User Profile Actions */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Notifications Button & Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="relative p-2.5 rounded-xl text-slate-800 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Notifications"
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotificationsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50"
                                >
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </div>

                                        {notifications.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={() => markAllAsRead()}
                                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => clearNotifications()}
                                                    className="p-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                                                    title="Clear all"
                                                >
                                                    <Trash2 size={14} />
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
                                                        !notif.read ? 'bg-blue-50/50' : ''
                                                    }`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                                        !notif.read ? 'bg-blue-600' : 'bg-transparent'
                                                    }`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-slate-900 leading-snug">
                                                            {notif.message}
                                                        </p>
                                                        <span className="text-[10px] text-slate-500 mt-1 block font-medium">
                                                            {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-slate-500">
                                                <Bell size={28} className="mx-auto mb-2 opacity-40 text-slate-400" />
                                                <p className="text-xs font-semibold text-slate-700">No new notifications</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User Profile Popover in Header */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0 shadow-xs">
                                {user?.photoUrl ? (
                                    <img
                                        src={getFullImageUrl(user.photoUrl) || ''}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{user?.firstName?.[0] || user?.username?.[0] || 'A'}</span>
                                )}
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-bold text-slate-900 leading-tight">
                                    {userName}
                                </span>
                                <span className="text-[10px] text-slate-600 font-semibold capitalize">
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
                                    className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50"
                                >
                                    <div className="px-4 py-2.5 border-b border-slate-100">
                                        <p className="text-xs font-bold text-slate-900 truncate">
                                            {userName}
                                        </p>
                                        <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                                            {user?.email || 'admin@system.com'}
                                        </p>
                                    </div>

                                    <div className="py-1">
                                        <Link
                                            href="/dashboard/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:text-black transition-colors"
                                        >
                                            <User size={15} className="text-slate-600" />
                                            <span>My Profile</span>
                                        </Link>
                                        <Link
                                            href="/dashboard/settings"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:text-black transition-colors"
                                        >
                                            <Settings size={15} className="text-slate-600" />
                                            <span>System Settings</span>
                                        </Link>
                                    </div>

                                    <div className="pt-1 border-t border-slate-100">
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                logout();
                                            }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                        >
                                            <LogOut size={15} />
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
