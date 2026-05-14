'use client';

import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone, MapPin, Send, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function ContactPage() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setIsSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-slate-300 selection:bg-blue-600 selection:text-white min-h-screen">

      {/* Header */}
      <div className="pt-32 pb-20 sm:pt-48 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-3xl mx-auto">
            <h1 className="text-6xl sm:text-[100px] font-black text-white tracking-tighter leading-[0.85] mb-8">
              Let's build <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">something loud.</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed mb-10">
              Ready to deploy an army of AI agents? Fill out the form below and our team will get back to you within 24 hours.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

          {/* Contact Info */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-12">
            <div>
                <h2 className="text-3xl font-black text-white mb-6">Connect with us.</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                    Whether you need a custom enterprise sandbox or a deep dive into our SIP infrastructure, we're here to help.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-900/50 rounded-3xl border border-white/5 group hover:border-blue-500/50 transition-all">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-400 border border-blue-500/20 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                        <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-white font-bold mb-2">Email</h3>
                    <p className="text-sm text-slate-500">support@virtualcall.ai</p>

                </div>

                <div className="p-8 bg-slate-900/50 rounded-3xl border border-white/5 group hover:border-indigo-500/50 transition-all">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 border border-indigo-500/20 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
                        <Phone className="w-6 h-6" />
                    </div>
                    <h3 className="text-white font-bold mb-2">Phone</h3>
                    <p className="text-sm text-slate-500">+1 (817) 875-7777</p>
                </div>

                <div className="p-8 bg-slate-900/50 rounded-3xl border border-white/5 group hover:border-emerald-500/50 transition-all col-span-1 sm:col-span-2">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 border border-emerald-500/20 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="text-white font-bold mb-2">Office</h3>
                    <p className="text-sm text-slate-500">Based in Texas, serving clients globally.</p>
                </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 sm:p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />

             {isSuccess ? (
               <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-4 py-10">
                 <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-4">
                   <CheckCircle2 className="w-8 h-8" />
                 </div>
                 <h3 className="text-2xl font-black text-white">Message Sent!</h3>
                 <p className="text-slate-400">We'll get back to you within 24 hours.</p>
                 <button
                   onClick={() => setIsSuccess(false)}
                   className="mt-6 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-sm"
                 >
                   Send Another
                 </button>
               </div>
             ) : (
               <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">First Name</label>
                          <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Last Name</label>
                          <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="Doe" />
                      </div>
                  </div>
                  <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Work Email</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="john@company.com" />
                  </div>
                  <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Phone Number</label>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Message</label>
                      <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={4} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none" placeholder="Tell us about your voice automation needs..." />
                  </div>
                  <button disabled={isSubmitting} type="submit" className="w-full disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center group tracking-widest uppercase text-xs">
                      {isSubmitting ? 'Sending...' : (
                        <>Send Message <Send className="w-4 h-4 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                      )}
                  </button>
               </form>
             )}
          </motion.div>

        </div>
      </section>

      {/* Footer / FAQ Peek */}
      <section className="py-32 bg-slate-900/30 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-black text-white mb-12 tracking-tight">Rapid Support.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="p-8 rounded-2xl bg-slate-950/50 border border-white/5">
                    <h3 className="font-bold text-white mb-2">How fast can I get access?</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Sandbox access is usually granted within 2-4 hours of a demo request for qualified enterprise users.</p>
                </div>
                <div className="p-8 rounded-2xl bg-slate-950/50 border border-white/5">
                    <h3 className="font-bold text-white mb-2">Do you handle SIP trunking?</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Yes, we provide global outbound telecommunications infrastructure and domestic TDM bridging.</p>
                </div>
            </div>
        </div>
      </section>

    </div>
  );
}
