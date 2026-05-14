'use client';

import { motion } from 'framer-motion';
import { Bot, MessageSquare, Phone, Clock, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function InboundAgentsPage() {
  return (
    <div className="pt-32 pb-20 sm:pt-48 sm:pb-32 relative text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Section */}
        <div className="max-w-4xl mb-32">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 mb-8 tracking-widest uppercase"
            >
                Customer Experience Engine
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl sm:text-8xl font-black text-white tracking-tighter leading-none mb-10"
            >
                No More <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Waiting on Hold.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl"
            >
                Our Inbound AI Agents handle complex customer queries with the same empathy and precision as your top performers, 24/7.
            </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
            <div className="p-10 bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <Clock className="w-12 h-12 text-indigo-400 mb-8" />
                <h3 className="text-3xl font-bold text-white mb-4 italic tracking-tight underline underline-offset-8 decoration-indigo-500">24/7/365 Coverage.</h3>
                <p className="text-slate-500 leading-relaxed text-lg">
                    Never lose a customer to hold times or office hours. Our AI fleet scales instantly based on traffic spikes, ensuring every call is answered on the first ring.
                </p>
                <div className="mt-12 flex items-center gap-6 opacity-40">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-white">0s</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Wait Time</span>
                    </div>
                </div>
            </div>

            <div className="p-10 bg-indigo-600/5 backdrop-blur-md rounded-[3rem] border border-indigo-500/10 shadow-2xl relative overflow-hidden group">
                <Bot className="w-12 h-12 text-indigo-400 mb-8" />
                <h3 className="text-3xl font-bold text-white mb-4 italic tracking-tight underline underline-offset-8 decoration-indigo-500">Hyper-Realistic Persona.</h3>
                <p className="text-slate-500 leading-relaxed text-lg">
                    Using the latest in neural voice technology, our agents maintain natural prosody and emotional intelligence, making them indistinguishable from human staff.
                </p>
                <div className="mt-12 flex items-center gap-6 opacity-40">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-white">150+</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Unique Voices</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Multilingual Section */}
        <section className="py-24 border-y border-white/5 mb-32 relative bg-slate-900/30 overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <Globe className="w-16 h-16 text-indigo-500 mx-auto mb-10" />
                <h2 className="text-4xl font-black text-white mb-8 tracking-tight italic">Support the World.</h2>
                <p className="text-lg text-slate-400 mb-12">
                    Native support for over 50 languages with regional accent preservation. One agent, global presence.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-xs font-black uppercase tracking-widest text-slate-600">
                    <span>English</span>
                    <span className="text-indigo-500">•</span>
                    <span>Spanish</span>
                    <span className="text-indigo-500">•</span>
                    <span>French</span>
                    <span className="text-indigo-500">•</span>
                    <span>German</span>
                    <span className="text-indigo-500">•</span>
                    <span>Mandarin</span>
                    <span className="text-indigo-500">•</span>
                    <span>Japanese</span>
                </div>
            </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 text-center">
             <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-black text-white mb-8 tracking-tight">Deployment in hours, not weeks.</h3>
                <Link href="/contact" className="inline-flex items-center justify-center px-10 py-5 text-lg font-black text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 group">
                    Hire Your First AI Agent 
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
        </section>

      </div>
    </div>
  );
}
