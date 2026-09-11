'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MenuItem {
    name: string;
    href?: string;
    icon: React.ReactNode;
    group?: boolean;
    badge?: string | number;
    items?: MenuItem[];
    section?: string;
}

interface SidebarProps {
    menuItems: MenuItem[];
    brandName?: string;
    brandSubtitle?: string;
    brandIcon?: React.ReactNode;
    collapsed?: boolean;
    setCollapsed?: (collapsed: boolean) => void;
}

export default function Sidebar({
    menuItems,
    brandName = 'StaffFlow',
    brandSubtitle = 'Management System',
    brandIcon = (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
            SF
        </div>
    ),
    collapsed = false,
    setCollapsed = () => {},
}: SidebarProps) {
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    const isItemActive = (href?: string) => {
        if (!href) return false;
        const [targetPath, targetQuery] = href.split('?');

        if (targetPath === '/dashboard') {
            return pathname === '/dashboard';
        }

        if (targetQuery) {
            const targetParams = new URLSearchParams(targetQuery);
            if (pathname !== targetPath) return false;
            for (const [key, value] of targetParams.entries()) {
                if (searchParams.get(key) !== value) return false;
            }
            return true;
        }

        if (pathname === targetPath) {
            if (searchParams.toString()) {
                const hasQuerySibling = menuItems.some(
                    (m) =>
                        m.href?.startsWith(targetPath + '?') ||
                        m.items?.some((sub) => sub.href?.startsWith(targetPath + '?'))
                );
                if (hasQuerySibling) return false;
            }
            return true;
        }

        return pathname.startsWith(targetPath + '/');
    };

    const isGroupActive = (item: MenuItem) => {
        if (!item.items) return false;
        return item.items.some((sub) => isItemActive(sub.href));
    };

    // Auto-expand group if current route is active inside
    useEffect(() => {
        setMounted(true);
        const activeGroups: string[] = [];
        menuItems.forEach((item) => {
            if (item.group && item.items) {
                const isChildActive = item.items.some((sub) => isItemActive(sub.href));
                if (isChildActive) {
                    activeGroups.push(item.name);
                }
            }
        });
        if (activeGroups.length > 0) {
            setExpandedGroups((prev) => Array.from(new Set([...prev, ...activeGroups])));
        }
    }, [pathname, searchParams, menuItems]);

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

    const renderMenuContent = () => {
        let lastSection: string | undefined = undefined;

        return menuItems.map((item, idx) => {
            const showSectionHeader = item.section && item.section !== lastSection;
            if (item.section) lastSection = item.section;

            const active = isItemActive(item.href);
            const groupActive = isGroupActive(item);
            const isExpanded = expandedGroups.includes(item.name);
            const hasChildren = item.group && item.items && item.items.length > 0;

            return (
                <div key={item.name + idx}>
                    {showSectionHeader && (
                        <div className="mt-3 mb-1">
                            {!collapsed ? (
                                <p className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider px-3.5 pt-1">
                                    {item.section}
                                </p>
                            ) : (
                                <div className="border-t border-slate-200 my-2 mx-3" />
                            )}
                        </div>
                    )}

                    {hasChildren ? (
                        <div className="px-2.5 mb-0.5 relative group/item">
                            <button
                                onClick={() => toggleGroup(item.name)}
                                className={`flex items-center justify-between w-full px-2.5 py-2 rounded-xl transition-all text-xs font-bold cursor-pointer
                                    ${groupActive
                                        ? 'text-blue-600 bg-blue-50 font-bold'
                                        : isExpanded
                                            ? 'bg-slate-100 text-slate-950 font-bold'
                                            : 'text-slate-900 hover:bg-slate-100 hover:text-black'
                                    }
                                    ${collapsed ? 'justify-center px-0 h-9 w-9 mx-auto' : ''}
                                `}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className={`shrink-0 transition-colors ${groupActive ? 'text-blue-600' : 'text-slate-700 group-hover/item:text-black'}`}>
                                        {item.icon}
                                    </span>
                                    {!collapsed && <span className="truncate">{item.name}</span>}
                                </div>
                                {!collapsed && (
                                    <ChevronDown
                                        size={14}
                                        className={`text-slate-600 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`}
                                    />
                                )}
                            </button>

                            {/* Collapsed Tooltip */}
                            {collapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity duration-150 z-50 whitespace-nowrap">
                                    {item.name}
                                </div>
                            )}

                            {/* Submenu */}
                            <AnimatePresence>
                                {isExpanded && !collapsed && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden ml-4 pl-2.5 border-l border-slate-300 my-1 space-y-0.5"
                                    >
                                        {item.items!.map((subItem) => {
                                            const subActive = isItemActive(subItem.href);
                                            return (
                                                <Link
                                                    key={subItem.name}
                                                    href={subItem.href || '#'}
                                                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                                                        subActive
                                                            ? 'text-blue-600 bg-blue-50 font-bold'
                                                            : 'text-slate-800 hover:text-black hover:bg-slate-100 font-semibold'
                                                    }`}
                                                >
                                                    <span className="truncate">{subItem.name}</span>
                                                    {subItem.badge && (
                                                        <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                                                            {subItem.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="px-2.5 mb-0.5 relative group/item">
                            <Link
                                href={item.href || '#'}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-xs font-bold relative cursor-pointer
                                    ${active
                                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                                        : 'text-slate-900 hover:bg-slate-100 hover:text-black'
                                    }
                                    ${collapsed ? 'justify-center px-0 h-9 w-9 mx-auto' : ''}
                                `}
                            >
                                <span className={`shrink-0 ${active ? 'text-white' : 'text-slate-700 group-hover/item:text-black'}`}>
                                    {item.icon}
                                </span>
                                {!collapsed && (
                                    <span className="truncate flex-1">{item.name}</span>
                                )}
                                {item.badge && !collapsed && (
                                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                                        active ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600 border border-blue-200'
                                    }`}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>

                            {/* Collapsed Tooltip */}
                            {collapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity duration-150 z-50 whitespace-nowrap">
                                    {item.name}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <aside className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
            {/* Branding Header */}
            <div className={`h-16 px-3.5 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} border-b border-slate-100 shrink-0`}>
                <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
                    {brandIcon}
                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-base font-black text-slate-900 leading-tight truncate tracking-tight">
                                {brandName}
                            </span>
                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{brandSubtitle}</span>
                        </div>
                    )}
                </Link>

                {/* Desktop Collapse Toggle */}
                {!collapsed && (
                    <button
                        onClick={() => setCollapsed(true)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-black transition-colors hidden lg:flex items-center justify-center cursor-pointer"
                        title="Collapse sidebar"
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar">
                <div>
                    {renderMenuContent()}
                </div>
            </nav>

            {/* Expand button for collapsed mode */}
            {collapsed && (
                <div className="p-2 border-t border-slate-100 hidden lg:flex justify-center">
                    <button
                        onClick={() => setCollapsed(false)}
                        className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-black transition-colors cursor-pointer"
                        title="Expand sidebar"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </aside>
    );
}
