"use client";

import { LenisProvider } from "@/components/providers/lenis-provider";
import "@/app/globals.css";
import React from 'react';
import { motion, useScroll, useSpring } from "framer-motion";
import { Header } from '@/components/ui/header-3';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <LenisProvider>
      <div className="bg-[#050505] min-h-screen font-sans selection:bg-vc-cyan selection:text-white isolate flex flex-col">
        {/* Cinematic Film Grain Overlay */}
        <div
          className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* New Enterprise Header */}
        <Header />

        {/* Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[3px] bg-vc-cyan z-[100] origin-left"
          style={{ scaleX }}
        />

        {/* Main Content Area */}
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </LenisProvider>
  );
}
