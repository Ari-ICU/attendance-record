import { Home, User, Settings } from 'lucide-react';

export const defaultMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
  {
    name: 'Management',
    icon: <Settings size={20} />,
    group: true,
    items: [
      { name: 'Employee', href: '/management/employee', icon: <User size={20} /> },
    ],
  },
];
