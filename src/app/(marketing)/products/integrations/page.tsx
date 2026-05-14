'use client';

import { motion } from 'framer-motion';
import { Database, Zap, Workflow, ArrowRight, Share2, Cog } from 'lucide-react';
import Link from 'next/link';

export default function IntegrationsPage() {
  return (
    <div className="pt-32 pb-20 sm:pt-48 sm:pb-32 relative text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Section */}
        <div className="max-w-4xl mb-32 text-left">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 mb-8 tracking-widest uppercase"
            >
                Unified Data Infrastructure
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl sm:text-8xl font-black text-white tracking-tighter leading-none mb-10"
            >
                Sync Your CRM <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">In Real-Time.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl"
            >
                Connect VirtualCall.AI to your existing stack. HubSpot, Salesforce, Slack—our agents interact with your data as they speak.
            </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32 text-center sm:text-left">
            <div className="p-10 bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <Workflow className="w-12 h-12 text-purple-400 mb-8 mx-auto sm:mx-0" />
                <h3 className="text-3xl font-bold text-white mb-4 italic tracking-tight underline underline-offset-8 decoration-purple-500 text-center sm:text-left leading-tight">Native Tool Calling.</h3>
                <p className="text-slate-500 leading-relaxed text-lg text-center sm:text-left">
                    Beyond talking, our agents can TAKE ACTION. Let them book appointments, update deal stages, or trigger internal webhooks directly from the conversation.
                </p>
                <div className="mt-12 flex items-center gap-6 opacity-40 justify-center sm:justify-start">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-white">Full</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">API Access</span>
                    </div>
                </div>
            </div>

            <div className="p-10 bg-purple-600/5 backdrop-blur-md rounded-[3rem] border border-purple-500/10 shadow-2xl relative overflow-hidden group">
                <Database className="w-12 h-12 text-purple-400 mb-8 mx-auto sm:mx-0" />
                <h3 className="text-3xl font-bold text-white mb-4 italic tracking-tight underline underline-offset-8 decoration-purple-500 text-center sm:text-left leading-tight">Bi-Directional Sync.</h3>
                <p className="text-slate-500 leading-relaxed text-lg text-center sm:text-left">
                    Changes made in your CRM are reflected in the agent's knowledge instantly. Every call transcript and summary is automatically logged.
                </p>
                <div className="mt-12 flex items-center gap-6 opacity-40 justify-center sm:justify-start">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-white">100%</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Auto-Logging</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Integration Hub Section */}
        <section className="py-24 bg-white/5 rounded-[4rem] border border-white/5 mb-32 relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-purple-900/5 pointer-events-none" />
            <div className="max-w-5xl mx-auto px-10 text-center relative z-10">
                <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-16 uppercase italic leading-none">The Integration Hub.</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 grayscale opacity-40 hover:opacity-100 transition-all duration-700">
                    <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 flex flex-col items-center gap-4">
                        <Share2 className="size-8" />
                        <span className="text-[10px] font-black tracking-widest uppercase">HubSpot</span>
                    </div>
                    <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 flex flex-col items-center gap-4">
                        <Cog className="size-8" />
                        <span className="text-[10px] font-black tracking-widest uppercase">Salesforce</span>
                    </div>
                    <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 flex flex-col items-center gap-4">
                        <Zap className="size-8" />
                        <span className="text-[10px] font-black tracking-widest uppercase">Slack</span>
                    </div>
                    <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 flex flex-col items-center gap-4">
                        <Database className="size-8" />
                        <span className="text-[10px] font-black tracking-widest uppercase">Custom API</span>
                    </div>
                </div>
                <p className="text-sm text-slate-500 mt-16 max-w-xl mx-auto italic font-bold">
                    "If your app has a REST API, VirtualCall.AI can speak to it."
                </p>
            </div>
        </section>

        {/* Footer CTA */}
        <section className="py-20 text-center">
             <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-black text-white mb-8 tracking-tight">Connect your infrastructure today.</h3>
                <Link href="/contact" className="inline-flex items-center justify-center px-10 py-5 text-lg font-black text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 group">
                    Integrate Now 
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
        </section>

      </div>
    </div>
  );
}
