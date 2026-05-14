'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Building, Stethoscope, Briefcase, PhoneCall, Check } from 'lucide-react';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function SolutionsPage() {
  return (
    <div className="text-slate-300 selection:bg-blue-600 selection:text-white min-h-screen relative overflow-hidden">

      {/* Header */}
      <div className="pt-32 pb-20 sm:pt-48 sm:pb-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-black text-blue-400 mb-8 tracking-widest uppercase">
              Industry Use Cases
            </div>
            <h1 className="text-6xl sm:text-[100px] font-black text-white tracking-tighter leading-[0.85] mb-8">
              Built for your <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">exact workflow.</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
              VirtualCall.AI isn't just a generic voice bot. It's a highly customizable infrastructure designed to solve specific bottlenecks across high-volume industries.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Solutions Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
        <div className="space-y-24">

            {/* Sales & Lead Gen */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/5 p-8 sm:p-14 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-500 -z-10"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10 items-center">
                    <div>
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                            <PhoneCall className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Sales & Lead Gen.</h2>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed mb-8">
                            Supercharge your outbound sales floor. The AI dials your lists, qualifies the prospect using dynamic conversational scripts, and instantly hot-transfers qualified buyers to your human closers.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center text-sm font-black text-white"><Check className="text-blue-500 mr-3 w-5 h-5"/> Campaign dialing at scale (10k+ concurrent)</li>
                            <li className="flex items-center text-sm font-black text-white"><Check className="text-blue-500 mr-3 w-5 h-5"/> Live transfer logic with context sync</li>
                            <li className="flex items-center text-sm font-black text-white"><Check className="text-blue-500 mr-3 w-5 h-5"/> Full DNC & TCPA compliance</li>
                        </ul>
                    </div>
                    <div className="bg-slate-950 rounded-2xl border border-white/5 p-10 flex flex-col justify-center space-y-10 relative">
                        <div className="absolute top-0 right-0 p-4"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /></div>
                        <div className="flex justify-between items-end border-b border-white/5 pb-6">
                            <div><div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Connected</div><div className="text-4xl font-black text-white">41,204</div></div>
                            <div className="text-2xl font-black text-blue-400">+12%</div>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/5 pb-6">
                            <div><div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Transferred</div><div className="text-4xl font-black text-emerald-400">2,142</div></div>
                            <div className="text-2xl font-black text-emerald-400">+8.4%</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Real Estate */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/5 p-8 sm:p-14 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl group-hover:bg-emerald-600/20 transition-all duration-500 -z-10"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10 items-center">
                    <div className="order-2 lg:order-1 bg-slate-950 rounded-2xl border border-white/5 p-8 flex flex-col justify-center space-y-4 font-mono text-xs">
                        <div className="text-emerald-400 font-bold mb-2 uppercase tracking-widest">tool_call: check_availability</div>
                        <div className="border-l-2 border-slate-800 pl-4 py-2 space-y-2">
                            <div className="text-slate-500">input: {`{ "property": "123 Main St", "date": "Tomorrow" }`}</div>
                            <div className="text-slate-300 italic">result: "Available slots: 10AM, 2:30PM"</div>
                        </div>
                        <div className="text-blue-400 font-bold mt-4 uppercase tracking-widest">agent_response:</div>
                        <div className="border-l-2 border-slate-800 pl-4 py-2 text-white italic">"I have availability at 10 AM or 2:30 PM. Which works best for you?"</div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <Building className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Real Estate Scheduling.</h2>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed mb-8">
                            Never miss a lead from a sign rider. When buyers or renters call, the AI answers immediately, checks your live availability, and books a showing directly on your calendar.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center text-sm font-black text-white"><Check className="text-emerald-500 mr-3 w-5 h-5"/> Live MLS data retrieval</li>
                            <li className="flex items-center text-sm font-black text-white"><Check className="text-emerald-500 mr-3 w-5 h-5"/> Direct Cal.com / Calendly sync</li>
                            <li className="flex items-center text-sm font-black text-white"><Check className="text-emerald-500 mr-3 w-5 h-5"/> 24/7 immediate inquiry handling</li>
                        </ul>
                    </div>
                </div>
            </motion.div>

            {/* Healthcare */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/5 p-8 sm:p-14 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all duration-500 -z-10"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10 items-center">
                    <div>
                        <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 text-purple-400 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                            <Stethoscope className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Medical & Healthcare.</h2>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed mb-8">
                            Reduce no-shows and automate routine phone tasks. The AI executes outbound confirmations and handles inbound appointment requests with a compassionate, professional tone.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center text-sm font-black text-white"><Check className="text-purple-500 mr-3 w-5 h-5"/> Appointment confirmations</li>
                            <li className="flex items-center text-sm font-black text-white"><Check className="text-purple-500 mr-3 w-5 h-5"/> Secure emergency routing</li>
                            <li className="flex items-center text-sm font-black text-white"><Check className="text-purple-500 mr-3 w-5 h-5"/> Automated follow-up campaigns</li>
                        </ul>
                    </div>
                    <div className="bg-slate-950 rounded-2xl border border-white/5 p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-purple-600/5 blur-3xl" />
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-900 border-4 border-purple-500/30 text-4xl font-black text-purple-400 mb-6 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                            -40%
                        </div>
                        <h4 className="text-2xl font-black text-white mb-2 relative z-10">No-Show Reduction</h4>
                        <p className="text-sm text-slate-500 font-medium relative z-10">Achieved via automated conversational confirmation reminders.</p>
                    </div>
                </div>
            </motion.div>

        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-slate-900/60 border-t border-white/5 text-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
         <div className="relative z-10 max-w-4xl mx-auto px-4">
             <h2 className="text-5xl font-black text-white mb-10 tracking-tighter leading-tight">Ready to see it work for <br />your industry?</h2>
             <Link href="/contact" className="inline-flex items-center justify-center px-10 py-5 text-lg font-black text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 group">
                Request a Custom Demo
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
             </Link>
         </div>
      </section>

    </div>
  );
}