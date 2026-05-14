'use client';

import { motion } from 'framer-motion';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { ArrowRight, BarChart3, Ship, Zap, Users, Globe } from 'lucide-react';
import Link from 'next/link';

export default function ShipSearchCaseStudy() {
  return (
    <div className="pt-32 pb-20 sm:pt-48 sm:pb-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero */}
        <div className="max-w-3xl mb-24">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 mb-8 tracking-widest uppercase"
            >
                Logistics & Global Trade
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl sm:text-7xl font-black text-white tracking-tighter leading-none mb-8"
            >
                Scaling Global <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Ship Brokerage.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-400 leading-relaxed"
            >
                How ShipSearch used VirtualCall.AI to automate 15,000+ weekly outbound verification calls across 50 countries without increasing headcount.
            </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
                { label: 'Weekly Calls', value: '15,000+', icon: Ship },
                { label: 'Time Saved', value: '85%', icon: Zap },
                { label: 'ROI First Month', value: '4.2x', icon: BarChart3 },
            ].map((stat, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="p-8 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl"
                >
                    <stat.icon className="w-8 h-8 text-blue-400 mb-6" />
                    <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                </motion.div>
            ))}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-32 text-slate-300">
            <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">The Challenge</h2>
                <p className="leading-relaxed">
                    ShipSearch manages a massive database of vessel movements and cargo opportunities. Their team was spending over 60 hours a week manually calling port agents and brokers to verify logistics data. The manual process was slow, prone to errors, and couldn't scale to meet their global expansion targets.
                </p>
                <div className="p-6 bg-blue-500/5 border-l-4 border-blue-500 rounded-r-2xl italic">
                    "We were losing data accuracy because our team couldn't call people fast enough. We needed a solution that sounded professional and could handle complex logistics terminology."
                </div>
            </div>
            <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">The VirtualCall Solution</h2>
                <p className="leading-relaxed">
                    VirtualCall.AI deployed a fleet of specialized "Logistics Verification Agents" trained on ShipSearch's unique vocabulary. These agents automatically dial port authorities and agents based on real-time triggers from the ShipSearch CRM.
                </p>
                <ul className="space-y-4">
                    <li className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">✓</div>
                        <span>Multilingual support for 50+ port regions.</span>
                    </li>
                    <li className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">✓</div>
                        <span>Real-time CRM sync with zero human intervention.</span>
                    </li>
                    <li className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">✓</div>
                        <span>Automated hot-transfers for high-priority inquiries.</span>
                    </li>
                </ul>
            </div>
        </div>

        {/* Bottom CTA */}
        <section className="py-20 border-t border-white/5 text-center relative">
             <div className="max-w-2xl mx-auto">
                <h3 className="text-4xl font-bold text-white mb-8 tracking-tight">Ready for similar results?</h3>
                <Link href="/contact" className="inline-flex items-center justify-center px-10 py-5 text-lg font-black text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 group">
                    Start Your Sandbox
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
        </section>

      </div>
    </div>
  );
}
