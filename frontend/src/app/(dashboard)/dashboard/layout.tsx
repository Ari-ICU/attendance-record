'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ASide';
import { Home, User, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { theme } = useTheme();
    const { user, loading, initializing } = useAuth();
    const router = useRouter();

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
        {
            name: 'Management',
            icon: <Settings size={20} />,
            group: true,
            items: [
                { name: 'Employee', href: '/dashboard/management/employee', icon: <User size={20} /> },
                // {
                //     name: 'Advanced',
                //     icon: <Settings size={20} />,
                //     group: true,
                //     items: [
                //         { name: 'Permissions', href: '/management/advanced/permissions', icon: <User size={20} /> },
                //     ],
                // },
            ],
        },
    ];

    useEffect(() => {
        const handleResize = () => setSidebarCollapsed(window.innerWidth < 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!initializing && !user) {
            router.push('/login');
        }
    }, [user, initializing, router]);

    if (loading || initializing || !user) return null;

    return (
        <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            <Sidebar menuItems={menuItems} />
            <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <main className="">{children}</main>
            </div>
        </div>
    );
}