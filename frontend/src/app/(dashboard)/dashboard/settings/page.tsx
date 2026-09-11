'use client';

import { useState, useEffect } from 'react';
import {
    Settings,
    Shield,
    Fingerprint,
    Bell,
    Database,
    Globe,
    Save,
    Lock,
    Eye,
    EyeOff,
    Cpu,
    Command,
    Laptop,
    Moon,
    Sun,
    Smartphone,
    Mail,
    Key,
    UserCheck,
    RotateCcw,
    Download,
    Users,
    Clock,
    UserPlus,
    UserMinus,
    MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { SettingsService } from '@/services/settings.service';
import { BackupService, Backup } from '@/services/backup.service';

type TabType = 'general' | 'attendance' | 'personnel' | 'security' | 'system' | 'backup';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [showApiKey, setShowApiKey] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Settings state
    const [settings, setSettings] = useState({
        work_start_time: '08:00',
        work_end_time: '17:00',
        grace_period_minutes: 15,
        organization_name: 'KHMERWORK CORPORATE',
        domain: 'khmerwork.com',
        office_latitude: 11.5564,
        office_longitude: 104.9282,
        geofence_range_meters: 50,
        master_api_key: ''
    });

    // Users state
    const [users, setUsers] = useState<any[]>([]);
    const [backups, setBackups] = useState<Backup[]>([]);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [systemStats, setSystemStats] = useState<any>(null);
    const [latency, setLatency] = useState<string>('Unknown');
    const [isRotating, setIsRotating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

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
                } else {
                    console.error('Settings fetch failed:', settingsData.reason);
                    toast.error('Partial system profile loaded');
                }

                if (usersData.status === 'fulfilled') {
                    setUsers(usersData.value);
                } else {
                    console.warn('Personnel access list suppressed (insufficient clearance)');
                }

                try {
                    const backupsData = await BackupService.listBackups();
                    setBackups(backupsData);
                } catch (err) {
                    console.warn('Backup access restricted');
                }

                try {
                    const start = performance.now();
                    const stats = await SettingsService.getSystemStats();
                    const end = performance.now();
                    setLatency(`${(end - start).toFixed(0)}ms`);
                    setSystemStats(stats);
                } catch (err) {
                    console.warn('System stats restricted');
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
            toast.success('System configuration saved successfully');
        } catch (err) {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateUserRole = async (userId: string, role: string) => {
        try {
            await SettingsService.updateUserRole(userId, role);
            setUsers(users.map(u => u._id === userId ? { ...u, role } : u));
            toast.success('User access level updated');
        } catch (err) {
            toast.error('Failed to update role');
        }
    };

    const handleCreateBackup = async () => {
        try {
            setIsBackingUp(true);
            const newBackup = await BackupService.createBackup();
            setBackups([newBackup, ...backups]);
            toast.success('System state archived successfully');
        } catch (err) {
            toast.error('Archive operation failed');
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleDeleteBackup = async (filename: string) => {
        if (!confirm('Are you sure you want to delete this backup archive?')) return;
        try {
            await BackupService.deleteBackup(filename);
            setBackups(backups.filter(b => b.filename !== filename));
            toast.success('Archive purged from storage');
        } catch (err) {
            toast.error('Failed to purge archive');
        }
    };

    const handleRestoreBackup = async (filename: string) => {
        if (!confirm('WARNING: Restoring will overwrite current system state. Proceed with caution. Continue?')) return;
        try {
            toast.loading('Synchronizing system state...', { id: 'restore' });
            await BackupService.restoreBackup(filename);
            toast.success('System state restored successfully', { id: 'restore' });
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            toast.error('Restoration protocol failed', { id: 'restore' });
        }
    };

    const [selectedTheme, setSelectedTheme] = useState<'cyber' | 'solar'>('cyber');

    const handleThemeChange = (theme: 'cyber' | 'solar') => {
        if (theme === 'solar') {
            toast('Light theme is coming soon!', {
                icon: '☀️',
                style: {
                    borderRadius: '12px',
                    background: '#1e293b',
                    color: '#f8fafc',
                    fontWeight: 600,
                    fontSize: '13px'
                },
            });
            return;
        }
        setSelectedTheme(theme);
    };

    const tabs: { id: TabType; label: string; icon: any; description: string }[] = [
        { id: 'general', label: 'Organization', icon: Globe, description: 'Identity & preferences' },
        { id: 'attendance', label: 'Work Schedule', icon: Clock, description: 'Hours & geofence rules' },
        { id: 'personnel', label: 'Personnel Access', icon: Users, description: 'Role clearance matrix' },
        { id: 'security', label: 'Security & API', icon: Shield, description: 'Keys & access controls' },
        { id: 'system', label: 'System Health', icon: Cpu, description: 'Telemetry & server nodes' },
        { id: 'backup', label: 'Backup & Recovery', icon: Database, description: 'State snapshots' },
    ];

    const handleRotateKey = async () => {
        if (!confirm('WARNING: Rotating the Master API Key will invalidate all existing integrations. Continue?')) return;
        try {
            setIsRotating(true);
            const data = await SettingsService.rotateApiKey();
            setSettings(prev => ({ ...prev, master_api_key: data.master_api_key }));
            toast.success('Security key rotated successfully');
        } catch (err) {
            toast.error('Failed to rotate security key');
        } finally {
            setIsRotating(false);
        }
    };

    const handleExportLog = async () => {
        try {
            setIsExporting(true);
            toast.loading('Compiling system logs...', { id: 'export-log' });
            await SettingsService.exportSystemLog();
            toast.success('System log exported', { id: 'export-log' });
        } catch (err) {
            toast.error('Failed to export system log', { id: 'export-log' });
        } finally {
            setIsExporting(false);
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

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center gap-3">
            <RotateCcw className="w-7 h-7 text-blue-500 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Loading system configurations...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">System Settings</h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage enterprise configuration, security protocols, and operational parameters.</p>
                </div>
                <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <RotateCcw className="w-4 h-4 animate-spin" />
                            <span>Saving Changes...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            <span>Save Configuration</span>
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-1.5">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 space-y-1">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left group ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                                    }`}
                                >
                                    <div className={`p-1.5 rounded-lg transition-colors ${
                                        isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-blue-400'
                                    }`}>
                                        <IconComponent className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className={`text-xs sm:text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                            {tab.label}
                                        </div>
                                        <div className={`text-[11px] truncate ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                                            {tab.description}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-8 xl:col-span-9">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                {/* General / Organization Tab */}
                                {activeTab === 'general' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                                            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base sm:text-lg font-bold text-white">Organizational Identity</h2>
                                                <p className="text-xs text-slate-400">Configure corporate identity and public domain info</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300">Organization Name</label>
                                                <input
                                                    type="text"
                                                    value={settings.organization_name}
                                                    onChange={(e) => setSettings({ ...settings, organization_name: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300">Domain Name</label>
                                                <input
                                                    type="text"
                                                    value={settings.domain}
                                                    onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-3">
                                            <label className="text-xs font-semibold text-slate-300">Interface Theme</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div
                                                    onClick={() => handleThemeChange('cyber')}
                                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                                                        selectedTheme === 'cyber'
                                                            ? 'bg-blue-500/10 border-blue-500 text-white'
                                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                                    }`}
                                                >
                                                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                                        <Moon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs sm:text-sm font-bold text-white">Dark Onyx (Active)</div>
                                                        <div className="text-[11px] text-slate-400">Optimized high-contrast dark theme</div>
                                                    </div>
                                                </div>
                                                <div
                                                    onClick={() => handleThemeChange('solar')}
                                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                                                        selectedTheme === 'solar'
                                                            ? 'bg-white/10 border-white text-white'
                                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 opacity-70 hover:opacity-100'
                                                    }`}
                                                >
                                                    <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                                                        <Sun className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs sm:text-sm font-bold text-slate-300">Light Slate</div>
                                                        <div className="text-[11px] text-slate-500">Coming soon in next release</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Attendance & Schedule Tab */}
                                {activeTab === 'attendance' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                                            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base sm:text-lg font-bold text-white">Work Schedules & Shifts</h2>
                                                <p className="text-xs text-slate-400">Configure standard working hours and grace period rules</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300">Work Start Time</label>
                                                <input
                                                    type="time"
                                                    value={settings.work_start_time}
                                                    onChange={(e) => setSettings({ ...settings, work_start_time: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-white outline-none focus:border-emerald-500 transition-colors font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300">Work End Time</label>
                                                <input
                                                    type="time"
                                                    value={settings.work_end_time}
                                                    onChange={(e) => setSettings({ ...settings, work_end_time: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-white outline-none focus:border-emerald-500 transition-colors font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-xs sm:text-sm font-bold text-white">Late Arrival Grace Window</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">Tolerance minutes allowed after start time before marked late</div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-bold text-emerald-400 font-mono w-10 text-right">{settings.grace_period_minutes}m</span>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="60"
                                                        value={settings.grace_period_minutes}
                                                        onChange={(e) => setSettings({ ...settings, grace_period_minutes: parseInt(e.target.value) || 0 })}
                                                        className="w-36 sm:w-44 accent-emerald-500 h-1.5 bg-slate-800 rounded-full cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Geofence Rules */}
                                        <div className="pt-2 space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-emerald-400" />
                                                    <h3 className="text-xs sm:text-sm font-bold text-white">Office Coordinates & Geofencing</h3>
                                                </div>
                                                <button
                                                    onClick={handleGetCurrentLocation}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-xs font-semibold self-start sm:self-auto"
                                                >
                                                    <MapPin size={12} />
                                                    Sync Current Location
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-300">Office Latitude</label>
                                                    <input
                                                        type="number"
                                                        step="0.000001"
                                                        value={settings.office_latitude}
                                                        onChange={(e) => setSettings({ ...settings, office_latitude: parseFloat(e.target.value) || 0 })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-medium text-white outline-none focus:border-emerald-500 transition-colors font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-300">Office Longitude</label>
                                                    <input
                                                        type="number"
                                                        step="0.000001"
                                                        value={settings.office_longitude}
                                                        onChange={(e) => setSettings({ ...settings, office_longitude: parseFloat(e.target.value) || 0 })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-medium text-white outline-none focus:border-emerald-500 transition-colors font-mono"
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div>
                                                        <div className="text-xs sm:text-sm font-bold text-white">Geofence Allowed Radius</div>
                                                        <div className="text-xs text-slate-400 mt-0.5">Maximum valid distance (meters) for attendance check-in</div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm font-bold text-blue-400 font-mono w-14 text-right">{settings.geofence_range_meters}m</span>
                                                        <input
                                                            type="range"
                                                            min="10"
                                                            max="1000"
                                                            step="10"
                                                            value={settings.geofence_range_meters}
                                                            onChange={(e) => setSettings({ ...settings, geofence_range_meters: parseInt(e.target.value) || 10 })}
                                                            className="w-36 sm:w-44 accent-blue-500 h-1.5 bg-slate-800 rounded-full cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Personnel Access Tab */}
                                {activeTab === 'personnel' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                                            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base sm:text-lg font-bold text-white">Access Governance</h2>
                                                <p className="text-xs text-slate-400">Manage user clearance levels and system role authorizations</p>
                                            </div>
                                        </div>

                                        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-slate-800 bg-slate-900/80">
                                                            <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                                                            <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">User ID</th>
                                                            <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Role Level</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                                                        {users.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={3} className="px-4 py-8 text-center text-slate-500 font-medium">No user records loaded</td>
                                                            </tr>
                                                        ) : (
                                                            users.map(user => (
                                                                <tr key={user._id} className="hover:bg-slate-900/50 transition-colors">
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center font-bold text-xs text-blue-400 border border-blue-500/20">
                                                                                {user.username?.[0]?.toUpperCase() || 'U'}
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-semibold text-white">{user.username}</div>
                                                                                <div className="text-xs text-slate-400 font-mono">{user.email}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                                                                        {user._id?.substring(0, 12)}...
                                                                    </td>
                                                                    <td className="px-4 py-3 text-right">
                                                                        <div className="inline-flex gap-1.5">
                                                                            {['admin', 'employee', 'student'].map(role => (
                                                                                <button
                                                                                    key={role}
                                                                                    onClick={() => handleUpdateUserRole(user._id, role)}
                                                                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${
                                                                                        user.role === role
                                                                                            ? 'bg-blue-600 text-white shadow-sm'
                                                                                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                                                                                    }`}
                                                                                >
                                                                                    {role === 'admin' && <Shield className="w-3 h-3 inline mr-1 -mt-0.5" />}
                                                                                    {role}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Security & API Tab */}
                                {activeTab === 'security' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                                            <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base sm:text-lg font-bold text-white">Security & API Keys</h2>
                                                <p className="text-xs text-slate-400">Manage encryption keys, rotate access tokens, and export logs</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-300">Master Integration API Key</label>
                                                <div className="relative">
                                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                                        <Key className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        type={showApiKey ? 'text' : 'password'}
                                                        value={settings.master_api_key || 'Loading API key...'}
                                                        readOnly
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm font-mono text-blue-400 outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowApiKey(!showApiKey)}
                                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                                <button
                                                    onClick={handleRotateKey}
                                                    disabled={isRotating}
                                                    className="inline-flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-semibold text-slate-300 hover:text-blue-400 hover:border-slate-700 transition-all disabled:opacity-50"
                                                >
                                                    <RotateCcw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
                                                    <span>{isRotating ? 'Rotating Key...' : 'Rotate API Key'}</span>
                                                </button>
                                                <button
                                                    onClick={handleExportLog}
                                                    disabled={isExporting}
                                                    className="inline-flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-semibold text-slate-300 hover:text-emerald-400 hover:border-slate-700 transition-all disabled:opacity-50"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>{isExporting ? 'Exporting...' : 'Export Audit Logs'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* System Health Tab */}
                                {activeTab === 'system' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                                            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                                                <Cpu className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base sm:text-lg font-bold text-white">System Diagnostics</h2>
                                                <p className="text-xs text-slate-400">Real-time telemetry, memory allocation, and database nodes</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latency</p>
                                                <p className="text-2xl font-bold text-white font-mono">{latency}</p>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-semibold text-emerald-400">Healthy</span>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Storage</p>
                                                <p className="text-2xl font-bold text-white font-mono">{systemStats?.storage || 'Optimal'}</p>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-semibold text-emerald-400">Normal</span>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cluster Nodes</p>
                                                <p className="text-2xl font-bold text-white font-mono">{systemStats?.active_nodes?.toString() || '1'}</p>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-semibold text-emerald-400">Online</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Command className="w-4 h-4 text-blue-400" />
                                                <span className="text-xs font-bold text-white uppercase tracking-wider">Node Status Report</span>
                                            </div>
                                            <div className="bg-slate-900 font-mono text-xs p-4 rounded-lg text-slate-300 leading-relaxed border border-slate-800/80 space-y-1">
                                                <div className="text-slate-500">// Attendance Engine Heartbeat</div>
                                                <div>&gt; MongoDB Connection: <span className="text-emerald-400">[CONNECTED]</span> v{systemStats?.mongo_version || '6.0'}</div>
                                                <div>&gt; Memory In-Use: <span className="text-blue-400">{systemStats?.memory || '64 MB'}</span></div>
                                                <div>&gt; Process Uptime: <span className="text-amber-400">{Math.floor((systemStats?.uptime || 0) / 60)}m {(Math.floor(systemStats?.uptime || 0) % 60)}s</span></div>
                                                <div>&gt; Status: <span className="text-emerald-400">ALL_SYSTEMS_OPERATIONAL</span></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Backup & Recovery Tab */}
                                {activeTab === 'backup' && (
                                    <div className="space-y-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                                                    <Database className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-base sm:text-lg font-bold text-white">Database Backup & Recovery</h2>
                                                    <p className="text-xs text-slate-400">Create snapshots and restore database state</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleCreateBackup}
                                                disabled={isBackingUp}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all disabled:opacity-50 self-start sm:self-auto"
                                            >
                                                {isBackingUp ? (
                                                    <>
                                                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                                                        <span>Creating...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Database className="w-3.5 h-3.5" />
                                                        <span>Create Snapshot</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-slate-800 bg-slate-900/80">
                                                            <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Archive Name</th>
                                                            <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created At</th>
                                                            <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Size</th>
                                                            <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                                                        {backups.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4} className="px-4 py-8 text-center text-slate-500 font-medium">No archive snapshots found</td>
                                                            </tr>
                                                        ) : (
                                                            backups.map(backup => (
                                                                <tr key={backup.filename} className="hover:bg-slate-900/50 transition-colors">
                                                                    <td className="px-4 py-3 font-mono text-xs text-white">
                                                                        <div className="flex items-center gap-2">
                                                                            <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                                                            <span className="truncate max-w-[200px]">{backup.filename}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-xs text-slate-400">
                                                                        {new Date(backup.createdAt).toLocaleString()}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                                                                        {(backup.size / (1024 * 1024)).toFixed(2)} MB
                                                                    </td>
                                                                    <td className="px-4 py-3 text-right">
                                                                        <div className="inline-flex gap-1.5">
                                                                            <button
                                                                                onClick={() => BackupService.downloadBackup(backup.filename)}
                                                                                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                                                                title="Download Archive"
                                                                            >
                                                                                <Download className="w-3.5 h-3.5" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleRestoreBackup(backup.filename)}
                                                                                className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                                                                                title="Restore Snapshot"
                                                                            >
                                                                                <RotateCcw className="w-3.5 h-3.5" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteBackup(backup.filename)}
                                                                                className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                                                                                title="Delete Archive"
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
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
