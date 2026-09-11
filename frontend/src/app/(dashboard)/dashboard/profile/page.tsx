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
                bio: user.bio || 'Passionate full-stack developer and system architect with experience in building scalable enterprise solutions. Specializing in modern web applications, biometrics, and secure identity protocols.',
                location: user.location || 'Phnom Penh, KH'
            });
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile(formData);
            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update profile');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Attendance Rate', value: '98.5%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Logged Hours', value: '164 hrs', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Badges Earned', value: '12 Active', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Profile Banner Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 relative">
                    <div className="absolute inset-0 bg-slate-950/20" />
                </div>

                <div className="px-5 sm:px-8 pb-6 sm:pb-8 relative">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                            {/* Avatar */}
                            <div className="relative group/avatar">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-slate-900 overflow-hidden bg-slate-800 shadow-md">
                                    {user?.photoUrl ? (
                                        <img src={getFullImageUrl(user.photoUrl) || ''} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-2xl font-bold text-white">
                                            {formData.firstName?.[0] || 'U'}{formData.lastName?.[0] || ''}
                                        </div>
                                    )}
                                </div>
                                <button className="absolute bottom-1 right-1 p-2 rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-500 transition-colors">
                                    <Camera size={14} />
                                </button>
                            </div>

                            {/* Name & Role */}
                            <div className="space-y-1">
                                <div className="flex items-center flex-wrap gap-2.5">
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <input
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-base font-bold text-white outline-none focus:border-blue-500 w-36"
                                                placeholder="First Name"
                                            />
                                            <input
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-base font-bold text-white outline-none focus:border-blue-500 w-36"
                                                placeholder="Last Name"
                                            />
                                        </div>
                                    ) : (
                                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                            {formData.firstName} {formData.lastName}
                                        </h1>
                                    )}
                                    <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold capitalize">
                                        {user?.role || 'Administrator'}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 pt-0.5">
                                    <span className="flex items-center gap-1.5">
                                        <Briefcase size={14} className="text-slate-500" />
                                        {isEditing ? (
                                            <input
                                                value={formData.position}
                                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 outline-none focus:border-blue-500 text-white"
                                            />
                                        ) : (
                                            <span>{formData.position}</span>
                                        )}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={14} className="text-slate-500" />
                                        {isEditing ? (
                                            <input
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 outline-none focus:border-blue-500 text-white"
                                            />
                                        ) : (
                                            <span>{formData.location}</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Edit / Save Action */}
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                                        title="Cancel"
                                    >
                                        <X size={16} />
                                    </button>
                                    <button
                                        disabled={loading}
                                        onClick={handleSave}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                        <span>Save Profile</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-colors"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Quick Stats & Contacts */}
                <div className="space-y-6">
                    {/* Performance Metrics */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Summary Statistics</h3>
                        <div className="space-y-3">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                            <stat.icon size={16} />
                                        </div>
                                        <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-white">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Information</h3>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">Email Address</label>
                                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200">
                                    <Mail size={14} className="text-slate-500" />
                                    <span className="truncate">{user?.email || 'user@example.com'}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">Phone Number</label>
                                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200">
                                    <Phone size={14} className="text-slate-500" />
                                    {isEditing ? (
                                        <input
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="bg-transparent border-none outline-none w-full text-white placeholder-slate-600"
                                            placeholder="Enter phone number"
                                        />
                                    ) : (
                                        <span>{formData.phoneNumber}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bio & Responsibilities */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm space-y-5">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                                <User size={18} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white">About & Biography</h2>
                                <p className="text-xs text-slate-400">Personal summary and work experience</p>
                            </div>
                        </div>

                        {isEditing ? (
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm font-normal leading-relaxed outline-none focus:border-blue-500 transition-colors resize-none"
                                placeholder="Write a short summary about yourself..."
                            />
                        ) : (
                            <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed">
                                {formData.bio}
                            </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                                <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                                    <Shield size={16} />
                                    <span>System Access Clearance</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-normal">
                                    Full administrative privilege with biometric override authorization.
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                                    <Calendar size={16} />
                                    <span>Employment Tenure</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-normal">
                                    Active system member since September 2021.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Skill Tags */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm space-y-4">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expertise & Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {['React.js', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'MongoDB', 'Biometrics', 'System Architecture', 'Security Protocols'].map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
                                >
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
