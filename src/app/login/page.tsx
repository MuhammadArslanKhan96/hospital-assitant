"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ArrowRight, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.toLowerCase(), password }),
    });

    if (res.ok) {
      const data = await res.json();

      // Check for callbackUrl in search params
      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get("callbackUrl");

      if (callbackUrl) {
        window.location.href = callbackUrl;
      } else {
        // Fallback: Strict Redirection based on Role
        if (data.user.role === "SUPER_ADMIN") {
          window.location.href = "/admin"; // Force full reload to update sidebar state
        } else {
          window.location.href = "/dashboard";
        }
      }
    } else {
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen font-sans p-4 overflow-hidden bg-slate-950">
      {/* Aurora Background */}
      <div className="aurora-bg">
        <div className="aurora-blob aurora-1"></div>
        <div className="aurora-blob aurora-2"></div>
        <div className="aurora-blob aurora-3"></div>
        <div className="aurora-blob aurora-4"></div>
      </div>

      {/* Inline Aurora Styles */}
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
          background: radial-gradient(
            circle,
            rgba(0, 255, 136, 0.4) 0%,
            transparent 70%
          );
          top: -10%;
          left: -10%;
          animation: aurora-drift-1 12s ease-in-out infinite alternate;
        }
        .aurora-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(
            circle,
            rgba(0, 208, 255, 0.45) 0%,
            transparent 70%
          );
          top: 20%;
          right: -5%;
          animation: aurora-drift-2 14s ease-in-out infinite alternate;
        }
        .aurora-3 {
          width: 700px;
          height: 700px;
          background: radial-gradient(
            circle,
            rgba(0, 255, 136, 0.3) 0%,
            transparent 70%
          );
          bottom: -15%;
          left: 20%;
          animation: aurora-drift-3 16s ease-in-out infinite alternate;
        }
        .aurora-4 {
          width: 400px;
          height: 400px;
          background: radial-gradient(
            circle,
            rgba(0, 208, 255, 0.35) 0%,
            transparent 70%
          );
          top: 50%;
          left: 50%;
          animation: aurora-drift-4 10s ease-in-out infinite alternate;
        }
        @keyframes aurora-drift-1 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(80px, 60px) scale(1.15);
          }
          100% {
            transform: translate(-40px, 100px) scale(1.05);
          }
        }
        @keyframes aurora-drift-2 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-70px, 50px) scale(1.1);
          }
          100% {
            transform: translate(50px, -30px) scale(1.2);
          }
        }
        @keyframes aurora-drift-3 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(60px, -80px) scale(1.1);
          }
          100% {
            transform: translate(-50px, -40px) scale(1.15);
          }
        }
        @keyframes aurora-drift-4 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-90px, 40px) scale(1.2);
          }
          100% {
            transform: translate(40px, 70px) scale(0.95);
          }
        }
      `}</style>

      {/* Backlink to Home */}
      <div className="fixed top-8 left-8 z-50">
        <Link
          href="/"
          className="flex items-center text-sm font-semibold text-slate-300 hover:text-white transition-colors bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800 backdrop-blur-xl shadow-2xl active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      {/* Brand Header */}
      <div className="mb-10 text-center flex flex-col items-center relative z-10">
        <img
          src="/logo.jpeg"
          alt="VirtualCall.AI Logo"
          className="h-14 w-auto object-contain rounded"
        />
        <p className="text-sm font-medium text-slate-400 mt-4">
          Intelligent Voice Infrastructure
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden relative z-10">
        {/* Subtle top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-500"></div>

        <div className="p-8 sm:p-10">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-6 text-center">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center animate-in fade-in slide-in-from-top-4">
              <span className="text-sm font-semibold text-red-600">
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">
                  Password
                </label>
                <Link
                  href="/login/forgot-password"
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-xl hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-indigo-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-slate-500 relative z-10">
        &copy; {new Date().getFullYear()} VirtualCall.AI. All rights reserved.
      </p>
    </div>
  );
}
