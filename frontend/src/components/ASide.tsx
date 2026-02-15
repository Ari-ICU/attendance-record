'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Menu, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
    name: string;
    href?: string;
    icon: React.ReactNode;
    group?: boolean;
    items?: MenuItem[];
}

interface SidebarProps {
    menuItems: MenuItem[];
    brandName?: string;
    brandIcon?: React.ReactNode;
    collapsed?: boolean;
}

export default function Sidebar({
    menuItems,
    brandName = 'Smart Attendance',
    brandIcon = <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">SA</div>,
    collapsed = false,
}: SidebarProps) {
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const pathname = usePathname();
    const { logout } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleGroup = (name: string) => {
        if (collapsed) return;
        setExpandedGroups((prev) =>
            prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
        );
    };

    if (!mounted) return null;

    const RenderMenuItem = ({ item, level = 0 }: { item: MenuItem; level?: number }) => {
        const active = item.href && pathname === item.href;
        const isExpanded = expandedGroups.includes(item.name);
        const hasChildren = item.group && item.items && item.items.length > 0;

        // Group (Parent) Item
        if (hasChildren) {
            return (
                <div key={item.name} className="space-y-1 mb-1">
                    <button
                        onClick={() => toggleGroup(item.name)}
                        className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200 group relative
                            ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5'}
                            ${collapsed ? 'justify-center' : ''}
                        `}
                        title={collapsed ? item.name : ''}
                    >
                        <div className={`flex items-center gap-3 ${active ? 'text-blue-400' : 'text-slate-400'}`}>
                            <span className="bg-white/5 p-1 rounded-lg">{item.icon}</span>
                            {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
                        </div>
                        {!collapsed && (
                            <span className={`text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                <ChevronDown size={14} />
                            </span>
                        )}
                    </button>

                    {/* Collapsed Sub-menu */}
                    <AnimatePresence>
                        {isExpanded && !collapsed && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden ml-4 pl-2 border-l-2 border-white/5"
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

        // Single Link Item
        return (
            <Link
                key={item.name}
                href={item.href || '#'}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 mb-1 relative group
                    ${active ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                    ${collapsed ? 'justify-center aspect-square' : ''}
                `}
                title={collapsed ? item.name : ''}
            >
                {active && (
                    <motion.div
                        layoutId="active-nav-item"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 rounded-xl"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}

                <span className={`z-10 ${active ? 'text-white' : ''}`}>{item.icon}</span>
                {!collapsed && <span className="z-10 font-medium text-sm">{item.name}</span>}

                {/* Hover Glow */}
                {!active && (
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                )}
            </Link>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-xl border-r border-white/5">
            {/* Brand Header */}
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start px-6'} h-20 border-b border-white/5 shrink-0`}>
                <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
                    {brandIcon}
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                {brandName}
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
                {menuItems.map((item) => (
                    <RenderMenuItem key={item.name} item={item} />
                ))}
            </nav>

            {/* Footer / User Controls */}
            <div className={`p-4 border-t border-white/5 bg-slate-950/20 ${collapsed ? 'items-center' : ''} flex flex-col gap-2`}>


                <button
                    onClick={() => logout()}
                    className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all
                        ${collapsed ? 'justify-center self-center aspect-square' : ''}
                    `}
                    title="Logout"
                >
                    <LogOut size={18} />
                    {!collapsed && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </div>
    );
}
