'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, Menu, ChevronDown, ChevronLeft, ChevronRight,
    LogOut, User, Zap, Activity, ShieldCheck,
    PlusCircle, QrCode, Bell, Settings, Terminal, Map
} from 'lucide-react';
import { getFullImageUrl } from '@/utils/url.utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
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
    setCollapsed?: (collapsed: boolean) => void;
}

export default function Sidebar({
    menuItems,
    brandName = 'Smart Attendance',
    brandIcon = <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-emerald-400 flex items-center justify-center text-white font-black text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-transform group-hover:rotate-12">ARI</div>,
    collapsed = false,
    setCollapsed = () => { },
}: SidebarProps) {
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { isConnected } = useSocket();
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

        if (hasChildren) {
            return (
                <div key={item.name} className="px-2 mb-2">
                    <button
                        onClick={() => toggleGroup(item.name)}
                        className={`flex items-center justify-between w-full p-3 rounded-2xl transition-all duration-300 group
                            ${isExpanded ? 'bg-white/[0.03] shadow-inner' : 'hover:bg-white/[0.02]'}
                            ${collapsed ? 'justify-center' : ''}
                        `}
                    >
                        <div className={`flex items-center gap-3 ${active ? 'text-indigo-400' : 'text-slate-500'}`}>
                            <span className={`p-2 rounded-xl transition-colors ${isExpanded ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-900 text-slate-600 group-hover:text-slate-400'}`}>
                                {item.icon}
                            </span>
                            {!collapsed && <span className="font-black text-[10px] uppercase tracking-[0.2em]">{item.name}</span>}
                        </div>
                        {!collapsed && (
                            <ChevronDown size={14} className={`text-slate-600 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-400' : ''}`} />
                        )}
                    </button>

                    <AnimatePresence>
                        {isExpanded && !collapsed && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden ml-9 mt-1 space-y-1 relative"
                            >
                                <div className="absolute left-0 top-0 bottom-2 w-[1px] bg-gradient-to-b from-indigo-500/50 to-transparent" />
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
            <Link
                key={item.name}
                href={item.href || '#'}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 mb-1 relative group
                    ${active ? 'text-white shadow-[0_0_20px_rgba(79,70,229,0.15)]' : 'text-slate-500 hover:text-slate-200'}
                    ${collapsed ? 'justify-center mx-2' : 'mx-2'}
                `}
            >
                {active && (
                    <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-blue-600/10 to-transparent border-l-2 border-indigo-500 rounded-2xl"
                        transition={{ type: "spring", stiffness: 350, damping: 35 }}
                    />
                )}
                <span className={`z-10 transition-transform group-hover:scale-110 ${active ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'group-hover:text-white'}`}>
                    {item.icon}
                </span>
                {!collapsed && <span className={`z-10 text-xs font-bold tracking-tight ${active ? 'text-white' : ''}`}>{item.name}</span>}

                {active && !collapsed && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"
                    />
                )}
            </Link>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] border-r border-white/5 relative overflow-hidden group/sidebar">
            {/* Visual Backdrops */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.08),transparent_50%)]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Branding Header */}
            <div className={`p-8 flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-4 relative z-10 shrink-0`}>
                <Link href="/" className="group flex items-center gap-4">
                    {brandIcon}
                    {!collapsed && (
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black tracking-tighter text-white italic leading-none">
                                VANGUARD<span className="text-indigo-500">.</span>
                            </h1>
                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.5em] mt-1">Tactical OS v1.3</p>
                        </div>
                    )}
                </Link>
            </div>

            {/* Quick Access Grid - Tactical Style */}
            {!collapsed && (
                <div className="px-6 mb-8 space-y-4 relative z-10">
                    <div className="flex items-center gap-2 px-1">
                        <Terminal size={10} className="text-indigo-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Direct Command</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Link href="/verify" className="flex flex-col items-center p-3 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group/btn">
                            <QrCode size={18} className="text-slate-500 group-hover/btn:text-indigo-400 mb-2 transition-colors" />
                            <span className="text-[8px] font-black text-slate-600 group-hover/btn:text-white uppercase italic">Intercept</span>
                        </Link>
                        <Link href="/dashboard/management/employee" className="flex flex-col items-center p-3 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group/btn">
                            <PlusCircle size={18} className="text-slate-500 group-hover/btn:text-emerald-400 mb-2 transition-colors" />
                            <span className="text-[8px] font-black text-slate-600 group-hover/btn:text-white uppercase italic">Deploy</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Navigation Flow */}
            <nav className="flex-1 overflow-y-auto pt-2 pb-6 scrollbar-hide relative z-10">
                {menuItems.map((item) => (
                    <RenderMenuItem key={item.name} item={item} />
                ))}
            </nav>

            {/* Tactical Footer */}
            <div className="p-6 bg-slate-950/80 border-t border-white/5 relative z-20 space-y-6">

                {/* Health/Auth Widget */}
                {!collapsed && (
                    <div className="p-4 rounded-[2rem] bg-indigo-600/5 border border-indigo-500/10 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Sys Integrity</span>
                            <span className="text-[8px] font-mono text-indigo-300">SEC_OP_OK</span>
                        </div>
                        <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden flex gap-0.5">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0.3 }}
                                    animate={{ opacity: i < 6 ? 1 : 0.2 }}
                                    className={`h-full flex-1 ${i < 6 ? 'bg-indigo-500' : 'bg-slate-700'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <button onClick={() => logout()} className={`flex-1 flex items-center gap-3 p-3.5 rounded-3xl bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 text-rose-500 transition-all ${collapsed ? 'justify-center aspect-square' : 'px-5'}`}>
                        <LogOut size={18} />
                        {!collapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Eject</span>}
                    </button>
                </div>

                {/* Local Grid Metadata */}
                {!collapsed && (
                    <div className="flex items-center justify-between px-2 pt-2">
                        <div className="flex items-center gap-1.5 font-mono text-[7px] font-bold text-slate-700 uppercase">
                            <Map size={8} />
                            <span>Grid: 41.40338 / 2.17403</span>
                        </div>
                        <span className="text-[7px] font-mono font-bold text-slate-700">L_REQ: 12ms</span>
                    </div>
                )}
            </div>
        </div>
    );
}
