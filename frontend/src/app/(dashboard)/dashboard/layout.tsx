'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/ASide';
import AHeader from '@/components/AHeader';
import {
    Home,
    User,
    Settings,
    Calendar,
    BarChart3,
    CreditCard,
    Clock,
    ShieldCheck,
    Users,
    Aperture
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { user, loading, initializing } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        {
            name: 'Overview',
            href: '/dashboard',
            icon: <Home size={20} />,
        },
        {
            name: 'Attendance',
            icon: <ShieldCheck size={20} />,
            group: true,
            items: [
                { name: 'Live Monitor', href: '/dashboard/attendance/monitor', icon: <Clock size={20} /> },
                { name: 'Records', href: '/dashboard/attendance/records', icon: <Calendar size={20} /> },
                { name: 'Scan Station', href: '/verify', icon: <Aperture size={20} /> },
            ],
        },
        {
            name: 'Management',
            icon: <Users size={20} />,
            group: true,
            items: [
                { name: 'Employees', href: '/dashboard/management/employee?type=employee', icon: <User size={20} /> },
                { name: 'Students', href: '/dashboard/management/employee?type=student', icon: <Users size={20} /> },
                { name: 'Departments', href: '/dashboard/management/departments', icon: <Users size={20} /> },
            ],
        },
        {
            name: 'Organization',
            icon: <BarChart3 size={20} />,
            group: true,
            items: [
                { name: 'Payroll', href: '/dashboard/finance/payroll', icon: <CreditCard size={20} /> },
                { name: 'Reports', href: '/dashboard/reports/analytics', icon: <BarChart3 size={20} /> },
            ],
        },
        {
            name: 'System',
            icon: <Settings size={20} />,
            group: true,
            items: [
                { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={20} /> },
            ],
        },
    ];

    useEffect(() => {
        const handleResize = () => setSidebarCollapsed(window.innerWidth < 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar on route change on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarCollapsed(true);
        }
    }, [pathname]);

    useEffect(() => {
        if (!initializing && !user) {
            router.push('/login');
        }
    }, [user, initializing, router]);

    if (loading || initializing || !user) return null;

    return (
        <div className="flex min-h-screen font-sans text-slate-100">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 transform ${sidebarCollapsed ? 'translate-x-[-100%] lg:translate-x-0 lg:w-20' : 'translate-x-[0] w-64'} shadow-2xl`}>
                <Sidebar menuItems={menuItems} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            </div>

            {/* Mobile Overlay */}
            {!sidebarCollapsed && (
                <div
                    className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} relative min-h-screen`}>
                {/* Header */}
                <AHeader sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />

                {/* Background ambient glow */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-transparent pointer-events-none opacity-50 blur-3xl z-0" />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 relative z-10 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}