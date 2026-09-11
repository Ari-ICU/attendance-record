'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LogOut,
    QrCode,
    PlusCircle,
    UserCheck,
    Radio
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullImageUrl } from '@/utils/url.utils';

interface MenuItem {
    name: string;
    href?: string;
    icon: React.ReactNode;
    group?: boolean;
    badge?: string | number;
    items?: MenuItem[];
}

interface SidebarProps {
    menuItems: MenuItem[];
    brandName?: string;
    brandIcon?: React.ReactNode;
    collapsed?: boolean;
    setCollapsed?: (collapsed: boolean) => void;
}

export default function Sidebar({
    menuItems,
    brandName = 'Smart Attendance',
    brandIcon = (
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-none shrink-0">
            ARI
        </div>
    ),
    collapsed = false,
    setCollapsed = () => { },
}: SidebarProps) {
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { isConnected } = useSocket();
    const [mounted, setMounted] = useState(false);

    // Initialize and auto-expand group if current route is inside it
    useEffect(() => {
        setMounted(true);
        const activeGroups: string[] = [];
        menuItems.forEach((item) => {
            if (item.group && item.items) {
                const isChildActive = item.items.some((sub) => sub.href && (pathname === sub.href || (sub.href !== '/dashboard' && pathname.startsWith(sub.href))));
                if (isChildActive) {
                    activeGroups.push(item.name);
                }
            }
        });
        if (activeGroups.length > 0) {
            setExpandedGroups((prev) => Array.from(new Set([...prev, ...activeGroups])));
        }
    }, [pathname, menuItems]);

    const toggleGroup = (name: string) => {
        if (collapsed) {
            setCollapsed(false);
            setExpandedGroups([name]);
            return;
        }
        setExpandedGroups((prev) =>
            prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
        );
    };

    if (!mounted) return null;

    const isItemActive = (href?: string) => {
        if (!href) return false;
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname === href || pathname.startsWith(href);
    };

    const isGroupActive = (item: MenuItem) => {
        if (!item.items) return false;
        return item.items.some((sub) => isItemActive(sub.href));
    };

    const RenderMenuItem = ({ item, level = 0 }: { item: MenuItem; level?: number }) => {
        const active = isItemActive(item.href);
        const groupActive = isGroupActive(item);
        const isExpanded = expandedGroups.includes(item.name);
        const hasChildren = item.group && item.items && item.items.length > 0;

        if (hasChildren) {
            return (
                <div key={item.name} className="px-2 mb-1 relative group/item">
                    <button
                        onClick={() => toggleGroup(item.name)}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-colors text-xs font-semibold
                            ${groupActive ? 'text-slate-100 bg-slate-900/90' : isExpanded ? 'bg-slate-900/60 text-slate-200' : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'}
                            ${collapsed ? 'justify-center px-0 h-10 w-10 mx-auto' : ''}
                        `}
                    >
                        <div className="flex items-center gap-2.5">
                            <span className={`shrink-0 transition-colors ${groupActive ? 'text-blue-400' : isExpanded ? 'text-slate-300' : 'text-slate-400'}`}>
                                {item.icon}
                            </span>
                            {!collapsed && <span className="truncate">{item.name}</span>}
                        </div>
                        {!collapsed && (
                            <ChevronDown
                                size={14}
                                className={`text-slate-500 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180 text-blue-400' : ''}`}
                            />
                        )}
                    </button>

                    {/* Collapsed Tooltip / Dropdown indicator */}
                    {collapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-xs font-medium text-slate-100 rounded-lg shadow-xl opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity duration-150 z-50 whitespace-nowrap">
                            {item.name}
                        </div>
                    )}

                    {/* Expanded child menu */}
                    <AnimatePresence>
                        {isExpanded && !collapsed && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden ml-5 pl-2.5 border-l border-slate-800/90 mt-1 space-y-0.5"
                            >
                                {item.items!.map((subItem) => (
                                    <RenderMenuItem key={subItem.name} item={subItem} level={level + 1} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        }

        return (
            <div key={item.name} className="px-2 mb-1 relative group/item">
                <Link
                    href={item.href || '#'}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors text-xs font-semibold relative
                        ${active
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }
                        ${collapsed ? 'justify-center px-0 h-10 w-10 mx-auto' : ''}
                    `}
                >
                    <span className={`shrink-0 ${active ? 'text-white' : 'text-slate-400'}`}>
                        {item.icon}
                    </span>
                    {!collapsed && (
                        <span className="truncate flex-1">{item.name}</span>
                    )}
                    {item.badge && !collapsed && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {item.badge}
                        </span>
                    )}
                </Link>

                {/* Collapsed Tooltip */}
                {collapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-xs font-medium text-slate-100 rounded-lg shadow-xl opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity duration-150 z-50 whitespace-nowrap">
                        {item.name}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 select-none">
            {/* Branding Header */}
            <div className={`h-16 px-4 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} border-b border-slate-800 shrink-0`}>
                <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
                    {brandIcon}
                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-slate-100 leading-tight truncate">
                                {brandName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">Enterprise Hub</span>
                        </div>
                    )}
                </Link>

                {/* Desktop Collapse Toggle */}
                {!collapsed && (
                    <button
                        onClick={() => setCollapsed(true)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors hidden lg:flex items-center justify-center"
                        title="Collapse sidebar"
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}
            </div>

            {/* Quick Actions (Full mode) */}
            {!collapsed && (
                <div className="p-3 border-b border-slate-800/80">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-2">Direct Access</p>
                    <div className="grid grid-cols-2 gap-2">
                        <Link
                            href="/verify"
                            className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-colors"
                        >
                            <QrCode size={15} className="text-blue-400 shrink-0" />
                            <span className="text-xs font-semibold">Scanner</span>
                        </Link>
                        <Link
                            href="/dashboard/management/employee?type=employee"
                            className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-colors"
                        >
                            <PlusCircle size={15} className="text-emerald-400 shrink-0" />
                            <span className="text-xs font-semibold">Staff</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar">
                {menuItems.map((item) => (
                    <RenderMenuItem key={item.name} item={item} />
                ))}
            </nav>

            {/* Expand button for collapsed mode */}
            {collapsed && (
                <div className="p-2 border-t border-slate-800/80 hidden lg:flex justify-center">
                    <button
                        onClick={() => setCollapsed(false)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
                        title="Expand sidebar"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            {/* Footer / User & System Status */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2.5">
                {!collapsed ? (
                    <>
                        {/* User Compact Card */}
                        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800/90">
                            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                                {user?.photoUrl ? (
                                    <img
                                        src={getFullImageUrl(user.photoUrl) || ''}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className="text-[10px] text-slate-400 capitalize">{user?.role || 'Admin'} · {isConnected ? 'Online' : 'Offline'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                        >
                            <LogOut size={14} />
                            <span>Sign out</span>
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            title={isConnected ? 'Online' : 'Offline'}
                        />
                        <button
                            onClick={() => logout()}
                            className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/15 transition-colors"
                            title="Sign out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
