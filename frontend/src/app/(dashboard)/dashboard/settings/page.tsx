'use client';

import { useState } from 'react';
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
    Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type TabType = 'general' | 'biometrics' | 'security' | 'system';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [showApiKey, setShowApiKey] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            toast.success('System configuration updated successfully');
            setIsSaving(false);
        }, 1500);
    };

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'general', label: 'Organization Hub', icon: Globe },
        { id: 'biometrics', label: 'Pulse & Biometrics', icon: Fingerprint },
        { id: 'security', label: 'Defense Protocol', icon: Shield },
        { id: 'system', label: 'Core Environment', icon: Cpu },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white tracking-tight italic">Terminal Config</h1>
                    <p className="text-slate-400 font-medium tracking-tight">Tune the core engine and security parameters</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 text-white font-black text-sm tracking-[0.1em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 uppercase italic"
                >
                    {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Sync State
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
                            <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
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
                                            <h2 className="text-xl font-black text-white italic uppercase">Operational Profile</h2>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Master Organization Identity</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Entity Alias</label>
                                            <input type="text" defaultValue="KHMERWORK CORPORATE" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3.5 px-5 text-sm font-bold text-white outline-none focus:border-blue-500/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Control Domain</label>
                                            <input type="text" defaultValue="khmerwork.com" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3.5 px-5 text-sm font-bold text-white outline-none focus:border-blue-500/50" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Appearance Protocol</h3>
                                        <div className="flex gap-4">
                                            <div className="flex-1 p-4 rounded-2xl bg-blue-600/10 border-2 border-blue-600 flex flex-col items-center gap-3">
                                                <Moon className="w-6 h-6 text-blue-400" />
                                                <span className="text-[10px] font-black text-white uppercase">Cyber Blue (Default)</span>
                                            </div>
                                            <div className="flex-1 p-4 rounded-2xl bg-white/5 border-2 border-transparent hover:border-white/10 flex flex-col items-center gap-3 grayscale opacity-60">
                                                <Sun className="w-6 h-6 text-slate-500" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase">Legacy Light</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'biometrics' && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
                                            <Fingerprint className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white italic uppercase">Pulse Recognition Sensors</h2>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Biometric Precision & Tuning</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-blue-500/20 transition-all">
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-white uppercase tracking-tight">Facial Logic Strictness</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Min similarity required for positive ID</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-black text-blue-400">0.65</span>
                                                <input type="range" className="w-32 accent-blue-600" defaultValue="65" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-blue-500/20 transition-all">
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-white uppercase tracking-tight">Active Liveness Check</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Determine if subject is a physical entity</p>
                                            </div>
                                            <div className="relative w-12 h-6 rounded-full bg-blue-600 border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                                                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-lg" />
                                            </div>
                                        </div>
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
                                            <h2 className="text-xl font-black text-white italic uppercase">Defense Protocol</h2>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access control and encrypted keys</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Master API Key</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Key className="w-4 h-4" /></div>
                                                <input
                                                    type={showApiKey ? 'text' : 'password'}
                                                    value="sk_live_v2_982kjs92m0x81ms72bca91ms"
                                                    readOnly
                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-sm font-mono text-blue-400/80 outline-none"
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
                                            <button className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-slate-300 uppercase tracking-widest hover:bg-white/10 transition-all">
                                                <RotateCcw className="w-4 h-4" />
                                                Rotate Master Key
                                            </button>
                                            <button className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-slate-300 uppercase tracking-widest hover:bg-white/10 transition-all">
                                                <Download className="w-4 h-4" />
                                                Export Access Logs
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
                                            <h2 className="text-xl font-black text-white italic uppercase">Core Environment</h2>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hardware integration and node status</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Latency', value: '18ms', status: 'Optimal' },
                                            { label: 'Storage', value: '42.8 GB', status: 'Healthy' },
                                            { label: 'Node Count', value: '12', status: 'Active' },
                                        ].map((stat, i) => (
                                            <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                                <p className="text-2xl font-black text-white tracking-tighter mb-1">{stat.value}</p>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[9px] font-bold text-emerald-400 uppercase">{stat.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Command className="w-5 h-5 text-indigo-400" />
                                            <p className="text-xs font-black text-white uppercase tracking-widest">Manual Node Override</p>
                                        </div>
                                        <div className="bg-slate-950 font-mono text-[10px] p-4 rounded-xl text-indigo-400/80 leading-relaxed border border-white/5">
                                            <div>$ systemctl restart biometric-hub</div>
                                            <div>&gt; Restarting biometric-hub.service...</div>
                                            <div>&gt; Validating SHA-256 neural weights...</div>
                                            <div>&gt; [OK] System synchronized.</div>
                                        </div>
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
