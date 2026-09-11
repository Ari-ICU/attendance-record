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
                position: user.position || 'Lead Instructor & Administrator',
                department: user.department || 'Computer Science',
                phoneNumber: user.phoneNumber || '+855 096 888 888',
                bio: user.bio || 'Experienced academic instructor and administrator managing attendance operations and biometric integrations across university classes.',
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
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Attendance Rate', value: '98.5%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Logged Hours', value: '164 hrs', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Badges Earned', value: '12 Active', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Profile Card Banner */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="h-32 sm:h-36 bg-gradient-to-r from-blue-600 to-indigo-600 relative" />

                <div className="px-5 sm:px-8 pb-6 relative">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                            {/* Avatar */}
                            <div className="relative group/avatar">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white overflow-hidden bg-slate-100 shadow-sm flex items-center justify-center">
                                    {user?.photoUrl ? (
                                        <img src={getFullImageUrl(user.photoUrl) || ''} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-slate-700">
                                            {formData.firstName?.[0] || 'A'}{formData.lastName?.[0] || ''}
                                        </span>
                                    )}
                                </div>
                                <button className="absolute bottom-1 right-1 p-2 rounded-xl bg-blue-600 text-white shadow-xs hover:bg-blue-500 transition-colors">
                                    <Camera size={13} />
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
                                                className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1 text-base font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500 w-36"
                                                placeholder="First Name"
                                            />
                                            <input
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1 text-base font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500 w-36"
                                                placeholder="Last Name"
                                            />
                                        </div>
                                    ) : (
                                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                            {formData.firstName} {formData.lastName}
                                        </h1>
                                    )}
                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold capitalize">
                                        {user?.role || 'Administrator'}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-0.5">
                                    <span className="flex items-center gap-1.5">
                                        <Briefcase size={14} className="text-slate-400" />
                                        <span>{formData.position}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={14} className="text-slate-400" />
                                        <span>{formData.location}</span>
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
                                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                        title="Cancel"
                                    >
                                        <X size={15} />
                                    </button>
                                    <button
                                        disabled={loading}
                                        onClick={handleSave}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                        <span>Save</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors"
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
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Summary Statistics</h3>
                        <div className="space-y-3">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                            <stat.icon size={15} />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600">{stat.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Contact Credentials</h3>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-500">Email Address</label>
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800">
                                    <Mail size={14} className="text-slate-400" />
                                    <span className="truncate">{user?.email || 'admin@campus.edu'}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-500">Phone</label>
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800">
                                    <Phone size={14} className="text-slate-400" />
                                    <span>{formData.phoneNumber}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bio */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
                        <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                            About & Professional Summary
                        </h2>

                        {isEditing ? (
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 text-xs sm:text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors resize-none"
                            />
                        ) : (
                            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                {formData.bio}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
