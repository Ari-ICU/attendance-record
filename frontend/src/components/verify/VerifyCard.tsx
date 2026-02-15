'use client';

import { getFullImageUrl } from '@/utils/url.utils';
import { motion } from 'framer-motion';
import {
    Fingerprint,
    ShieldCheck,
    User,
    Mail,
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full aspect-[1.58/1] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group bg-slate-900/40 backdrop-blur-xl"
            >
                {/* Security Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '24px 24px' }}
                />

                {/* Top Security Banner */}
                <div className="h-12 w-full bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-blue-600/20 border-b border-white/5 flex items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400/80">Identity Document</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400">Verified</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 flex gap-8">
                    {/* Portrait Section */}
                    <div className="relative group/portrait">
                        <div className="absolute -inset-2 bg-blue-500/20 blur-xl opacity-0 group-hover/portrait:opacity-100 transition-opacity duration-700" />
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/10 bg-slate-950/80 shadow-2xl">
                            {photoUrl ? (
                                <img
                                    src={getFullImageUrl(photoUrl) || ''}
                                    alt={name}
                                    className="w-full h-full object-cover grayscale-[0.2] contrast-125"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-800">
                                    <User className="w-12 h-12" />
                                </div>
                            )}

                            {/* Scanning line effect */}
                            <div className="absolute inset-x-0 h-[2px] bg-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.8)] top-0 animate-[scan_3s_linear_infinite]" />
                        </div>
                    </div>

                    {/* Data Section */}
                    <div className="flex-1 space-y-6 pt-2">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-2 uppercase italic italic-font-fix">
                                {name || '---'}
                            </h3>
                            <div className="flex items-center gap-2 text-blue-400/60 font-mono text-[10px] tracking-widest uppercase">
                                <Fingerprint className="w-3 h-3" />
                                REF: {idNumber?.slice(-12).toUpperCase() || '---'}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Designation</span>
                                <div className="flex items-center gap-2 text-slate-200">
                                    <Briefcase className="w-3 h-3 text-blue-500/50" />
                                    <span className="text-xs font-bold truncate">{position || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Nationality</span>
                                <div className="flex items-center gap-2 text-slate-200">
                                    <Globe2 className="w-3 h-3 text-blue-500/50" />
                                    <span className="text-xs font-bold uppercase tracking-tighter">{nationality || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Hologram Element */}
                        <div className="absolute bottom-6 right-8 w-16 h-16 opacity-20 group-hover:opacity-40 transition-opacity">
                            <div className="w-full h-full border border-blue-400/50 rounded-full animate-spin-slow flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar Info */}
                <div className="absolute bottom-4 left-8 text-[8px] font-bold text-slate-600 uppercase tracking-[0.4em]">
                    Department Of Internal Security • Secure Access Protocol
                </div>
            </motion.div>

            <style jsx>{`
                @keyframes scan {
                    0% { top: 0%; }
                    100% { top: 100%; }
                }
                .italic-font-fix {
                    font-style: italic;
                }
            `}</style>
        </div>
    );
};

export default VerifyCard;