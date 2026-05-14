'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, Database, Server, FileCheck, ArrowRight, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
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
                Trust & Security Portal
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl sm:text-8xl font-black text-white tracking-tighter leading-none mb-10"
            >
                Enterprise-Grade <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Data Protection.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto"
            >
                VirtualCall.AI is built with a security-first architecture. We provide the infrastructure for the world's most demanding logistics and real estate firms.
            </motion.p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-32">
            {[
                { title: 'Data Encryption', desc: 'AES-256 for data at rest and TLS 1.3 for data in transit.', icon: Lock },
                { title: 'Privacy First', desc: 'GDPR, HIPAA, and SOC2 compliant infrastructure.', icon: ShieldCheck },
                { title: 'Access Control', desc: 'Secure SAML, SSO, and multi-factor authentication.', icon: UserCheck },
                { title: 'Regular Audits', desc: 'Bi-annual penetration testing by third-party experts.', icon: FileCheck },
            ].map((pillar, i) => (
                <div key={i} className="p-8 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl transition-all hover:bg-slate-900/60 group">
                    <pillar.icon className="w-10 h-10 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{pillar.desc}</p>
                </div>
            ))}
        </div>

        {/* Detailed Blocks */}
        <div className="space-y-32 mb-32">
            
            {/* Encryption Deep Dive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                    <h2 className="text-4xl font-black text-white mb-8 tracking-tight">End-to-End Encryption.</h2>
                    <p className="text-lg text-slate-400 mb-10">
                        Every voice session and transcription is stored with AES-256 encryption. We utilize industry-standard protocols to ensure that your customer interactions remain private.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]" />
                            <span className="font-bold text-slate-200">Transcription Data: Encrypted & Redacted</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]" />
                            <span className="font-bold text-slate-200">Voice Streams: Secure RTP (SRTP) Protocols</span>
                        </div>
                    </div>
                </div>
                <div className="p-10 bg-slate-950 rounded-3xl border border-white/5 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 text-blue-500/20">
                        <Lock className="w-32 h-32" />
                    </div>
                    <div className="space-y-4 relative z-10 font-mono text-xs">
                        <div className="text-blue-400">-- ENCRYPTION_LAYER_v4.2 --</div>
                        <div className="text-slate-600 truncate underline uppercase">KEY_ROTATION: SUCCESSFUL [10 HOURS AGO]</div>
                        <div className="p-4 bg-slate-900 rounded-lg text-slate-400 leading-relaxed border border-white/5 truncate">
                            0x4F2A7B9C1E3D5F8A... [SALTED_BYTES]
                        </div>
                        <div className="text-slate-600 uppercase">STATUS: SECURE_CHANNEL_READY</div>
                    </div>
                </div>
            </div>

            {/* Compliance Grid */}
            <div className="p-16 bg-blue-600/5 rounded-[4rem] border border-blue-500/10 text-center">
                <h2 className="text-4xl font-black text-white mb-6">Built for Compliance.</h2>
                <p className="text-slate-400 max-w-2xl mx-auto mb-16">
                    VirtualCall.AI respects national and global data regulations, providing the tools you need to stay compliant.
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 grayscale opacity-40 hover:opacity-100 transition-all">
                    <div className="flex flex-col items-center gap-4">
                        <ShieldCheck className="w-12 h-12" />
                        <span className="text-xs font-black uppercase tracking-widest">SOC 2 Type II</span>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <FileCheck className="w-12 h-12" />
                        <span className="text-xs font-black uppercase tracking-widest">HIPAA Ready</span>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <Eye className="w-12 h-12" />
                        <span className="text-xs font-black uppercase tracking-widest">GDPR Compliant</span>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <Server className="w-12 h-12" />
                        <span className="text-xs font-black uppercase tracking-widest">PCI DSS Level 1</span>
                    </div>
                </div>
            </div>

        </div>

        {/* Footer CTA */}
        <section className="py-20 border-t border-white/5 text-center">
             <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-black text-white mb-8 tracking-tight">Need a security assessment?</h3>
                <Link href="/contact" className="inline-flex items-center justify-center px-10 py-5 text-lg font-black text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 group">
                    Contact Trust Team 
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
        </section>

      </div>
    </div>
  );
}
