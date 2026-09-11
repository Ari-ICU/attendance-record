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
    Bell
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
            name: 'Dashboard',
            href: '/dashboard',
            icon: <Home size={19} />,
        },
        {
            name: 'Attendance',
            icon: <ShieldCheck size={19} />,
            group: true,
            items: [
                { name: 'Live Monitor', href: '/dashboard/attendance/monitor', icon: <Clock size={18} /> },
                { name: 'Records', href: '/dashboard/attendance/records', icon: <Calendar size={18} /> },
            ],
        },
        {
            name: 'Management',
            icon: <Users size={19} />,
            group: true,
            items: [
                { name: 'Students', href: '/dashboard/management/employee?type=student', icon: <Users size={18} /> },
                { name: 'Teachers / Staff', href: '/dashboard/management/employee?type=employee', icon: <User size={18} /> },
                { name: 'Classes / Depts', href: '/dashboard/management/departments', icon: <Users size={18} /> },
            ],
        },
        {
            name: 'Reports & Finance',
            icon: <BarChart3 size={19} />,
            group: true,
            items: [
                { name: 'Reports', href: '/dashboard/reports/analytics', icon: <BarChart3 size={18} /> },
                { name: 'Payroll', href: '/dashboard/finance/payroll', icon: <CreditCard size={18} /> },
            ],
        },
        {
            name: 'System',
            icon: <Settings size={19} />,
            group: true,
            items: [
                { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={18} /> },
                { name: 'Notifications', href: '/dashboard/notifications', icon: <Bell size={18} /> },
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
        <div className="flex min-h-screen bg-slate-50/70 text-slate-800 font-sans antialiased">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 transform ${sidebarCollapsed ? 'translate-x-[-100%] lg:translate-x-0 lg:w-20' : 'translate-x-[0] w-64'} shadow-sm print:hidden`}>
                <Sidebar menuItems={menuItems} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            </div>

            {/* Mobile Overlay */}
            {!sidebarCollapsed && (
                <div
                    className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity duration-300 print:hidden"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} min-h-screen print:ml-0`}>
                {/* Header */}
                <div className="print:hidden">
                    <AHeader sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                </div>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 relative z-10 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}