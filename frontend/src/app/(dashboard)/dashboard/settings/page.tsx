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
    MapPin,
    Check
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
        organization_name: 'CAMBODIA ACADEMIC CAMPUS',
        domain: 'attendance.edu.kh',
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
                }

                if (usersData.status === 'fulfilled') {
                    setUsers(usersData.value);
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
            toast.success('Settings saved successfully');
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
            toast.success('Archive deleted from storage');
        } catch (err) {
            toast.error('Failed to delete archive');
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

    const tabs: { id: TabType; label: string; icon: any; description: string }[] = [
        { id: 'general', label: 'Organization & Campus', icon: Globe, description: 'Identity & domain' },
        { id: 'attendance', label: 'Class & Work Hours', icon: Clock, description: 'Schedules & geofence' },
        { id: 'personnel', label: 'Access Clearance', icon: Users, description: 'Role clearance matrix' },
        { id: 'security', label: 'Security & API Keys', icon: Shield, description: 'Master tokens & logs' },
        { id: 'system', label: 'Diagnostics & Telemetry', icon: Cpu, description: 'Server nodes & memory' },
        { id: 'backup', label: 'Backup & Recovery', icon: Database, description: 'State snapshots' },
    ];

    const handleRotateKey = async () => {
        if (!confirm('WARNING: Rotating the Master API Key will invalidate all existing integrations. Continue?')) return;
        try {
            setIsRotating(true);
            const data = await SettingsService.rotateApiKey();
            setSettings(prev => ({ ...prev, master_api_key: data.master_api_key }));
            toast.success('API Key rotated successfully');
        } catch (err) {
            toast.error('Failed to rotate API Key');
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
            <RotateCcw className="w-7 h-7 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs font-medium">Loading settings...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Settings size={24} className="text-blue-600" />
                        <span>System Configuration & Preferences</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Manage organizational identity, work schedules, geofence radius, and access governance.
                    </p>
                </div>
                <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs active:scale-95 disabled:opacity-50"
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
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-2 space-y-1 shadow-xs">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left group ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <div className={`p-1.5 rounded-lg transition-colors ${
                                        isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-slate-800'
                                    }`}>
                                        <IconComponent className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className={`text-xs sm:text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                                            {tab.label}
                                        </div>
                                        <div className={`text-[11px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
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
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-xs">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.15 }}
                            >
                                {/* General Tab */}
                                {activeTab === 'general' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-bold text-slate-900">Organizational Profile</h2>
                                                <p className="text-xs text-slate-400">Campus name, domain credentials, and public identifiers</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-700">Campus / Organization Name</label>
                                                <input
                                                    type="text"
                                                    value={settings.organization_name}
                                                    onChange={(e) => setSettings({ ...settings, organization_name: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-700">Domain Alias</label>
                                                <input
                                                    type="text"
                                                    value={settings.domain}
                                                    onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Attendance & Schedule Tab */}
                                {activeTab === 'attendance' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-bold text-slate-900">Class & Work Schedules</h2>
                                                <p className="text-xs text-slate-400">Default arrival, departure thresholds, and grace period tolerance</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-700">Class Start Time</label>
                                                <input
                                                    type="time"
                                                    value={settings.work_start_time}
                                                    onChange={(e) => setSettings({ ...settings, work_start_time: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-emerald-500 transition-colors font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-700">Class End Time</label>
                                                <input
                                                    type="time"
                                                    value={settings.work_end_time}
                                                    onChange={(e) => setSettings({ ...settings, work_end_time: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-emerald-500 transition-colors font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-xs sm:text-sm font-bold text-slate-900">Late Arrival Grace Window</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">Tolerance minutes allowed after start time before marked late</div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-bold text-emerald-600 font-mono w-10 text-right">{settings.grace_period_minutes}m</span>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="60"
                                                        value={settings.grace_period_minutes}
                                                        onChange={(e) => setSettings({ ...settings, grace_period_minutes: parseInt(e.target.value) || 0 })}
                                                        className="w-36 sm:w-44 accent-emerald-600 h-1.5 bg-slate-200 rounded-full cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Geofence Rules */}
                                        <div className="pt-2 space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">Campus Coordinates & Geofencing</h3>
                                                </div>
                                                <button
                                                    onClick={handleGetCurrentLocation}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all text-xs font-semibold self-start sm:self-auto"
                                                >
                                                    <MapPin size={12} />
                                                    Sync GPS Location
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-700">Latitude</label>
                                                    <input
                                                        type="number"
                                                        step="0.000001"
                                                        value={settings.office_latitude}
                                                        onChange={(e) => setSettings({ ...settings, office_latitude: parseFloat(e.target.value) || 0 })}
                                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500 transition-colors font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-700">Longitude</label>
                                                    <input
                                                        type="number"
                                                        step="0.000001"
                                                        value={settings.office_longitude}
                                                        onChange={(e) => setSettings({ ...settings, office_longitude: parseFloat(e.target.value) || 0 })}
                                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500 transition-colors font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Personnel Clearance Tab */}
                                {activeTab === 'personnel' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-bold text-slate-900">Access Clearance Matrix</h2>
                                                <p className="text-xs text-slate-400">Configure permission tiers for system operators</p>
                                            </div>
                                        </div>

                                        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                        <th className="px-4 py-3">Operator</th>
                                                        <th className="px-4 py-3">User ID</th>
                                                        <th className="px-4 py-3 text-right">Clearance Level</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                                    {users.map(user => (
                                                        <tr key={user._id} className="hover:bg-slate-50/70 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <div className="font-bold text-slate-900">{user.username}</div>
                                                                <div className="text-xs text-slate-400 font-mono">{user.email}</div>
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-xs text-slate-400">
                                                                {user._id?.substring(0, 12)}...
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <div className="inline-flex gap-1.5">
                                                                    {['admin', 'manager', 'employee'].map(role => (
                                                                        <button
                                                                            key={role}
                                                                            onClick={() => handleUpdateUserRole(user._id, role)}
                                                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                                                                                user.role === role
                                                                                    ? 'bg-blue-600 text-white shadow-xs'
                                                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                            }`}
                                                                        >
                                                                            {role}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Security & API Tab */}
                                {activeTab === 'security' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-bold text-slate-900">Security & Integration Keys</h2>
                                                <p className="text-xs text-slate-400">Master access keys and system audit export</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-700">Master Integration API Key</label>
                                                <div className="relative">
                                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                        <Key className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        type={showApiKey ? 'text' : 'password'}
                                                        value={settings.master_api_key || 'Loading API key...'}
                                                        readOnly
                                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm font-mono text-blue-600 outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowApiKey(!showApiKey)}
                                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                                                    >
                                                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                                <button
                                                    onClick={handleRotateKey}
                                                    disabled={isRotating}
                                                    className="inline-flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-all disabled:opacity-50"
                                                >
                                                    <RotateCcw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
                                                    <span>{isRotating ? 'Rotating Key...' : 'Rotate API Key'}</span>
                                                </button>
                                                <button
                                                    onClick={handleExportLog}
                                                    disabled={isExporting}
                                                    className="inline-flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-emerald-600 hover:bg-slate-100 transition-all disabled:opacity-50"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>{isExporting ? 'Exporting...' : 'Export Audit Logs'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* System Diagnostics Tab */}
                                {activeTab === 'system' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                                <Cpu className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-bold text-slate-900">System Diagnostics & Health</h2>
                                                <p className="text-xs text-slate-400">Node latency, memory usage, and cluster status</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ping Latency</p>
                                                <p className="text-2xl font-bold text-slate-900 font-mono">{latency}</p>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-semibold text-emerald-600">Optimal</span>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Storage State</p>
                                                <p className="text-2xl font-bold text-slate-900 font-mono">{systemStats?.storage || 'Healthy'}</p>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-semibold text-emerald-600">Active</span>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nodes</p>
                                                <p className="text-2xl font-bold text-slate-900 font-mono">{systemStats?.active_nodes?.toString() || '1'}</p>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-semibold text-emerald-600">Online</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Backup & Recovery Tab */}
                                {activeTab === 'backup' && (
                                    <div className="space-y-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                                    <Database className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-base font-bold text-slate-900">Database Snapshots & Recovery</h2>
                                                    <p className="text-xs text-slate-400">Create snapshots and restore database state</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleCreateBackup}
                                                disabled={isBackingUp}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-xs disabled:opacity-50"
                                            >
                                                <Database className="w-3.5 h-3.5" />
                                                <span>{isBackingUp ? 'Creating...' : 'Create Snapshot'}</span>
                                            </button>
                                        </div>

                                        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                        <th className="px-4 py-3">Archive Name</th>
                                                        <th className="px-4 py-3">Created Date</th>
                                                        <th className="px-4 py-3">Size</th>
                                                        <th className="px-4 py-3 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                                    {backups.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No backup snapshots recorded</td>
                                                        </tr>
                                                    ) : (
                                                        backups.map(backup => (
                                                            <tr key={backup.filename} className="hover:bg-slate-50/70 transition-colors">
                                                                <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800">
                                                                    {backup.filename}
                                                                </td>
                                                                <td className="px-4 py-3 text-xs text-slate-500">
                                                                    {new Date(backup.createdAt).toLocaleString()}
                                                                </td>
                                                                <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                                                                    {(backup.size / (1024 * 1024)).toFixed(2)} MB
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <div className="inline-flex gap-1.5">
                                                                        <button
                                                                            onClick={() => BackupService.downloadBackup(backup.filename)}
                                                                            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                                            title="Download"
                                                                        >
                                                                            <Download className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRestoreBackup(backup.filename)}
                                                                            className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                                                            title="Restore"
                                                                        >
                                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteBackup(backup.filename)}
                                                                            className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors"
                                                                            title="Delete"
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
        </div>
    );
}
