"use client";
import React from 'react';
import { motion } from "framer-motion";

const FloatingPaths = React.memo(({ 
    count = 12, 
    opacity = 0.5, 
    duration = 20, 
    width = 1 
}: { 
    count?: number; 
    opacity?: number; 
    duration?: number; 
    width?: number;
}) => {
    const paths = React.useMemo(() => Array.from({ length: count }, (_, i) => {
        const xOffset = -300 + (i * 1200) / count;
        return {
            id: i,
            d: `M${xOffset} -100 C${xOffset + 200} 300 ${xOffset - 200} 700 ${xOffset + 300} 1100`,
            width: width + Math.random() * 0.5,
            duration: duration + Math.random() * 10,
            delay: Math.random() * -10,
        };
    }), [count, duration, width]);

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                fill="none"
            >
                <title>Aesthetic Energy Flows</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={opacity}
                        initial={{ pathLength: 0.1, opacity: 0 }}
                        animate={{
                            pathLength: [0.1, 0.6, 0.1],
                            opacity: [0, opacity, 0],
                            pathOffset: [0, 1.2],
                        }}
                        transition={{
                            duration: path.duration,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                            delay: path.delay,
                        }}
                        style={{
                            filter: "blur(2px)",
                            willChange: "transform, opacity",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
});

FloatingPaths.displayName = 'FloatingPaths';

export function BackgroundPaths({
    children,
    className = ""
}: {
    children?: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`relative w-full flex flex-col items-center justify-start overflow-hidden isolate ${className}`}>
            {/* Organic Parallax Background Layers - EXTREME REDUCTION FOR 512MB RAM */}
            <div className="absolute inset-0 z-[-1] pointer-events-none text-white/20">
                {/* Background Layer - Static + Deep */}
                <FloatingPaths count={1} opacity={0.05} duration={50} width={0.2} />
                
                {/* Midground Layer - Subtle */}
                <FloatingPaths count={2} opacity={0.1} duration={40} width={0.6} />
                
                {/* Foreground Layer - Minimal Glow */}
                <FloatingPaths count={1} opacity={0.2} duration={30} width={1.2} />
            </div>

            <div className="relative w-full flex-grow flex flex-col">
                {children}
            </div>
        </div>
    );
}
