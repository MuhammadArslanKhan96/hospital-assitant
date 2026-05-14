'use client';

import { motion } from 'framer-motion';
import { PhoneOutgoing, Target, Zap, BarChart3, Globe, ArrowRight, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function OutboundDialerPage() {
  return (
    <div className="pt-32 pb-20 sm:pt-48 sm:pb-32 relative text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Section */}
        <div className="max-w-4xl mb-32">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 mb-8 tracking-widest uppercase"
            >
                Revenue Acceleration Engine
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl sm:text-8xl font-black text-white tracking-tighter leading-none mb-10"
            >
                Scale Outbound <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">At Warp Speed.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl"
            >
                Automate your cold outreach, follow-ups, and appointment scheduling with high-volume AI dialers that never burn out.
            </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
            <div className="p-10 bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <Target className="w-12 h-12 text-emerald-400 mb-8" />
                <h3 className="text-3xl font-bold text-white mb-4 italic tracking-tight underline underline-offset-8 decoration-emerald-500">Local Presence.</h3>
                <p className="text-slate-500 leading-relaxed text-lg">
                    Automatically procurement and rotate local area codes based on your lead's location. Increase pickup rates by up to 400% with familiar numbers.
                </p>
                <div className="mt-12 flex items-center gap-6 opacity-40">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-white">4x</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Pick-up Rate</span>
                    </div>
                </div>
            </div>

            <div className="p-10 bg-emerald-600/5 backdrop-blur-md rounded-[3rem] border border-emerald-500/10 shadow-2xl relative overflow-hidden group">
                <UserCheck className="w-12 h-12 text-emerald-400 mb-8" />
                <h3 className="text-3xl font-bold text-white mb-4 italic tracking-tight underline underline-offset-8 decoration-emerald-500">Lead Qualification.</h3>
                <p className="text-slate-500 leading-relaxed text-lg">
                    Our dialer handles initial qualification calls, identifying high-intent leads and booking meetings directly into your team's calendar.
                </p>
                <div className="mt-12 flex items-center gap-6 opacity-40">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-white">10k+</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Concurrent Calls</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Campaign Logic Deep Dive */}
        <section className="py-24 bg-white/5 rounded-[4rem] border border-white/5 mb-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-900/5 pointer-events-none" />
            <div className="max-w-5xl mx-auto px-10 text-center relative z-10">
                <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-12 uppercase italic leading-none">Automated <br />Campaign Logic.</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="p-8 bg-slate-950 rounded-2xl border border-white/5 transition-transform hover:-translate-y-2">
                         <Zap className="w-8 h-8 text-emerald-500 mb-4" />
                         <h4 className="text-lg font-bold text-white mb-2 underline underline-offset-8 decoration-emerald-500">Trigger-Based Calls</h4>
                         <p className="text-sm text-slate-500 leading-relaxed pt-2">Connect to leads the second they submit a form, interact with an ad, or download a resource.</p>
                    </div>
                    <div className="p-8 bg-slate-950 rounded-2xl border border-white/5 transition-transform hover:-translate-y-2">
                         <BarChart3 className="w-8 h-8 text-emerald-500 mb-4" />
                         <h4 className="text-lg font-bold text-white mb-2 underline underline-offset-8 decoration-emerald-500">Dialer Analytics</h4>
                         <p className="text-sm text-slate-500 leading-relaxed pt-2">Track call volume, lead sentiment, and conversion ROI in real-time within your agency portal.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Footer CTA */}
        <section className="py-20 text-center">
             <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-black text-white mb-8 tracking-tight">Scale your pipeline today.</h3>
                <Link href="/contact" className="inline-flex items-center justify-center px-10 py-5 text-lg font-black text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 group">
                    Launch Your First Campaign 
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
        </section>

      </div>
    </div>
  );
}
