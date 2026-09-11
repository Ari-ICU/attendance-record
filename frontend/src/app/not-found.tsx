'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    Home, 
    ArrowLeft, 
    Search, 
    Compass, 
    Layers, 
    Clock, 
    Users, 
    CalendarDays, 
    FileText 
} from 'lucide-react';

export default function NotFound() {
    const router = useRouter();

    const quickLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: Home, desc: 'Main control center' },
        { name: 'Attendance Monitor', href: '/dashboard/attendance/monitor', icon: Clock, desc: 'Real-time check-ins' },
        { name: 'Staff Management', href: '/dashboard/management/employee', icon: Users, desc: 'Employee records' },
        { name: 'Calendar Schedule', href: '/dashboard/calendar', icon: CalendarDays, desc: 'Events & shifts' },
        { name: 'Portal Kiosk', href: '/portal', icon: Layers, desc: 'Employee check-in terminal' },
        { name: 'Reports & Analytics', href: '/dashboard/reports/analytics', icon: FileText, desc: 'Metrics & logs' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="max-w-2xl w-full text-center relative z-10 my-8"
            >
                {/* 404 Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-6 backdrop-blur-md">
                    <Compass size={14} className="animate-spin-slow" />
                    <span>Error 404 • Page Not Found</span>
                </div>

                {/* Big Animated 404 Heading */}
                <h1 className="text-8xl sm:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 select-none">
                    404
                </h1>

                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-3">
                    Lost in the digital workspace?
                </h2>
                
                <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
                    The page you are looking for might have been moved, removed, or is currently being constructed in the new UI update.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-sm font-medium transition-all hover:scale-102 active:scale-98 shadow-sm backdrop-blur-md cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        <span>Go Back</span>
                    </button>
                    
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all hover:scale-102 active:scale-98 shadow-lg shadow-blue-500/25"
                    >
                        <Home size={16} />
                        <span>Back to Dashboard</span>
                    </Link>
                </div>

                {/* Quick Navigation Directory */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl text-left shadow-2xl">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Search size={14} className="text-blue-400" />
                        <span>Or jump directly to a known destination:</span>
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quickLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="group flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all"
                                >
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors shrink-0">
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                                            {link.name}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            {link.desc}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Footer status text */}
                <p className="text-[11px] text-slate-500 mt-8">
                    StaffFlow System • All systems operational
                </p>
            </motion.div>
        </div>
    );
}
