'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Bot, PhoneOutgoing, Workflow, Database, BarChart3, ShieldCheck, Zap, Wand2, Power, Code2, Sparkles } from 'lucide-react';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function FeaturesPage() {
  return (
    <div className="text-slate-300 selection:bg-blue-600 selection:text-white pt-32 pb-20 sm:pt-48 sm:pb-32">

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="text-6xl sm:text-[100px] font-black text-white mb-8 tracking-tighter leading-[0.85]">
            Deploy an agent <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">within 60 seconds.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
            VirtualCall.AI provides a comprehensive suite of tools to build, deploy, and manage enterprise-grade voice agents with unmatched speed.
          </p>
        </motion.div>
      </div>

      {/* Army of Agents Section */}
      <section className="py-24 bg-slate-900/50 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16">
            <h2 className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-4">Deployment Speed</h2>
            <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">Scale your voice ops instantly.</h3>
            <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">Our configuration engine is so fast, you can spin up specialized AI agents in less than a minute.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-slate-950/50 rounded-3xl border border-white/5 p-8 relative group hover:border-blue-500/50 transition-all duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-xl border-4 border-slate-950 shadow-xl">1</div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]"><Wand2 className="w-6 h-6" /></div>
              <h4 className="text-xl font-bold mb-3 text-white">Define Identity</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Choose an industry-leading model (GPT-4o, Llama3) and pick the perfect voice from our global catalog.</p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-slate-950/50 rounded-3xl border border-white/5 p-8 relative group hover:border-purple-500/50 transition-all duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-black text-xl border-4 border-slate-950 shadow-xl">2</div>
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]"><Code2 className="w-6 h-6" /></div>
              <h4 className="text-xl font-bold mb-3 text-white">Give it a Brain</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Use our AI Prompt Generator to build expert instructions, and toggle on backend CRM tools.</p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-slate-950/50 rounded-3xl border border-white/5 p-8 relative group hover:border-emerald-500/50 transition-all duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-xl border-4 border-slate-950 shadow-xl">3</div>
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]"><Power className="w-6 h-6" /></div>
              <h4 className="text-xl font-bold mb-3 text-white">Deploy & Scale</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Click launch. Your agent immediately gets a live number or begins dialing thousands of outbound leads.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 space-y-48">

        {/* AI Prompt Generator Card */}
        <section className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-[40px] -z-10 group-hover:bg-blue-600/10 transition-all" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center bg-slate-900/40 backdrop-blur-md rounded-[40px] border border-white/5 p-8 sm:p-16 shadow-2xl">
                <div>
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="text-5xl font-black text-white mb-6 tracking-tight">AI Prompt Generator.</h2>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed mb-8">
                        Don't spend hours writing instructions. Our intelligent prompt engineering tool builds specialized agent personas in seconds based on your industry, goals, and brand voice.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4"><CheckCircle className="w-5 h-5 text-blue-500" /><span className="font-bold text-white">Persona-optimized system prompts</span></div>
                        <div className="flex items-center gap-4"><CheckCircle className="w-5 h-5 text-blue-500" /><span className="font-bold text-white">Dynamic tool-calling context</span></div>
                        <div className="flex items-center gap-4"><CheckCircle className="w-5 h-5 text-blue-500" /><span className="font-bold text-white">Tone & prosody fine-tuning</span></div>
                    </div>
                </div>
                <div className="bg-slate-950 rounded-2xl border border-white/5 p-8 shadow-inner font-mono text-xs leading-relaxed">
                    <div className="text-blue-400 font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> system_prompt_gen
                    </div>
                    <div className="text-slate-500 italic mb-4">// Generated for Real Estate Inbound</div>
                    <div className="text-slate-300">
                        "You are a professional, high-energy real estate assistant for CC Realty. Your objective is to capture lead details and schedule property tours. Use a friendly tonality and prioritize name/email capture before scheduling..."
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                        <div className="px-3 py-1 bg-blue-600 rounded text-white font-black uppercase text-[10px]">Copied to Agent</div>
                    </div>
                </div>
            </div>
        </section>

        {/* Inbound */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <Bot className="w-8 h-8" />
            </div>
            <h2 className="text-5xl font-black text-white mb-6 tracking-tight">Always-On Inbound.</h2>
            <p className="text-lg text-slate-400 font-medium leading-relaxed mb-8">
              Never miss a call. Our inbound agents answer instantly, understand complex queries using GPT-4o, and execute backend tasks via tool-calling.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4"><CheckCircle className="w-5 h-5 text-blue-500" /><span className="font-bold text-white">Zero hold times</span></div>
              <div className="flex items-center gap-4"><CheckCircle className="w-5 h-5 text-blue-500" /><span className="font-bold text-white">Multi-language support (50+)</span></div>
              <div className="flex items-center gap-4"><CheckCircle className="w-5 h-5 text-blue-500" /><span className="font-bold text-white">Customizable persona & tone</span></div>
            </div>
          </div>
          <div className="relative bg-slate-900 rounded-3xl border border-white/5 p-1 px-1 overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-blue-600/5 blur-3xl" />
             <div className="bg-slate-950 rounded-[22px] p-8 relative z-10">
                 <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                     <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Inbound Queue</span>
                     <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Live</span>
                 </div>
                 <div className="space-y-4">
                     {[1, 2].map(i => (
                        <div key={i} className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400"><Bot className="w-5 h-5"/></div>
                                <div>
                                    <div className="text-sm font-bold text-white">+1 (555) 012{i}</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-black">Call Handling</div>
                                </div>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)]" />
                        </div>
                     ))}
                 </div>
             </div>
          </div>
        </div>

        {/* Outbound */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="order-2 lg:order-1 relative bg-slate-950 rounded-3xl border border-white/5 p-8 shadow-2xl overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-600/20 transition-all" />
               <div className="flex justify-between items-center mb-10">
                   <div className="text-xs font-black text-indigo-400 uppercase tracking-widest">Dialer Capacity</div>
                   <div className="text-2xl font-black text-white">100k+ <span className="text-[10px] text-slate-500 uppercase">Per Day</span></div>
               </div>
               <div className="space-y-6">
                   <div className="h-4 bg-slate-900 rounded-full border border-white/5 overflow-hidden">
                       <motion.div initial={{ width: 0 }} whileInView={{ width: '88%' }} transition={{ duration: 1.5 }} className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                       <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
                            <div className="text-xl font-black text-white">88%</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Live Contact Rate</div>
                       </div>
                       <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
                            <div className="text-xl font-black text-emerald-400">12.5%</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Conversion Lift</div>
                       </div>
                   </div>
               </div>
           </div>
           <div className="order-1 lg:order-2">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <PhoneOutgoing className="w-8 h-8" />
            </div>
            <h2 className="text-5xl font-black text-white mb-6 tracking-tight">Massive Outbound.</h2>
            <p className="text-lg text-slate-400 font-medium leading-relaxed mb-8">
              Upload thousands of leads and let our engine do the heavy lifting. The dialer skips voicemail, detects interest, and executes scripts flawlessly.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4"><CheckCircle className="w-5 h-5 text-indigo-500" /><span className="font-bold text-white">AMD (Answering Machine Detection)</span></div>
              <div className="flex items-center gap-4"><CheckCircle className="w-5 h-5 text-indigo-500" /><span className="font-bold text-white">Variable Insertion (Name, Local Info)</span></div>
              <div className="flex items-center gap-4"><CheckCircle className="w-5 h-5 text-indigo-500" /><span className="font-bold text-white">Automatic DNC compliance</span></div>
            </div>
          </div>
        </div>

        {/* Transfers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    <Workflow className="w-8 h-8" />
                </div>
                <h2 className="text-5xl font-black text-white mb-6 tracking-tight">Hot Transfers.</h2>
                <p className="text-lg text-slate-400 font-medium leading-relaxed mb-8">
                    Qualify at the edge. The moment buying intent is detected, the AI initiates a bridge and hands the call directly to your human closers.
                </p>
                <div className="space-y-4">
                    <div className="flex items-center gap-4"><CheckCircle className="w-5 h-5 text-emerald-500" /><span className="font-bold text-white">Instant SIP bridging</span></div>
                    <div className="flex items-center gap-4"><CheckCircle className="w-5 h-5 text-emerald-500" /><span className="font-bold text-white">Context preservation (Meta-data sync)</span></div>
                    <div className="flex items-center gap-4"><CheckCircle className="w-5 h-5 text-emerald-500" /><span className="font-bold text-white">Zero-latency handover</span></div>
                </div>
            </div>
            <div className="relative p-8 bg-slate-900 rounded-3xl border border-white/5 flex items-center justify-center min-h-[300px] overflow-hidden">
                <div className="absolute inset-0 bg-emerald-600/5 blur-3xl" />
                <div className="flex items-center gap-12 sm:gap-24 relative z-10 w-full justify-center">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/40 border-4 border-slate-950"><Bot className="w-8 h-8 text-white"/></div>
                        <span className="mt-4 text-[10px] font-black uppercase text-slate-500">AI Qualifier</span>
                    </div>
                    <div className="flex-grow max-w-[120px] h-[2px] bg-slate-800 relative">
                        <motion.div 
                            animate={{ left: ['0%', '100%'], opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500 rounded-full blur-sm" 
                        />
                         <div className="absolute top-1/2 -translate-y-1/2 w-full h-[1px] bg-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,1)]" />
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-slate-950 text-slate-950 font-black">Sales</div>
                        <span className="mt-4 text-[10px] font-black uppercase text-slate-500">Human Closer</span>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* CTA */}
      <section className="py-32 bg-slate-900 border-t border-white/5 text-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
         <div className="relative z-10 px-4">
            <h2 className="text-5xl font-black text-white mb-8 tracking-tighter">Ready to scale your voice operations?</h2>
            <Link href="/contact" className="inline-flex items-center justify-center px-10 py-5 text-lg font-black text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 group">
                Request API Access
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
         </div>
      </section>

    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
