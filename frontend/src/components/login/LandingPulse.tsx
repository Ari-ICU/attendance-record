'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Cpu, UserCheck } from 'lucide-react';

export default function LandingPulse() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Ambient Background Glows */}
            <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />

            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

            {/* Floating Security Elements */}
            <div className="absolute top-20 left-20 hidden lg:block">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="glass-pane p-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <Shield size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Anti-Spoofing</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Neural Liveness Active</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="absolute bottom-20 right-20 hidden lg:block">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="glass-pane p-4 rounded-3xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-md"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                            <Globe size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Geofence Guard</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Perimeter Integrity Verified</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Scanning Line Effect */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
                initial={{ top: '-10%' }}
                animate={{ top: '110%' }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            {/* Floating Particle Icons */}
            <AnimateParticles />
        </div>
    );
}

function AnimateParticles() {
    const Icons = [Zap, Cpu, UserCheck, Shield];
    return (
        <>
            {[...Array(6)].map((_, i) => {
                const Icon = Icons[i % Icons.length];
                return (
                    <motion.div
                        key={i}
                        className="absolute text-slate-800 pointer-events-none"
                        initial={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: 0,
                            scale: 0.5
                        }}
                        animate={{
                            top: `${Math.random() * 100}%`,
                            opacity: [0, 0.2, 0],
                            scale: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 10 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        <Icon size={40} />
                    </motion.div>
                );
            })}
        </>
    );
}
