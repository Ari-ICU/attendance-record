'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Settings,
    Database,
    Save,
    Lock,
    Cpu,
    RotateCcw,
    Download,
    Clock,
    UserPlus,
    MapPin,
    Check,
    Search,
    ShieldCheck,
    X,
    Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { SettingsService } from '@/services/settings.service';
import { BackupService, Backup } from '@/services/backup.service';
import CustomDropdown from '@/components/ui/CustomDropdown';

type TabType = 'roles' | 'general' | 'attendance' | 'system' | 'backup';

interface SystemUser {
    _id: string;
    username: string;
    email: string;
    role: 'admin' | 'manager' | 'employee' | string;
    firstName?: string;
    lastName?: string;
    department?: string;
    isLocked?: boolean;
}

const ROLE_PERMISSIONS_MATRIX = [
    {
        module: 'Staff & Employee Directory',
        description: 'Create, update, view and delete company employee profiles and biometrics',
        admin: true,
        manager: true,
        employee: false,
    },
    {
        module: 'Department & Position Management',
        description: 'Configure corporate department hierarchy, teams, and job titles',
        admin: true,
        manager: false,
        employee: false,
    },
    {
        module: 'Attendance Records & Live Hub',
        description: 'View real-time attendance monitor, check-in logs, and daily biometric timestamps',
        admin: true,
        manager: true,
        employee: 'Self Only',
    },
    {
        module: 'Leave & Time Off Approvals',
        description: 'Review, approve, or reject employee leave and vacation requests',
        admin: true,
        manager: true,
        employee: 'Submit Only',
    },
    {
        module: 'Overtime Submissions & Approvals',
        description: 'Authorize project overtime hours, rate calculation, and deliverables',
        admin: true,
        manager: true,
        employee: 'Submit Only',
    },
    {
        module: 'Shifts & Work Schedule Planning',
        description: 'Configure daily work shifts, grace period tolerance, and calendar events',
        admin: true,
        manager: true,
        employee: 'View Only',
    },
    {
        module: 'Geofencing & GPS Radius Rules',
        description: 'Manage corporate office GPS coordinates and maximum check-in distance',
        admin: true,
        manager: false,
        employee: false,
    },
    {
        module: 'Database Backups & Recovery',
        description: 'Generate database snapshots, state restore points, and storage health checks',
        admin: true,
        manager: false,
        employee: false,
    },
];

export default function SettingsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const tabParam = searchParams.get('tab');
    const initialTab: TabType = (tabParam === 'roles' || tabParam === 'personnel')
        ? 'roles'
        : (['general', 'attendance', 'system', 'backup'].includes(tabParam as string)
            ? (tabParam as TabType)
            : 'roles');

    const [activeTab, setActiveTab] = useState<TabType>(initialTab);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Settings state
    const [settings, setSettings] = useState({
        work_start_time: '08:00',
        work_end_time: '17:00',
        grace_period_minutes: 15,
        organization_name: 'STAFFFLOW ENTERPRISE SYSTEMS',
        domain: 'workforce.staffflow.io',
        office_latitude: 11.5564,
        office_longitude: 104.9282,
        geofence_range_meters: 100,
    });

    // Users & Roles state
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        department: 'Engineering & IT',
        role: 'employee',
        password: ''
    });

    // Backups & Diagnostics state
    const [backups, setBackups] = useState<Backup[]>([]);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [systemStats, setSystemStats] = useState<any>(null);
    const [latency, setLatency] = useState<string>('12ms');

    // Sync tab with URL
    useEffect(() => {
        if (tabParam === 'roles' || tabParam === 'personnel') {
            setActiveTab('roles');
        } else if (tabParam && ['general', 'attendance', 'system', 'backup'].includes(tabParam)) {
            setActiveTab(tabParam as TabType);
        }
    }, [tabParam]);

    const handleTabChange = (newTab: TabType) => {
        setActiveTab(newTab);
        router.push(`/dashboard/settings?tab=${newTab}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [settingsData, usersData] = await Promise.allSettled([
                    SettingsService.getSettings(),
                    SettingsService.getAllUsers()
                ]);

                if (settingsData.status === 'fulfilled') {
                    setSettings(prev => ({ ...prev, ...settingsData.value }));
                }

                if (usersData.status === 'fulfilled') {
                    setUsers(usersData.value as SystemUser[]);
                }

                try {
                    const backupsData = await BackupService.listBackups();
                    setBackups(backupsData);
                } catch {
                    // Ignore backup error
                }

                try {
                    const start = performance.now();
                    const stats = await SettingsService.getSystemStats();
                    const end = performance.now();
                    setLatency(`${(end - start).toFixed(0)}ms`);
                    setSystemStats(stats);
                } catch {
                    // Ignore stats error
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load system configuration');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSaveSettings = async () => {
        try {
            setIsSaving(true);
            await SettingsService.updateSettings(settings);
            toast.success('Configuration saved successfully');
        } catch {
            toast.error('Failed to save configuration');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateUserRole = async (userId: string, newRole: string) => {
        try {
            await SettingsService.updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            toast.success(`Role updated to ${newRole.toUpperCase()}`);
        } catch {
            toast.error('Failed to update role');
        }
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserForm.username || !newUserForm.email) {
            toast.error('Please enter username and email');
            return;
        }

        const newUser: SystemUser = {
            _id: `u_${Date.now()}`,
            username: newUserForm.username.toLowerCase().trim(),
            email: newUserForm.email.trim(),
            firstName: newUserForm.firstName || newUserForm.username,
            lastName: newUserForm.lastName || '',
            department: newUserForm.department,
            role: newUserForm.role,
            isLocked: false,
        };

        setUsers(prev => [newUser, ...prev]);
        toast.success('System user added successfully');
        setIsAddUserModalOpen(false);
        setNewUserForm({
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            department: 'Engineering & IT',
            role: 'employee',
            password: ''
        });
    };

    const handleCreateBackup = async () => {
        try {
            setIsBackingUp(true);
            const newBackup = await BackupService.createBackup();
            setBackups(prev => [newBackup, ...prev]);
            toast.success('System state snapshot created');
        } catch {
            toast.error('Snapshot operation failed');
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleDeleteBackup = async (filename: string) => {
        if (!confirm('Are you sure you want to delete this backup snapshot?')) return;
        try {
            await BackupService.deleteBackup(filename);
            setBackups(prev => prev.filter(b => b.filename !== filename));
            toast.success('Snapshot deleted');
        } catch {
            toast.error('Failed to delete snapshot');
        }
    };

    const handleRestoreBackup = async (filename: string) => {
        if (!confirm('WARNING: Restoring will overwrite current system state. Proceed with caution?')) return;
        try {
            toast.loading('Synchronizing system state...', { id: 'restore' });
            await BackupService.restoreBackup(filename);
            toast.success('System state restored successfully', { id: 'restore' });
            setTimeout(() => window.location.reload(), 1500);
        } catch {
            toast.error('Restoration protocol failed', { id: 'restore' });
        }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        toast.loading('Acquiring GPS coordinates...', { id: 'geo-sync' });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setSettings({
                    ...settings,
                    office_latitude: parseFloat(position.coords.latitude.toFixed(6)),
                    office_longitude: parseFloat(position.coords.longitude.toFixed(6))
                });
                toast.success('Coordinates synchronized', { id: 'geo-sync' });
            },
            (error) => {
                toast.error(`Geolocation error: ${error.message}`, { id: 'geo-sync' });
            },
            { enableHighAccuracy: true }
        );
    };

    const tabs: { id: TabType; label: string; icon: any; description: string }[] = [
        { id: 'roles', label: 'Users & Roles Access', icon: ShieldCheck, description: 'Role matrix & operator access' },
        { id: 'general', label: 'Company Profile', icon: Building2, description: 'Organization identity & domain' },
        { id: 'attendance', label: 'Work Hours & Geofence', icon: Clock, description: 'Office shifts & coordinates' },
        { id: 'system', label: 'Diagnostics & Telemetry', icon: Cpu, description: 'Health, latency & clusters' },
        { id: 'backup', label: 'Backup & Recovery', icon: Database, description: 'State snapshots & restore' },
    ];

    // Filtered users list for Roles tab
    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.username || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            (`${user.firstName || ''} ${user.lastName || ''}`).toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            (user.department || '').toLowerCase().includes(userSearchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[400px] gap-3">
                <div className="w-9 h-9 border-3 border-slate-300 border-t-black rounded-full animate-spin" />
                <p className="text-xs font-bold text-black">Loading system configuration...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 pb-12 font-sans">
            {/* Top Header Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-slate-100 text-black border border-slate-200">
                            <Settings size={20} />
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                            System Settings & Governance
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-black mt-1">
                        Manage corporate access roles, work shifts, geofence radius, and system backups.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        {isSaving ? (
                            <>
                                <RotateCcw className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-2 space-y-1 shadow-xs sticky top-20">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left cursor-pointer ${
                                        isActive
                                            ? 'bg-black text-white shadow-xs'
                                            : 'text-black hover:bg-slate-100 hover:text-black'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg transition-colors ${
                                        isActive ? 'bg-slate-800 text-white' : 'bg-slate-100 text-black'
                                    }`}>
                                        <IconComponent className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className={`text-xs sm:text-sm font-bold truncate ${isActive ? 'text-white' : 'text-black'}`}>
                                            {tab.label}
                                        </div>
                                        <div className={`text-[11px] font-medium truncate ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {tab.description}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-8 xl:col-span-9 w-full">
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                                className="w-full space-y-6"
                            >
                                {/* ==================== USERS & ROLES TAB ==================== */}
                                {activeTab === 'roles' && (
                                    <div className="space-y-8 w-full">
                                        {/* Tab Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-slate-100 text-black rounded-xl border border-slate-200">
                                                    <ShieldCheck className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-base font-black text-black">Users & Access Roles Matrix</h2>
                                                    <p className="text-xs font-semibold text-slate-700">Configure permission tiers, operator authority, and staff account roles</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsAddUserModalOpen(true)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                                            >
                                                <UserPlus size={14} />
                                                <span>Add System User</span>
                                            </button>
                                        </div>

                                        {/* Role Tier Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Admin Card */}
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="px-2.5 py-1 rounded-md bg-black text-white text-[11px] font-black uppercase tracking-wider">
                                                        Administrator
                                                    </span>
                                                    <span className="text-xs font-black text-black font-mono">
                                                        {users.filter(u => u.role === 'admin').length} Users
                                                    </span>
                                                </div>
                                                <p className="text-xs font-medium text-black">
                                                    Full unrestricted system authority: biometric enrolment, system settings, database backups, and access governance.
                                                </p>
                                            </div>

                                            {/* Manager Card */}
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="px-2.5 py-1 rounded-md bg-slate-200 text-black text-[11px] font-black uppercase tracking-wider">
                                                        Manager
                                                    </span>
                                                    <span className="text-xs font-black text-black font-mono">
                                                        {users.filter(u => u.role === 'manager').length} Users
                                                    </span>
                                                </div>
                                                <p className="text-xs font-medium text-black">
                                                    Department workforce governance: live attendance monitoring, shift planning, leave & overtime sign-off.
                                                </p>
                                            </div>

                                            {/* Employee Card */}
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-black border border-slate-200 text-[11px] font-black uppercase tracking-wider">
                                                        Employee
                                                    </span>
                                                    <span className="text-xs font-black text-black font-mono">
                                                        {users.filter(u => u.role === 'employee').length} Users
                                                    </span>
                                                </div>
                                                <p className="text-xs font-medium text-black">
                                                    Staff self-service access: facial biometric check-in/out, leave applications, and overtime submissions.
                                                </p>
                                            </div>
                                        </div>

                                        {/* System Users Table Section */}
                                        <div className="space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <h3 className="text-sm font-black text-black">Active System Operators & Staff Users</h3>
                                                    <p className="text-xs font-medium text-slate-700">Assign permission clearance to staff accounts</p>
                                                </div>

                                                {/* Search & Role Filters */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="relative">
                                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search user or email..."
                                                            value={userSearchTerm}
                                                            onChange={(e) => setUserSearchTerm(e.target.value)}
                                                            className="w-44 sm:w-56 pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-black placeholder:text-slate-400 outline-none focus:bg-white focus:border-black transition-colors"
                                                        />
                                                    </div>

                                                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                                                        {(['all', 'admin', 'manager', 'employee'] as const).map(role => (
                                                            <button
                                                                key={role}
                                                                onClick={() => setRoleFilter(role)}
                                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                                                                    roleFilter === role
                                                                        ? 'bg-black text-white shadow-xs'
                                                                        : 'text-black hover:bg-slate-200'
                                                                }`}
                                                            >
                                                                {role}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Table */}
                                            <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-xs">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-black text-black uppercase tracking-wider">
                                                            <th className="py-3 px-4">Operator Name</th>
                                                            <th className="py-3 px-4">Department</th>
                                                            <th className="py-3 px-4">Account ID</th>
                                                            <th className="py-3 px-4 text-right">Role Clearance</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 text-xs">
                                                        {filteredUsers.length > 0 ? (
                                                            filteredUsers.map(user => (
                                                                <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                                                                    <td className="py-3 px-4">
                                                                        <div className="flex items-center gap-2.5">
                                                                            <div className="w-7 h-7 rounded-lg bg-black text-white font-bold flex items-center justify-center text-xs shrink-0">
                                                                                {(user.firstName?.[0] || user.username[0] || 'U').toUpperCase()}
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-bold text-black text-sm">
                                                                                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}
                                                                                </div>
                                                                                <div className="text-[11px] font-semibold text-black font-mono">
                                                                                    {user.email}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 px-4">
                                                                        <span className="font-semibold text-black">
                                                                            {user.department || 'Engineering & IT'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-black">
                                                                        {user._id}
                                                                    </td>
                                                                    <td className="py-3 px-4 text-right">
                                                                        <div className="inline-flex gap-1">
                                                                            {['admin', 'manager', 'employee'].map(role => {
                                                                                const isSelected = user.role === role;
                                                                                return (
                                                                                    <button
                                                                                        key={role}
                                                                                        onClick={() => handleUpdateUserRole(user._id, role)}
                                                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                                                                                            isSelected
                                                                                                ? 'bg-black text-white shadow-xs'
                                                                                                : 'bg-slate-100 text-black hover:bg-slate-200 border border-slate-200'
                                                                                        }`}
                                                                                    >
                                                                                        {role}
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={4} className="py-8 text-center text-black font-bold text-xs">
                                                                    No operators match the selected filter criteria.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Permission Matrix Table */}
                                        <div className="space-y-4 pt-4 border-t border-slate-200">
                                            <div>
                                                <h3 className="text-sm font-black text-black">Role Capabilities & Permission Matrix</h3>
                                                <p className="text-xs font-medium text-slate-700">Detailed system breakdown of permissions per role level</p>
                                            </div>

                                            <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-xs">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-black text-black uppercase tracking-wider">
                                                            <th className="py-3 px-4">System Module & Capability</th>
                                                            <th className="py-3 px-4 text-center w-28">Admin</th>
                                                            <th className="py-3 px-4 text-center w-28">Manager</th>
                                                            <th className="py-3 px-4 text-center w-32">Employee</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 text-xs">
                                                        {ROLE_PERMISSIONS_MATRIX.map((row, idx) => (
                                                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                                                <td className="py-3 px-4">
                                                                    <div className="font-bold text-black text-xs sm:text-sm">{row.module}</div>
                                                                    <div className="text-[11px] font-medium text-slate-700">{row.description}</div>
                                                                </td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                                                        <Check size={14} />
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4 text-center">
                                                                    {row.manager ? (
                                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                                                            <Check size={14} />
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 font-bold">
                                                                            <X size={14} />
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="py-3 px-4 text-center">
                                                                    {typeof row.employee === 'string' ? (
                                                                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-black border border-slate-200 text-[10px] font-bold">
                                                                            {row.employee}
                                                                        </span>
                                                                    ) : row.employee ? (
                                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                                                            <Check size={14} />
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 font-bold">
                                                                            <X size={14} />
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ==================== GENERAL TAB ==================== */}
                                {activeTab === 'general' && (
                                    <div className="space-y-6 w-full">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                                            <div className="p-2.5 bg-slate-100 text-black rounded-xl border border-slate-200">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-black text-black">Company Identity & Organization</h2>
                                                <p className="text-xs font-semibold text-slate-700">Corporate branding, domain credentials, and system identity</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-black">Company / Organization Name *</label>
                                                <input
                                                    type="text"
                                                    value={settings.organization_name}
                                                    onChange={(e) => setSettings({ ...settings, organization_name: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-black">Domain Host Alias *</label>
                                                <input
                                                    type="text"
                                                    value={settings.domain}
                                                    onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ==================== ATTENDANCE TAB ==================== */}
                                {activeTab === 'attendance' && (
                                    <div className="space-y-6 w-full">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                                            <div className="p-2.5 bg-slate-100 text-black rounded-xl border border-slate-200">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-black text-black">Work Schedules & Office Geofence</h2>
                                                <p className="text-xs font-semibold text-slate-700">Shift arrival/departure times, grace threshold, and GPS boundaries</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-black">Workday Shift Start Time</label>
                                                <input
                                                    type="time"
                                                    value={settings.work_start_time}
                                                    onChange={(e) => setSettings({ ...settings, work_start_time: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-black">Workday Shift End Time</label>
                                                <input
                                                    type="time"
                                                    value={settings.work_end_time}
                                                    onChange={(e) => setSettings({ ...settings, work_end_time: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-xs sm:text-sm font-bold text-black">Late Arrival Grace Window</div>
                                                    <div className="text-xs font-medium text-slate-700 mt-0.5">Tolerance minutes allowed after start time before marked as late</div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-black text-black font-mono w-10 text-right">{settings.grace_period_minutes}m</span>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="60"
                                                        value={settings.grace_period_minutes}
                                                        onChange={(e) => setSettings({ ...settings, grace_period_minutes: parseInt(e.target.value) || 0 })}
                                                        className="w-36 sm:w-44 accent-black h-1.5 bg-slate-200 rounded-full cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Geofence Rules */}
                                        <div className="pt-2 space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-black" />
                                                    <h3 className="text-xs sm:text-sm font-black text-black">Corporate Office Coordinates & Radius</h3>
                                                </div>
                                                <button
                                                    onClick={handleGetCurrentLocation}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white hover:bg-slate-800 transition-all text-xs font-bold self-start sm:self-auto cursor-pointer"
                                                >
                                                    <MapPin size={12} />
                                                    Sync GPS Location
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-black">Latitude</label>
                                                    <input
                                                        type="number"
                                                        step="0.000001"
                                                        value={settings.office_latitude}
                                                        onChange={(e) => setSettings({ ...settings, office_latitude: parseFloat(e.target.value) || 0 })}
                                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-black">Longitude</label>
                                                    <input
                                                        type="number"
                                                        step="0.000001"
                                                        value={settings.office_longitude}
                                                        onChange={(e) => setSettings({ ...settings, office_longitude: parseFloat(e.target.value) || 0 })}
                                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ==================== SYSTEM DIAGNOSTICS TAB ==================== */}
                                {activeTab === 'system' && (
                                    <div className="space-y-6 w-full">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                                            <div className="p-2.5 bg-slate-100 text-black rounded-xl border border-slate-200">
                                                <Cpu className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-black text-black">System Diagnostics & Health</h2>
                                                <p className="text-xs font-semibold text-slate-700">Cluster node telemetry, socket connections, and database health</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                                                <p className="text-xs font-bold text-black uppercase tracking-wider">Ping Latency</p>
                                                <p className="text-2xl font-black text-black font-mono">{latency}</p>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-bold text-emerald-800">Operational</span>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                                                <p className="text-xs font-bold text-black uppercase tracking-wider">Database Storage</p>
                                                <p className="text-2xl font-black text-black font-mono">{systemStats?.databaseSize || '14.2 MB'}</p>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-bold text-emerald-800">Optimal</span>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                                                <p className="text-xs font-bold text-black uppercase tracking-wider">Active Service Nodes</p>
                                                <p className="text-2xl font-black text-black font-mono">1 Cluster</p>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-bold text-emerald-800">Online</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ==================== BACKUP TAB ==================== */}
                                {activeTab === 'backup' && (
                                    <div className="space-y-6 w-full">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-slate-100 text-black rounded-xl border border-slate-200">
                                                    <Database className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-base font-black text-black">Database Snapshots & State Recovery</h2>
                                                    <p className="text-xs font-semibold text-slate-700">Create snapshots and restore database state</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleCreateBackup}
                                                disabled={isBackingUp}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                                            >
                                                <Database className="w-3.5 h-3.5" />
                                                <span>{isBackingUp ? 'Creating...' : 'Create Snapshot'}</span>
                                            </button>
                                        </div>

                                        <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-xs">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-black text-black uppercase tracking-wider">
                                                        <th className="py-3 px-4">Snapshot File</th>
                                                        <th className="py-3 px-4">Created Timestamp</th>
                                                        <th className="py-3 px-4">File Size</th>
                                                        <th className="py-3 px-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-xs font-medium text-black">
                                                    {backups.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-4 py-8 text-center text-black font-bold">No snapshot archives recorded yet</td>
                                                        </tr>
                                                    ) : (
                                                        backups.map(backup => (
                                                            <tr key={backup.filename} className="hover:bg-slate-50/80 transition-colors">
                                                                <td className="px-4 py-3 font-mono font-bold text-black">
                                                                    {backup.filename}
                                                                </td>
                                                                <td className="px-4 py-3 text-black font-semibold">
                                                                    {new Date(backup.createdAt).toLocaleString()}
                                                                </td>
                                                                <td className="px-4 py-3 font-mono font-bold text-black">
                                                                    {(backup.size / (1024 * 1024)).toFixed(2)} MB
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <div className="inline-flex gap-1.5">
                                                                        <button
                                                                            onClick={() => BackupService.downloadBackup(backup.filename)}
                                                                            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                                                                            title="Download Snapshot"
                                                                        >
                                                                            <Download className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRestoreBackup(backup.filename)}
                                                                            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                                                                            title="Restore State"
                                                                        >
                                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteBackup(backup.filename)}
                                                                            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-rose-700 hover:bg-rose-700 hover:text-white transition-colors cursor-pointer"
                                                                            title="Delete Snapshot"
                                                                        >
                                                                            <Lock className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ==================== ADD SYSTEM USER MODAL ==================== */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                            <div>
                                <h3 className="text-base font-black text-black">Add New System Operator</h3>
                                <p className="text-xs font-semibold text-slate-700">Create an operator login with specific role clearance</p>
                            </div>
                            <button
                                onClick={() => setIsAddUserModalOpen(false)}
                                className="p-2 rounded-xl text-black hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-black">First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUserForm.firstName}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                                        placeholder="e.g. Alex"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-black">Last Name</label>
                                    <input
                                        type="text"
                                        value={newUserForm.lastName}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                                        placeholder="e.g. Vannak"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-black">Username *</label>
                                <input
                                    type="text"
                                    required
                                    value={newUserForm.username}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                                    placeholder="e.g. alex.hr"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-black">Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={newUserForm.email}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                    placeholder="e.g. alex.v@staffflow.io"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-black">Department</label>
                                    <CustomDropdown
                                        value={newUserForm.department}
                                        onChange={(val) => setNewUserForm({ ...newUserForm, department: val })}
                                        options={[
                                            { value: 'Engineering & IT', label: 'Engineering & IT' },
                                            { value: 'Product & Design', label: 'Product & Design' },
                                            { value: 'Human Resources', label: 'Human Resources' },
                                            { value: 'Operations & Facilities', label: 'Operations & Facilities' },
                                        ]}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-black">Role Clearance</label>
                                    <CustomDropdown
                                        value={newUserForm.role}
                                        onChange={(val) => setNewUserForm({ ...newUserForm, role: val })}
                                        options={[
                                            { value: 'admin', label: 'Administrator' },
                                            { value: 'manager', label: 'Manager' },
                                            { value: 'employee', label: 'Employee' },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsAddUserModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                    Add Operator
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
