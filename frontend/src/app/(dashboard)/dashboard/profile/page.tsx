'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
    User,
    Mail,
    Shield,
    Calendar,
    MapPin,
    Phone,
    Briefcase,
    Camera,
    CheckCircle2,
    Clock,
    Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getFullImageUrl } from '@/utils/url.utils';

export default function ProfilePage() {
    const { user } = useAuth();

    const stats = [
        { label: 'Completion', value: '92%', icon: CheckCircle2, color: 'text-emerald-400' },
        { label: 'Work Hours', value: '164h', icon: Clock, color: 'text-blue-400' },
        { label: 'Achievements', value: '12', icon: Award, color: 'text-amber-400' },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Profile Header */}
            <div className="relative h-64 rounded-[2.5rem] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-900" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-slate-950 to-transparent">
                    <div className="flex flex-col md:flex-row items-end gap-6">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl border-4 border-slate-950 overflow-hidden bg-slate-900 shadow-2xl">
                                {user?.photoUrl ? (
                                    <img src={getFullImageUrl(user.photoUrl) || ''} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-3xl font-black text-white italic">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </div>
                                )}
                            </div>
                            <button className="absolute bottom-2 right-2 p-2 rounded-xl bg-blue-600 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={16} />
                            </button>
                        </div>
                        <div className="flex-1 space-y-2 mb-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black text-white italic uppercase tracking-tight">{user?.firstName} {user?.lastName}</h1>
                                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                    {user?.role || 'Administrator'}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-2"><Briefcase size={14} className="text-blue-500" /> Lead System Architect</span>
                                <span className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> Phnom Penh, KH</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Info */}
                <div className="space-y-8">
                    <div className="glass-pane p-6 rounded-[2rem] border border-white/10">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Vital Statistics</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                                            <stat.icon size={18} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                                    </div>
                                    <span className="text-lg font-black text-white">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-pane p-6 rounded-[2rem] border border-white/10">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Contact Matrix</h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Network Identity</label>
                                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/50 border border-white/5 text-sm font-bold text-slate-200">
                                    <Mail size={16} className="text-blue-500" />
                                    {user?.email}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Communication Line</label>
                                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/50 border border-white/5 text-sm font-bold text-slate-200">
                                    <Phone size={16} className="text-blue-500" />
                                    +855 096 888 888
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bio & Experience */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-pane p-8 rounded-[2rem] border border-white/10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                                    <User size={24} />
                                </div>
                                <h2 className="text-xl font-black text-white italic uppercase">Protocol: Bio</h2>
                            </div>
                            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">
                                Edit Profile
                            </button>
                        </div>
                        <p className="text-slate-400 font-medium leading-relaxed mb-8">
                            Passionate full-stack developer and system architect with over 8 years of experience in building scalable enterprise solutions.
                            Specializing in React, Node.js, and high-performance biomechanical interface design. Dedicated to optimizing workflow efficiency
                            and implementing secure identity protocols across multidisciplinary teams.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                <Shield className="text-blue-500" size={24} />
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">Security Level</h4>
                                <p className="text-sm font-bold text-slate-500">Tier-1 Administrative Access with Full Override Authorization.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                <Calendar className="text-indigo-500" size={24} />
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">Duty Commencement</h4>
                                <p className="text-sm font-bold text-slate-500">Initialized on September 15, 2021. Active for 884 cycles.</p>
                            </div>
                        </div>
                    </div>

                    {/* Skill Matrix */}
                    <div className="glass-pane p-8 rounded-[2rem] border border-white/10">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Skill Matrix</h3>
                        <div className="flex flex-wrap gap-4">
                            {['React.js', 'TypeScript', 'Node.js', 'MongoDB', 'System Architecture', 'Biometrics', 'Cyber Security', 'Real-time Engines'].map((skill, i) => (
                                <span key={i} className="px-5 py-2.5 rounded-2xl bg-slate-950/50 border border-white/5 text-xs font-black text-blue-400/80 uppercase tracking-widest hover:border-blue-500/30 transition-all cursor-default">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
