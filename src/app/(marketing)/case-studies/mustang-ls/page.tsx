'use client';

import { motion } from 'framer-motion';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { ArrowRight, Zap, Target, Home, Database, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function MustangLSCaseStudy() {
  return (
    <div className="pt-32 pb-20 sm:pt-48 sm:pb-32 relative text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="max-w-4xl mb-24">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 mb-8 tracking-widest uppercase"
            >
                Real Estate & Lead Gen
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl sm:text-7xl font-black text-white tracking-tighter leading-none mb-8"
            >
                Mustang LS: Lead <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Response in Seconds.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-400 leading-relaxed max-w-2xl"
            >
                How Mustang Logistics & Services automated their property lead qualification, achieving 98.4% agent response rates through AI hot-transfers.
            </motion.p>
        </div>

        {/* Results Banner */}
        <div className="flex flex-col md:flex-row gap-8 mb-32">
            {[
                { label: 'Response Time', value: '< 60s', icon: Zap },
                { label: 'Leads Qualified', value: '42,000+', icon: Target },
                { label: 'Cost Reduction', value: '72%', icon: BarChart3 },
            ].map((stat, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex-grow p-10 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 relative overflow-hidden group shadow-2xl"
                >
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-600/5 rounded-full blur-2xl group-hover:bg-emerald-600/10 transition-colors" />
                    <stat.icon className="w-12 h-12 text-emerald-400 mb-8" />
                    <div className="text-5xl font-black text-white mb-2">{stat.value}</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                </motion.div>
            ))}
        </div>

        {/* Narrative Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-32">
            <div className="lg:col-span-12 mb-10">
                <h2 className="text-4xl font-black text-white mb-6">The Challenge</h2>
                <div className="h-1 w-20 bg-emerald-500 rounded-full mb-8" />
            </div>
            <div className="lg:col-span-7 space-y-6 text-lg">
                <p>
                    Mustang LS handles high-volume inbound leads for commercial and residential logistics scheduling. Their biggest point of failure was the "speed to lead"—if a lead wasn't contacted within 5 minutes, conversion rates plummeted by 400%.
                </p>
                <p>
                    With thousands of forms submitted daily, their human team couldn't keep up with initial qualification calls, leading to thousands of wasted dollars in ad-spend.
                </p>
            </div>
            <div className="lg:col-span-5 bg-slate-950 p-10 rounded-3xl border border-white/5 shadow-2xl text-center">
                 <Home className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                 <h4 className="text-xl font-bold text-white mb-2">Real Estate Logic</h4>
                 <p className="text-sm text-slate-500">Multistage qualification involving property type, budget ranges, and scheduling availability.</p>
            </div>
        </div>

        {/* Strategy Section */}
        <div className="py-24 bg-white/5 rounded-[4rem] border border-white/5 mb-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-900/5 pointer-events-none" />
            <div className="max-w-5xl mx-auto px-10 text-center relative z-10">
                <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-12 uppercase italic leading-none">Instant <br />Hot-Transfers.</h2>
                <p className="text-xl text-slate-400 mb-16 max-w-2xl mx-auto font-medium">
                    "The second a lead submits a form, VirtualCall dials them. If they qualify, they are instantly bridged to a human specialist in under 5 seconds."
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="p-8 bg-slate-950 rounded-2xl border border-white/5 transition-transform hover:-translate-y-2">
                        <Database className="w-8 h-8 text-emerald-500 mb-4" />
                        <h4 className="text-lg font-bold text-white mb-2 underline underline-offset-8 decoration-emerald-500">HubSpot Sync</h4>
                        <p className="text-sm text-slate-500 leading-relaxed pt-2">Full call transcripts and qualification data synced back to contact records in real-time.</p>
                    </div>
                    <div className="p-8 bg-slate-950 rounded-2xl border border-white/5 transition-transform hover:-translate-y-2">
                        <Zap className="w-8 h-8 text-emerald-500 mb-4" />
                        <h4 className="text-lg font-bold text-white mb-2 underline underline-offset-8 decoration-emerald-500">No Hold Times</h4>
                        <p className="text-sm text-slate-500 leading-relaxed pt-2">10,000+ concurrent qualification sessions with no human bottleneck.</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
