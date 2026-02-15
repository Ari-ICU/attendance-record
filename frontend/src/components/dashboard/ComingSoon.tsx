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
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl">
                    <Icon size={48} className="text-blue-400" />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500 tracking-tight mb-4">
                    {title}
                </h1>
                <p className="text-slate-400 text-lg max-w-md font-medium">
                    {description}
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-12 flex flex-wrap gap-4 justify-center"
            >
                <div className="px-6 py-2 bg-white/5 border border-white/5 rounded-full text-sm font-bold text-slate-500 uppercase tracking-widest">
                    Coming Soon
                </div>
                <div className="px-6 py-2 glass-pane rounded-full text-sm font-bold text-blue-400 uppercase tracking-widest">
                    In Development
                </div>
            </motion.div>
        </div>
    );
}
