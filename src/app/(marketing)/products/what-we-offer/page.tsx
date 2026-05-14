'use client';

import { motion } from 'framer-motion';
import { Bot, Zap, Globe, Shield, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WhatWeOfferPage() {
  return (
    <div className="pt-32 pb-20 sm:pt-48 sm:pb-32 relative text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-32">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 mb-8 tracking-widest uppercase"
            >
                Our Platform Architecture
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl sm:text-8xl font-black text-white tracking-tighter leading-none mb-10"
            >
                The Future of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Voice Enterprise.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto"
            >
                VirtualCall.AI isn't just a bot. It's a complete infrastructure for building, deploying, and scaling human-grade AI voice agents.
            </motion.p>
        </div>

        {/* The Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
                { 
                    title: 'Voice Engines', 
                    desc: 'Powered by the world\'s most advanced TTS models from ElevenLabs and Play.ht for ultra-realistic prosody.', 
                    icon: Bot,
                    stats: '150ms Latency'
                },
                { 
                    title: 'LLM Reasoning', 
                    desc: 'Context-aware intelligence using GPT-4o and Claude 3.5 Sonnet for complex multi-turn reasoning.', 
                    icon: Zap,
                    stats: '99% Task Success'
                },
                { 
                    title: 'Telephony Stack', 
                    desc: 'Carrier-grade connectivity with global number procurement and regional area-code optimization.', 
                    icon: Globe,
                    stats: '50+ Countries'
                },
            ].map((pillar, i) => (
                <div key={i} className="p-8 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
                    <pillar.icon className="w-12 h-12 text-blue-400 mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-2">{pillar.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">{pillar.desc}</p>
                    <div className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-400/60">{pillar.stats}</div>
                </div>
            ))}
        </div>

        {/* Technical Deep Dive Section */}
        <section className="py-24 bg-blue-600/5 rounded-[4rem] border border-blue-500/10 mb-32 relative overflow-hidden text-center">
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-4xl font-black text-white mb-8 tracking-tight">Enterprise Infrastructure.</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-left">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Shield className="w-6 h-6 text-blue-500" />
                            <span className="font-bold text-slate-200">HIPAA & SOC2 Compliant</span>
                        </div>
                        <p className="text-sm text-slate-500">Every call is encrypted and handled within secure boundaries to meet global compliance standards.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <BarChart3 className="w-6 h-6 text-blue-500" />
                            <span className="font-bold text-slate-200">Real-time Cost Tracking</span>
                        </div>
                        <p className="text-sm text-slate-500">Full visibility into token and minute usage down to the single cent, synced across your entire agency.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Footer CTA */}
        <section className="py-20 border-t border-white/5 text-center">
             <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-black text-white mb-8 tracking-tight">Ready to see it in action?</h3>
                <Link href="/contact" className="inline-flex items-center justify-center px-10 py-5 text-lg font-black text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 group">
                    Request a Custom Demo 
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
        </section>

      </div>
    </div>
  );
}
