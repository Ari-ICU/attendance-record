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
    UserMinus
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
                // Fetch settings and users independently to prevent hard crash on permission issues
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
                    // We don't toast error here to keep the UI clean if they aren't an admin
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
            toast.success('System configuration synchronized');
        } catch (err) {
            toast.error('Failed to sync state');
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
            toast('Solar White mode is coming soon!', {
                icon: '☀️',
                style: {
                    borderRadius: '16px',
                    background: '#fff',
                    color: '#020617',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    textTransform: 'uppercase'
                },
            });
            return;
        }
        setSelectedTheme(theme);
    };

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'general', label: 'Organization', icon: Globe },
        { id: 'attendance', label: 'Work Schedule', icon: Clock },
        { id: 'personnel', label: 'Personnel Access', icon: Users },
        { id: 'security', label: 'Security Protocols', icon: Shield },
        { id: 'system', label: 'Environment', icon: Cpu },
        { id: 'backup', label: 'Backup & Recovery', icon: Database },
    ];


    const handleRotateKey = async () => {
        if (!confirm('WARNING: Rotating the Master API Key will invalidate all existing integrations. Continue?')) return;
        try {
            setIsRotating(true);
            const data = await SettingsService.rotateApiKey();
            setSettings(prev => ({ ...prev, master_api_key: data.master_api_key }));
            toast.success('Security seed rotated successfully');
        } catch (err) {
            toast.error('Failed to rotate security seed');
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


    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <RotateCcw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
    );


    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">System Control</h1>
                    <p className="text-slate-400 font-medium tracking-tight">Enterprise Configuration Console</p>
                </div>
                <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 text-white font-black text-sm tracking-[0.1em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 uppercase italic"
                >
                    {isSaving ? (
                        <>
                            <RotateCcw className="w-4 h-4 animate-spin" />
                            Syncing...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Sync State
                        </>
                    )}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-72 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300 group ${activeTab === tab.id
                                ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20'
                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="glass-pane p-8 rounded-[2.5rem] border border-white/10"
                        >
                            {activeTab === 'general' && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Operational Profile</h2>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Global Organizational Identity</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Entity Alias</label>
                                            <input
                                                type="text"
                                                value={settings.organization_name}
                                                onChange={(e) => setSettings({ ...settings, organization_name: e.target.value })}
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3.5 px-5 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Control Domain</label>
                                            <input
                                                type="text"
                                                value={settings.domain}
                                                onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3.5 px-5 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Visual Core Protocol</h3>
                                        <div className="flex gap-4">
                                            <div
                                                onClick={() => handleThemeChange('cyber')}
                                                className={`flex-1 p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 ${selectedTheme === 'cyber' ? 'bg-blue-600/10 border-blue-600 shadow-lg shadow-blue-500/10' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                                            >
                                                <Moon className={`w-6 h-6 ${selectedTheme === 'cyber' ? 'text-blue-400' : 'text-slate-500'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedTheme === 'cyber' ? 'text-white' : 'text-slate-500'}`}>Cyber Blue</span>
                                            </div>
                                            <div
                                                onClick={() => handleThemeChange('solar')}
                                                className={`flex-1 p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 ${selectedTheme === 'solar' ? 'bg-white/10 border-white/30' : 'bg-white/5 border-transparent hover:border-white/10 opacity-60 hover:opacity-100'}`}
                                            >
                                                <Sun className="w-6 h-6 text-slate-500" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Solar White</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'attendance' && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Attendance Parameters</h2>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Temporal Access Constraints</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Check-in Threshold</label>
                                            <div className="relative group/input">
                                                <input
                                                    type="time"
                                                    value={settings.work_start_time}
                                                    onChange={(e) => setSettings({ ...settings, work_start_time: e.target.value })}
                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-5 px-6 text-xl font-black text-white outline-none focus:border-emerald-500/50 transition-all font-mono tracking-widest"
                                                />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 uppercase text-[9px] font-black tracking-widest pointer-events-none group-hover/input:text-emerald-400 transition-colors italic">Arrival</div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Check-out Threshold</label>
                                            <div className="relative group/input">
                                                <input
                                                    type="time"
                                                    value={settings.work_end_time}
                                                    onChange={(e) => setSettings({ ...settings, work_end_time: e.target.value })}
                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-5 px-6 text-xl font-black text-white outline-none focus:border-emerald-500/50 transition-all font-mono tracking-widest"
                                                />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 uppercase text-[9px] font-black tracking-widest pointer-events-none group-hover/input:text-emerald-400 transition-colors italic">Departure</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-white uppercase tracking-tight italic">Temporal Grace Window</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Minutes allowed before marked as LATE</p>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className="text-lg font-black text-emerald-400 font-mono w-12 text-right">{settings.grace_period_minutes}m</span>
                                                <input
                                                    type="range"
                                                    min="0" max="60"
                                                    value={settings.grace_period_minutes}
                                                    onChange={(e) => setSettings({ ...settings, grace_period_minutes: parseInt(e.target.value) })}
                                                    className="w-48 accent-emerald-500 h-1 bg-slate-900 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-emerald-400" />
                                            <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Biometric Boundaries (Geofencing)</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Ref. Latitude</label>
                                                <input
                                                    type="number"
                                                    step="0.0001"
                                                    value={settings.office_latitude}
                                                    onChange={(e) => setSettings({ ...settings, office_latitude: parseFloat(e.target.value) })}
                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 px-5 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all font-mono"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Ref. Longitude</label>
                                                <input
                                                    type="number"
                                                    step="0.0001"
                                                    value={settings.office_longitude}
                                                    onChange={(e) => setSettings({ ...settings, office_longitude: parseFloat(e.target.value) })}
                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 px-5 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black text-white uppercase tracking-tight italic">Scanning Radius</p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Max distance (meters) for valid authentication</p>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className="text-lg font-black text-blue-400 font-mono w-16 text-right">{settings.geofence_range_meters}m</span>
                                                    <input
                                                        type="range"
                                                        min="10" max="1000" step="10"
                                                        value={settings.geofence_range_meters}
                                                        onChange={(e) => setSettings({ ...settings, geofence_range_meters: parseInt(e.target.value) })}
                                                        className="w-48 accent-blue-500 h-1 bg-slate-900 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'personnel' && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Access Governance</h2>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Security Permissions & User Matrix</p>
                                        </div>
                                    </div>

                                    <div className="overflow-hidden border border-white/5 rounded-3xl bg-slate-950/30">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/5 bg-white/5">
                                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Operator</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Identity Hash</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Clearance Level</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {users.map(user => (
                                                    <tr key={user._id} className="group hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center font-black text-xs text-blue-400 border border-blue-500/20">{user.username[0].toUpperCase()}</div>
                                                                <div>
                                                                    <div className="text-xs font-black text-white uppercase tracking-tight">{user.username}</div>
                                                                    <div className="text-[9px] font-bold text-slate-500 lowercase font-mono">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-[9px] text-slate-600 uppercase tracking-widest">{user._id.substring(0, 16)}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-1.5">
                                                                {['admin', 'employee', 'student'].map(role => (
                                                                    <button
                                                                        key={role}
                                                                        onClick={() => handleUpdateUserRole(user._id, role)}
                                                                        className={`
                                                                            px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                                                                            ${user.role === role
                                                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                                                : 'bg-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10'}
                                                                        `}
                                                                    >
                                                                        {role === 'admin' && <Shield className="w-3 h-3 inline mr-1 -mt-0.5" />}
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

                            {activeTab === 'security' && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400 border border-rose-500/20">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Defense Matrix</h2>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Encrypted Access Handlers</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Master API Key</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Key className="w-4 h-4" /></div>
                                                <input
                                                    type={showApiKey ? 'text' : 'password'}
                                                    value={settings.master_api_key || 'Loading secure key...'}
                                                    readOnly
                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-mono text-blue-400/80 outline-none"
                                                />

                                                <button
                                                    onClick={() => setShowApiKey(!showApiKey)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                                >
                                                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button
                                                onClick={handleRotateKey}
                                                disabled={isRotating}
                                                className="flex items-center justify-center gap-2 p-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] hover:bg-white/10 hover:text-blue-400 transition-all shadow-xl disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                {isRotating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                                                {isRotating ? 'Rotating Seed...' : 'Rotate Security Seed'}
                                            </button>
                                            <button
                                                onClick={handleExportLog}
                                                disabled={isExporting}
                                                className="flex items-center justify-center gap-2 p-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] hover:bg-white/10 hover:text-rose-400 transition-all shadow-xl disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                {isExporting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                {isExporting ? 'Exporting Log...' : 'Export System Log'}
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            )}

                            {activeTab === 'system' && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20">
                                            <Cpu className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Core Environment</h2>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Computational Node Status</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Latency', value: latency, status: parseInt(latency) > 100 ? 'Degraded' : 'Healthy', color: parseInt(latency) > 100 ? 'text-amber-400' : 'text-emerald-400', dot: parseInt(latency) > 100 ? 'bg-amber-500' : 'bg-emerald-500' },
                                            { label: 'Storage', value: systemStats?.storage || '---', status: systemStats?.storage_status || 'Checking', color: systemStats?.storage_status === 'Warning' ? 'text-amber-400' : 'text-emerald-400', dot: systemStats?.storage_status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500' },
                                            { label: 'Active Nodes', value: systemStats?.active_nodes?.toString() || '1', status: systemStats?.node_status || 'Cluster', color: 'text-emerald-400', dot: 'bg-emerald-500' },
                                        ].map((stat, i) => (

                                            <div key={i} className="p-6 rounded-3xl bg-slate-950/40 border border-white/5 space-y-1 group hover:border-amber-500/30 transition-all hover:scale-[1.05]">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{stat.label}</p>
                                                <p className="text-3xl font-black text-white tracking-tighter font-mono">{stat.value}</p>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${stat.dot} animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]`} />
                                                    <span className={`text-[9px] font-black ${stat.color} uppercase tracking-widest`}>{stat.status}</span>
                                                </div>
                                            </div>

                                        ))}
                                    </div>

                                    <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 group hover:bg-indigo-500/10 transition-all">
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                                                <Command className="w-5 h-5" />
                                            </div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Deep Trace Manual Node Override</p>
                                        </div>
                                        <div className="bg-slate-950 font-mono text-[10px] p-6 rounded-2xl text-indigo-400/80 leading-relaxed border border-white/5 shadow-inner">
                                            <div className="text-slate-600 mb-1">// System state re-indexing...</div>
                                            <div>$ systemctl check-status --unit=attendance-core</div>
                                            <div>&gt; MongoDB Connection... <span className="text-emerald-400">[ESTABLISHED]</span> v{systemStats?.mongo_version || '?.?.?'}</div>
                                            <div>&gt; Memory Allocation... <span className="text-blue-400">[{systemStats?.memory || '---'}]</span></div>
                                            <div>&gt; System Uptime... <span className="text-amber-400">[{Math.floor((systemStats?.uptime || 0) / 60)}m {(Math.floor(systemStats?.uptime || 0) % 60)}s]</span></div>
                                            <div>&gt; <span className="text-emerald-400">SYSTEM_OPERATIONAL_STATUS_CODE_200</span></div>
                                        </div>

                                    </div>
                                </div>
                            )}

                            {activeTab === 'backup' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
                                                <Database className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Backup Ledger</h2>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">System state archives & snapshots</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleCreateBackup}
                                            disabled={isBackingUp}
                                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-[10px] tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 uppercase italic"
                                        >
                                            {isBackingUp ? (
                                                <>
                                                    <RotateCcw className="w-3 h-3 animate-spin" />
                                                    Creating Snapshot...
                                                </>
                                            ) : (
                                                <>
                                                    <Database className="w-3 h-3" />
                                                    Create Snapshot
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="overflow-hidden border border-white/5 rounded-3xl bg-slate-950/30">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/5 bg-white/5">
                                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Archive Identifier</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Temporal Stamp</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Payload Size</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Protocol</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {backups.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">No archives detected in current cluster</td>
                                                    </tr>
                                                ) : (
                                                    backups.map(backup => (
                                                        <tr key={backup.filename} className="group hover:bg-white/[0.02] transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                                                        <Database className="w-3 h-3" />
                                                                    </div>
                                                                    <div className="text-[10px] font-mono font-bold text-white uppercase tracking-tight">{backup.filename}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                                    {new Date(backup.createdAt).toLocaleString()}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-[10px] font-mono font-bold text-slate-500">
                                                                    {(backup.size / (1024 * 1024)).toFixed(2)} MB
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => BackupService.downloadBackup(backup.filename)}
                                                                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                                                        title="Download Archive"
                                                                    >
                                                                        <Download className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRestoreBackup(backup.filename)}
                                                                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                                                        title="Restore System State"
                                                                    >
                                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteBackup(backup.filename)}
                                                                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                                                                        title="Purge Archive"
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
    );
}

