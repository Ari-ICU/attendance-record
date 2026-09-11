'use client';

import { getFullImageUrl } from '@/utils/url.utils';
import { motion } from 'framer-motion';
import {
    Fingerprint,
    ShieldCheck,
    User,
    Briefcase,
    Globe2,
    CheckCircle2
} from 'lucide-react';

interface VerifyCardProps {
    name: string;
    idNumber: string;
    photoUrl?: string;
    dob?: string;
    expiry?: string;
    nationality?: string;
    position?: string;
    manager?: string;
}

const VerifyCard: React.FC<VerifyCardProps> = ({
    name,
    idNumber,
    photoUrl,
    position,
    nationality,
}) => {
    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-xs"
            >
                {/* Header Banner */}
                <div className="h-10 w-full bg-slate-50 border-b border-slate-100 flex items-center justify-between px-4">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Student ID Badge</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Verified</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-start gap-4">
                        {/* Portrait */}
                        <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-2xs flex items-center justify-center">
                            {photoUrl ? (
                                <img
                                    src={getFullImageUrl(photoUrl) || ''}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-8 h-8 text-slate-400" />
                            )}
                        </div>

                        {/* Name & ID */}
                        <div className="space-y-1.5 min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                                {name || '---'}
                            </h3>
                            <div className="flex items-center gap-1.5 text-blue-600 font-mono text-xs">
                                <Fingerprint className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">ID: {idNumber?.slice(-10).toUpperCase() || '---'}</span>
                            </div>
                            <div className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200/60">
                                Campus Active
                            </div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Track</span>
                            <div className="flex items-center gap-1.5 text-slate-800">
                                <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="text-xs font-semibold truncate">{position || 'Student'}</span>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nationality</span>
                            <div className="flex items-center gap-1.5 text-slate-800">
                                <Globe2 className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="text-xs font-semibold truncate">{nationality || 'Cambodian'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bar */}
                <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 text-[10px] font-medium text-slate-500 flex items-center justify-between">
                    <span>Campus Academic Portal</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyCard;