'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ComingSoonProps {
    title: string;
    description: string;
    icon: LucideIcon;
}

export default function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative mb-8"
            >
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                <div className="relative w-20 h-20 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                    <Icon size={40} className="text-blue-500" />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                    {title}
                </h1>
                <p className="text-slate-400 text-sm sm:text-base max-w-md font-normal leading-relaxed">
                    {description}
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex flex-wrap gap-3 justify-center"
            >
                <div className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Coming Soon
                </div>
                <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-semibold text-blue-400 uppercase tracking-wider">
                    In Development
                </div>
            </motion.div>
        </div>
    );
}
