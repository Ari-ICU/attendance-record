'use client';

import { useState, useEffect } from 'react';
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
    Award,
    Save,
    X,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullImageUrl } from '@/utils/url.utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        position: '',
        department: '',
        phoneNumber: '',
        bio: '',
        location: 'Phnom Penh, KH'
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                position: user.position || 'Lead System Architect',
                department: user.department || 'Engineering',
                phoneNumber: user.phoneNumber || '+855 096 888 888',
                bio: user.bio || 'Passionate full-stack developer and system architect with over 8 years of experience in building scalable enterprise solutions. Specializing in React, Node.js, and high-performance biomechanical interface design. Dedicated to optimizing workflow efficiency and implementing secure identity protocols across multidisciplinary teams.',
                location: user.location || 'Phnom Penh, KH'
            });
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile(formData);
            toast.success('System Overload Prevented: Profile Updated Successfully');
            setIsEditing(false);
        } catch (error) {
            toast.error('Update Failed: Sector Corruption Detected');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Completion', value: '92%', icon: CheckCircle2, color: 'text-emerald-400' },
        { label: 'Work Hours', value: '164h', icon: Clock, color: 'text-blue-400' },
        { label: 'Achievements', value: '12', icon: Award, color: 'text-amber-400' },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Profile Header */}
            <div className="relative h-72 rounded-[2.5rem] overflow-hidden group/header shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-900 to-slate-950" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />

                <div className="absolute bottom-0 left-0 w-full p-10 bg-gradient-to-t from-slate-950/90 to-transparent backdrop-blur-[2px]">
                    <div className="flex flex-col md:flex-row items-end gap-8">
                        <div className="relative group/avatar">
                            <div className="w-36 h-36 rounded-[2rem] border-4 border-slate-950 overflow-hidden bg-slate-900 shadow-[0_0_30px_rgba(0,0,0,0.5)] transform transition-transform group-hover/avatar:scale-105 duration-500">
                                {user?.photoUrl ? (
                                    <img src={getFullImageUrl(user.photoUrl) || ''} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-4xl font-black text-white italic">
                                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                                    </div>
                                )}
                            </div>
                            <button className="absolute bottom-2 right-2 p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xl opacity-0 group-hover/avatar:opacity-100 transition-all hover:bg-indigo-500 hover:scale-110">
                                <Camera size={18} />
                            </button>
                        </div>

                        <div className="flex-1 space-y-3 mb-2">
                            <div className="flex items-center flex-wrap gap-4">
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <input
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-2xl font-black text-white italic uppercase tracking-tight outline-none focus:border-indigo-500 focus:bg-white/20 transition-all w-48"
                                            placeholder="First Name"
                                        />
                                        <input
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-2xl font-black text-white italic uppercase tracking-tight outline-none focus:border-indigo-500 focus:bg-white/20 transition-all w-48"
                                            placeholder="Last Name"
                                        />
                                    </div>
                                ) : (
                                    <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
                                        {formData.firstName} {formData.lastName}
                                    </h1>
                                )}
                                <div className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-md">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] italic">
                                        {user?.role || 'Administrator'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6 text-slate-300 text-xs font-black uppercase tracking-[0.2em] italic drop-shadow-md">
                                <span className="flex items-center gap-2.5 group/info cursor-default">
                                    <Briefcase size={14} className="text-indigo-400" />
                                    {isEditing ? (
                                        <input
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 w-40"
                                        />
                                    ) : (
                                        <span className="group-hover/info:text-white transition-colors">{formData.position}</span>
                                    )}
                                </span>
                                <span className="flex items-center gap-2.5 group/info cursor-default">
                                    <MapPin size={14} className="text-indigo-400" />
                                    {isEditing ? (
                                        <input
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 w-40"
                                        />
                                    ) : (
                                        <span className="group-hover/info:text-white transition-colors">{formData.location}</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Info */}
                <div className="space-y-8">
                    <div className="glass-pane p-8 rounded-[2.5rem] border border-white/10 bg-slate-900/40 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Activity size={120} className="text-white" />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 relative z-10">Vital Statistics</h3>
                        <div className="grid grid-cols-1 gap-4 relative z-10">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-slate-950/40 border border-white/5 group/stat hover:border-indigo-500/30 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} group-hover/stat:scale-110 transition-transform`}>
                                            <stat.icon size={20} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                    </div>
                                    <span className="text-xl font-black text-white italic">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-pane p-8 rounded-[2.5rem] border border-white/10 bg-slate-900/40 shadow-xl">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Contact Matrix</h3>
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-2 italic">Network Identity</label>
                                <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-950/60 border border-white/5 text-sm font-bold text-slate-200 group/input">
                                    <Mail size={16} className="text-indigo-500 opacity-60 group-hover/input:opacity-100 transition-opacity" />
                                    <span className="truncate">{user?.email}</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-2 italic">Communication Line</label>
                                <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-950/60 border border-white/5 text-sm font-bold text-slate-200 group/input">
                                    <Phone size={16} className="text-indigo-500 opacity-60 group-hover/input:opacity-100 transition-opacity" />
                                    {isEditing ? (
                                        <input
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="bg-transparent border-none outline-none w-full placeholder:text-slate-700"
                                            placeholder="Update COM_LINE"
                                        />
                                    ) : (
                                        <span>{formData.phoneNumber}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bio & Experience */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-pane p-10 rounded-[2.5rem] border border-white/10 bg-slate-900/40 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30" />

                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-indigo-500/10 rounded-3xl text-indigo-400 border border-indigo-500/20 shadow-inner">
                                    <User size={28} />
                                </div>
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Protocol: Bio</h2>
                            </div>

                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.div
                                        key="edit-actions"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex gap-2"
                                    >
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all shadow-lg"
                                        >
                                            <X size={18} />
                                        </button>
                                        <button
                                            disabled={loading}
                                            onClick={handleSave}
                                            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:bg-indigo-500 transition-all disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                            Commit Change
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        key="edit-trigger"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-white hover:bg-white/10 hover:border-indigo-500/50 transition-all shadow-lg group/edit"
                                    >
                                        Edit Profile
                                        <div className="w-0 group-hover/edit:w-full h-0.5 bg-indigo-500 mt-1 transition-all duration-300" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        {isEditing ? (
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={6}
                                className="w-full p-6 rounded-3xl bg-slate-950/60 border border-white/10 text-slate-300 font-medium leading-relaxed outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all mb-8 resize-none scrollbar-hide"
                                placeholder="Initialize new Bio Protocol..."
                            />
                        ) : (
                            <p className="text-slate-400 font-medium leading-relaxed mb-10 text-lg">
                                {formData.bio}
                            </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4 group/card hover:bg-indigo-500/10 transition-colors">
                                <Shield className="text-indigo-400" size={28} />
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] font-mono">Security Level</h4>
                                <p className="text-sm font-bold text-slate-500 leading-snug">Tier-1 Administrative Access with Full Override Authorization.</p>
                            </div>
                            <div className="p-8 rounded-[2rem] bg-slate-950/40 border border-white/5 space-y-4 group/card hover:bg-slate-950/60 transition-colors">
                                <Calendar className="text-blue-500" size={28} />
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] font-mono">Duty Commencement</h4>
                                <p className="text-sm font-bold text-slate-500 leading-snug">Initialized on September 15, 2021. Active for 884 cycles.</p>
                            </div>
                        </div>
                    </div>

                    {/* Skill Matrix */}
                    <div className="glass-pane p-10 rounded-[2.5rem] border border-white/10 bg-slate-900/40 shadow-xl overflow-hidden relative">
                        <div className="absolute -right-10 -bottom-10 opacity-5">
                            <Award size={200} className="text-white" />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Skill Matrix</h3>
                        <div className="flex flex-wrap gap-4 relative z-10">
                            {['React.js', 'TypeScript', 'Node.js', 'MongoDB', 'System Architecture', 'Biometrics', 'Cyber Security', 'Real-time Engines'].map((skill, i) => (
                                <span key={i} className="px-6 py-3.5 rounded-2xl bg-slate-950/60 border border-white/5 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:border-indigo-500/50 hover:text-white transition-all cursor-default shadow-sm active:scale-95">
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

function Activity({ className, size }: { className?: string, size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}
