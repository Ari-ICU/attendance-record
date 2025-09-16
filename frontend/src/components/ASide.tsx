'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sun, Moon, Menu, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from 'next-themes';

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
}

export default function Sidebar({
    menuItems,
    brandName = 'My App',
    brandIcon = <Home size={24} />,
}: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };
        handleResize();
        setMounted(true);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleGroup = (name: string) => {
        setExpandedGroups((prev) =>
            prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
        );
    };

    if (!mounted) return null;

    const RenderMenuItem = ({ item, level = 0 }: { item: MenuItem; level?: number }) => {
        const active = item.href && pathname === item.href;
        const isExpanded = expandedGroups.includes(item.name);

        if (item.group && item.items) {
            return (
                <div key={item.name} className="space-y-1">
                    <button
                        onClick={() => toggleGroup(item.name)}
                        className="flex items-center justify-between w-full gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-expanded={isExpanded}
                        aria-controls={`menu-${item.name}`}
                    >
                        <span className="flex items-center gap-3">
                            {item.icon}
                            {item.name}
                        </span>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {isExpanded && (
                        <div id={`menu-${item.name}`} className="flex flex-col space-y-1 ml-4">
                            {item.items.map((subItem) => (
                                <RenderMenuItem key={subItem.name} item={subItem} level={level + 1} />
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            item.href && (
                <Link
                    href={item.href}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all ${active
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    onClick={() => setIsOpen(false)}
                >
                    {item.icon}
                    {item.name}
                </Link>
            )
        );
    };

    return (
        <>
            {!isOpen && (
                <button
                    className="lg:hidden fixed top-4 right-4 z-50 w-12 h-12 flex items-center justify-center rounded-full shadow-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open sidebar"
                >
                    <Menu size={24} />
                </button>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl text-gray-900 dark:text-gray-100 shadow-lg transform transition-all duration-300 z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
                aria-label="Sidebar navigation"
            >
                <div className="flex items-center justify-start p-4 border-b dark:border-gray-700">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                        {brandIcon}
                        {brandName}
                    </Link>
                </div>

                <nav className="flex flex-col p-3 space-y-2">
                    {menuItems.map((item) => (
                        <RenderMenuItem key={item.name} item={item} />
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t dark:border-gray-700 flex justify-between items-center">
                    <span className="text-sm">Theme</span>
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </aside>
        </>
    );
}
