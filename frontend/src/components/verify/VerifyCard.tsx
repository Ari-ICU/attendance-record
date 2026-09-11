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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-sm"
            >
                {/* Header Strip */}
                <div className="h-10 w-full bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Biometric ID Badge</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Verified</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-start gap-4">
                        {/* Portrait */}
                        <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shrink-0 shadow-sm">
                            {photoUrl ? (
                                <img
                                    src={getFullImageUrl(photoUrl) || ''}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                    <User className="w-8 h-8" />
                                </div>
                            )}
                        </div>

                        {/* Name & ID */}
                        <div className="space-y-1.5 min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                                {name || '---'}
                            </h3>
                            <div className="flex items-center gap-1.5 text-blue-400 font-mono text-xs">
                                <Fingerprint className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">ID: {idNumber?.slice(-10).toUpperCase() || '---'}</span>
                            </div>
                            <div className="inline-block px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[11px] font-medium border border-slate-800">
                                Official Record
                            </div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Designation</span>
                            <div className="flex items-center gap-1.5 text-slate-300">
                                <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="text-xs font-medium truncate">{position || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Nationality</span>
                            <div className="flex items-center gap-1.5 text-slate-300">
                                <Globe2 className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="text-xs font-medium truncate">{nationality || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bar */}
                <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 text-[10px] font-medium text-slate-500 flex items-center justify-between">
                    <span>Department of HR & Security</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyCard;