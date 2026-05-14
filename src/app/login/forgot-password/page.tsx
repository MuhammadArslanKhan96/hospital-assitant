'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send reset link');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 font-sans p-4 overflow-hidden relative">
      {/* Aurora Background */}
      <div className="aurora-bg">
        <div className="aurora-blob aurora-1"></div>
        <div className="aurora-blob aurora-2"></div>
        <div className="aurora-blob aurora-3"></div>
      </div>

      <style jsx>{`
        .aurora-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
          filter: blur(60px);
          opacity: 0.85;
        }
        .aurora-blob {
          position: absolute;
          border-radius: 50%;
        }
        .aurora-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(0, 255, 136, 0.4) 0%, transparent 70%);
          top: -10%;
          left: -10%;
          animation: aurora-drift-1 12s ease-in-out infinite alternate;
        }
        .aurora-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(0, 208, 255, 0.45) 0%, transparent 70%);
          top: 20%;
          right: -5%;
          animation: aurora-drift-2 14s ease-in-out infinite alternate;
        }
        .aurora-3 {
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(0, 255, 136, 0.3) 0%, transparent 70%);
          bottom: -15%;
          left: 20%;
          animation: aurora-drift-3 16s ease-in-out infinite alternate;
        }
        @keyframes aurora-drift-1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-40px, 100px) scale(1.05); }
        }
        @keyframes aurora-drift-2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, -30px) scale(1.2); }
        }
        @keyframes aurora-drift-3 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-50px, -40px) scale(1.15); }
        }
      `}</style>

      {/* Backlink */}
      <div className="fixed top-8 left-8 z-50">
        <Link
          href="/login"
          className="flex items-center text-sm font-semibold text-slate-300 hover:text-white transition-colors bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800 backdrop-blur-xl shadow-2xl active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>
      </div>

      {/* Brand Header */}
      <div className="mb-10 text-center flex flex-col items-center relative z-10">
        <img src="/logo.jpeg" alt="VirtualCall.AI Logo" className="h-14 w-auto object-contain rounded" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden relative z-10">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-500"></div>

        <div className="p-8 sm:p-10">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2 text-center">Reset your password</h2>
          <p className="text-sm text-slate-500 text-center mb-6 font-medium">Enter your email and we'll send you a recovery link.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center">
              <span className="text-sm font-semibold text-red-600">{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <p className="text-lg font-bold text-slate-900">Email Sent!</p>
              <p className="text-sm text-slate-500 font-medium">Check your inbox for a password reset link.</p>
              <Link href="/login" className="mt-4 inline-block w-full text-center px-4 py-3 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center px-4 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-xl hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-indigo-500/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Recovery Link
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
