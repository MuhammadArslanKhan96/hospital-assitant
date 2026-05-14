'use client';

import { motion } from 'framer-motion';
import { Zap, Users, Phone, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import Link from 'next/link';

export default function LiveTransfersPage() {
  return (
    <div className="pt-32 pb-20 sm:pt-48 sm:pb-32 relative text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Section */}
        <div className="max-w-4xl mb-32">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-500 mb-8 tracking-widest uppercase"
            >
                Hybrid Intelligence Bridge
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl sm:text-8xl font-black text-white tracking-tighter leading-none mb-10"
            >
                Human-in-the-Loop <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Seamlessly.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl"
            >
                VirtualCall.AI bridges the gap between scalable AI efficiency and high-touch human expertise with instant hot-transfers.
            </motion.p>
        </div>

        {/* Transfer Logic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
            <div className="p-10 bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <HeartPulse className="w-12 h-12 text-amber-500 mb-8" />
                <h3 className="text-3xl font-bold text-white mb-4 italic tracking-tight underline underline-offset-8 decoration-amber-500">Intelligent Handoff.</h3>
                <p className="text-slate-500 leading-relaxed text-lg">
                    Define custom triggers for transfers. Whether it's a specific keyword, a sentiment shift, or a qualified lead threshold, our AI knows exactly when to bring in your team.
                </p>
                <div className="mt-12 flex items-center gap-6 opacity-40">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-white">5s</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Wait Time</span>
                    </div>
                </div>
            </div>

            <div className="p-10 bg-amber-600/5 backdrop-blur-md rounded-[3rem] border border-amber-500/10 shadow-2xl relative overflow-hidden group">
                <Users className="w-12 h-12 text-amber-500 mb-8" />
                <h3 className="text-3xl font-bold text-white mb-4 italic tracking-tight underline underline-offset-8 decoration-amber-500">Total Context Sync.</h3>
                <p className="text-slate-500 leading-relaxed text-lg">
                    When a human takes over, they receive a full AI summary and live transcript of the conversation so far. No more asking the customer to repeat themselves.
                </p>
                <div className="mt-12 flex items-center gap-6 opacity-40">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-white">100%</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Context Transfer</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Process Section */}
        <section className="py-24 border-y border-white/5 mb-32 relative bg-slate-900/30 overflow-hidden text-center">
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-4xl font-black text-white mb-8 tracking-tight italic uppercase">The Hot Transfer Workflow.</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 relative">
                    <div className="p-6 bg-slate-950 rounded-2xl border border-white/5">
                        <span className="text-4xl font-black text-amber-500/20 block mb-4">01</span>
                        <h4 className="font-bold text-white mb-2">AI Qualifies</h4>
                        <p className="text-xs text-slate-500">Agent identifies high-intent or complex need.</p>
                    </div>
                    <div className="p-6 bg-slate-950 rounded-2xl border border-white/5">
                        <span className="text-4xl font-black text-amber-500/20 block mb-4">02</span>
                        <h4 className="font-bold text-white mb-2">Bridge Request</h4>
                        <p className="text-xs text-slate-500">Instantly dials your support or sales floor queue.</p>
                    </div>
                    <div className="p-6 bg-slate-950 rounded-2xl border border-white/5">
                        <span className="text-4xl font-black text-amber-500/20 block mb-4">03</span>
                        <h4 className="font-bold text-white mb-2">Live Handoff</h4>
                        <p className="text-xs text-slate-500">Human joins mid-call with full data profile.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Footer CTA */}
        <section className="py-20 text-center">
             <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-black text-white mb-8 tracking-tight">Bridge the AI gap today.</h3>
                <Link href="/contact" className="inline-flex items-center justify-center px-10 py-5 text-lg font-black text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 group">
                    Configure Your Bridge 
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
        </section>

      </div>
    </div>
  );
}
