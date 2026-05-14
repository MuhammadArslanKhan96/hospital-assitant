"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function MarketingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // --- 1. Three.js Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- 2. Particle Geometry Generation (BufferGeometry) ---
    const particleCount = 20000; // Increased density
    const geometry = new THREE.BufferGeometry();

    // We will define states: Sphere, Twisted Wave, Network Chaos, Double Helix, and Supernova/Core
    const positionsSphere = new Float32Array(particleCount * 3);
    const positionsWave = new Float32Array(particleCount * 3);
    const positionsNetwork = new Float32Array(particleCount * 3);
    const positionsHelix = new Float32Array(particleCount * 3);
    const positionsSupernova = new Float32Array(particleCount * 3);

    // Initial positions array that we will morph
    const positions = new Float32Array(particleCount * 3);

    const colorsSphere = new Float32Array(particleCount * 3);
    const colorsWave = new Float32Array(particleCount * 3);
    const colorsNetwork = new Float32Array(particleCount * 3);
    const colorsHelix = new Float32Array(particleCount * 3);
    const colorsSupernova = new Float32Array(particleCount * 3);

    // Current colors array that we will morph
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00ff88); // Logo Green
    const color2 = new THREE.Color(0x00ff88); // Logo Green
    const color3 = new THREE.Color(0x00d0ff); // Logo Blue (Cyan)
    const color4 = new THREE.Color(0x0070ff); // Logo Deep Blue
    const color5 = new THREE.Color(0x00ff88); // Back to Green for Supernova core highlights

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Generate State 1: Sphere
      const rSphere = 8 * Math.cbrt(Math.random());
      const thetaSphere = Math.random() * 2 * Math.PI;
      const phiSphere = Math.acos(2 * Math.random() - 1);

      const sx = rSphere * Math.sin(phiSphere) * Math.cos(thetaSphere);
      const sy = rSphere * Math.sin(phiSphere) * Math.sin(thetaSphere);
      const sz = rSphere * Math.cos(phiSphere);

      positionsSphere[i3] = sx;
      positionsSphere[i3 + 1] = sy;
      positionsSphere[i3 + 2] = sz;

      colorsSphere[i3] = color1.r;
      colorsSphere[i3 + 1] = color1.g;
      colorsSphere[i3 + 2] = color1.b;

      // Generate State 2: Twisted Wave
      const wx = (Math.random() - 0.5) * 60;
      const wy = Math.sin(wx * 0.2) * 5 + (Math.random() - 0.5) * 8;
      const wz = Math.cos(wx * 0.2) * 5 + (Math.random() - 0.5) * 8;

      positionsWave[i3] = wx;
      positionsWave[i3 + 1] = wy;
      positionsWave[i3 + 2] = wz;

      colorsWave[i3] = color2.r;
      colorsWave[i3 + 1] = color2.g;
      colorsWave[i3 + 2] = color2.b;

      // Generate State 3: Neural Net (Interconnected Lattice)
      // We create a series of "nodes" and distribute particles along the paths between them
      const nodeCount = 20;
      const getLayerNode = (idx: number) => {
        const angle = (idx / nodeCount) * Math.PI * 2;
        const radius = 15 + Math.sin(idx * 0.5) * 5;
        return {
          x: Math.cos(angle) * radius,
          y: (Math.random() - 0.5) * 25,
          z: Math.sin(angle) * radius
        };
      };

      const nodeA = getLayerNode(i % nodeCount);
      const nodeB = getLayerNode((i + 7) % nodeCount); // Interconnect
      const lerpT = Math.random();

      positionsNetwork[i3] = THREE.MathUtils.lerp(nodeA.x, nodeB.x, lerpT) + (Math.random() - 0.5) * 1.5;
      positionsNetwork[i3 + 1] = THREE.MathUtils.lerp(nodeA.y, nodeB.y, lerpT) + (Math.random() - 0.5) * 1.5;
      positionsNetwork[i3 + 2] = THREE.MathUtils.lerp(nodeA.z, nodeB.z, lerpT) + (Math.random() - 0.5) * 1.5;

      colorsNetwork[i3] = color3.r;
      colorsNetwork[i3 + 1] = color3.g;
      colorsNetwork[i3 + 2] = color3.b;

      // Generate State 4: Double Helix (Dense and tall)
      const tHelix = i / particleCount * Math.PI * 40; // More twists
      const rHelix = 12 + (Math.random() * 2); // Thicker radius
      const strand = i % 2 === 0 ? 1 : -1; // Two opposite strands
      const hx = Math.cos(tHelix + (strand * Math.PI)) * rHelix;
      const hy = (i / particleCount - 0.5) * 100; // Taller
      const hz = Math.sin(tHelix + (strand * Math.PI)) * rHelix;

      positionsHelix[i3] = hx + (Math.random() - 0.5) * 2; // Add some noise
      positionsHelix[i3 + 1] = hy;
      positionsHelix[i3 + 2] = hz + (Math.random() - 0.5) * 2;

      colorsHelix[i3] = color4.r;
      colorsHelix[i3 + 1] = color4.g;
      colorsHelix[i3 + 2] = color4.b;

      // Generate State 5: Supernova Core (Dense glowing center filling screen)
      const angleSN1 = Math.random() * Math.PI * 2;
      const angleSN2 = Math.random() * Math.PI * 2;
      // Use gaussian-like distribution to make it very dense in center but explosive
      const rSN = Math.pow(Math.random(), 3) * 35;

      const rx = Math.sin(angleSN1) * Math.cos(angleSN2) * rSN;
      const ry = Math.sin(angleSN1) * Math.sin(angleSN2) * rSN;
      const rz = Math.cos(angleSN1) * rSN;

      positionsSupernova[i3] = rx;
      positionsSupernova[i3 + 1] = ry;
      positionsSupernova[i3 + 2] = rz;

      // Interpolate color based on distance from core (Yellow to Red)
      const coreFactor = 1.0 - Math.min(rSN / 35, 1.0);
      colorsSupernova[i3] = THREE.MathUtils.lerp(color5.r, color4.r, coreFactor);
      colorsSupernova[i3 + 1] = THREE.MathUtils.lerp(color5.g, color4.g, coreFactor);
      colorsSupernova[i3 + 2] = THREE.MathUtils.lerp(color5.b, color4.b, coreFactor);

      // Initialize default
      positions[i3] = sx;
      positions[i3 + 1] = sy;
      positions[i3 + 2] = sz;

      colors[i3] = color1.r;
      colors[i3 + 1] = color1.g;
      colors[i3 + 2] = color1.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom shader material for glowy particles
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- 3. GSAP Timeline & ScrollTrigger ---

    const progressProxy = {
      morph1: 0, // Sphere -> Wave
      morph2: 0, // Wave -> Network
      morph3: 0, // Network -> Helix
      morph4: 0, // Helix -> Supernova
      cameraZ: 25, // Start further back
      cameraY: 0,
      rotationY: 0,
      rotationX: 0
    };

    camera.position.z = 25;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom-=100vh', // Exactly when Section 5 (Absolute Scale) begins entering full view
        scrub: 0.5, // Reduced scrub for much tighter timing
      }
    });

    // Animate to Wave
    tl.to(progressProxy, {
      morph1: 1,
      cameraZ: 20, // Keep visible
      rotationY: Math.PI / 2,
      ease: 'power1.inOut',
      duration: 1
    }, 0);

    // Animate to Network
    tl.to(progressProxy, {
      morph2: 1,
      cameraZ: 35, // Pull out slightly for big network
      rotationX: Math.PI / 4,
      ease: 'power1.inOut',
      duration: 1
    }, 1);

    // Animate to Helix
    tl.to(progressProxy, {
      morph3: 1,
      cameraZ: 30, // Stay close to helix
      cameraY: -15, // Look down its length
      rotationY: Math.PI,
      ease: 'power1.inOut',
      duration: 1
    }, 2);

    // Animate to Supernova Core
    tl.to(progressProxy, {
      morph4: 1,
      cameraZ: 40, // Fly into the core
      cameraY: 0,
      rotationX: Math.PI / 8,
      ease: 'power1.inOut',
      duration: 1
    }, 3);

    // --- 4. Render Loop ---
    let rafId: number;

    const render = (time: number) => {
      const timeMs = time * 0.001;
      
      // Rotate the entire particle system slowly over time
      particles.rotation.y = timeMs * 0.1 + progressProxy.rotationY;
      particles.rotation.x = timeMs * 0.05 + progressProxy.rotationX;

      // Update camera
      camera.position.z = progressProxy.cameraZ;
      camera.position.y = progressProxy.cameraY;
      camera.lookAt(0, 0, 0);

      // Perform Morph Lerping
      const positionsAttribute = geometry.attributes.position as THREE.BufferAttribute;
      const colorsAttribute = geometry.attributes.color as THREE.BufferAttribute;

      const posArray = positionsAttribute.array as Float32Array;
      const colArray = colorsAttribute.array as Float32Array;

      // Morph logic:
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        let px, py, pz;
        let cr, cg, cb;

        if (progressProxy.morph1 < 1) {
          // Lerp Sphere to Wave
          const t = progressProxy.morph1;
          px = THREE.MathUtils.lerp(positionsSphere[i3], positionsWave[i3], t);
          py = THREE.MathUtils.lerp(positionsSphere[i3 + 1], positionsWave[i3 + 1], t);
          pz = THREE.MathUtils.lerp(positionsSphere[i3 + 2], positionsWave[i3 + 2], t);

          cr = THREE.MathUtils.lerp(colorsSphere[i3], colorsWave[i3], t);
          cg = THREE.MathUtils.lerp(colorsSphere[i3 + 1], colorsWave[i3 + 1], t);
          cb = THREE.MathUtils.lerp(colorsSphere[i3 + 2], colorsWave[i3 + 2], t);
        } else if (progressProxy.morph2 < 1) {
          // Lerp Wave to Network
          const t = progressProxy.morph2;
          px = THREE.MathUtils.lerp(positionsWave[i3], positionsNetwork[i3], t);
          py = THREE.MathUtils.lerp(positionsWave[i3 + 1], positionsNetwork[i3 + 1], t);
          pz = THREE.MathUtils.lerp(positionsWave[i3 + 2], positionsNetwork[i3 + 2], t);

          cr = THREE.MathUtils.lerp(colorsWave[i3], colorsNetwork[i3], t);
          cg = THREE.MathUtils.lerp(colorsWave[i3 + 1], colorsNetwork[i3 + 1], t);
          cb = THREE.MathUtils.lerp(colorsWave[i3 + 2], colorsNetwork[i3 + 2], t);
        } else if (progressProxy.morph3 < 1) {
          // Lerp Network to Helix
          const t = progressProxy.morph3;
          px = THREE.MathUtils.lerp(positionsNetwork[i3], positionsHelix[i3], t);
          py = THREE.MathUtils.lerp(positionsNetwork[i3 + 1], positionsHelix[i3 + 1], t);
          pz = THREE.MathUtils.lerp(positionsNetwork[i3 + 2], positionsHelix[i3 + 2], t);

          cr = THREE.MathUtils.lerp(colorsNetwork[i3], colorsHelix[i3], t);
          cg = THREE.MathUtils.lerp(colorsNetwork[i3 + 1], colorsHelix[i3 + 1], t);
          cb = THREE.MathUtils.lerp(colorsNetwork[i3 + 2], colorsHelix[i3 + 2], t);
        } else {
          // Lerp Helix to Supernova Core
          const t = progressProxy.morph4;
          px = THREE.MathUtils.lerp(positionsHelix[i3], positionsSupernova[i3], t);
          py = THREE.MathUtils.lerp(positionsHelix[i3 + 1], positionsSupernova[i3 + 1], t);
          pz = THREE.MathUtils.lerp(positionsHelix[i3 + 2], positionsSupernova[i3 + 2], t);

          cr = THREE.MathUtils.lerp(colorsHelix[i3], colorsSupernova[i3], t);
          cg = THREE.MathUtils.lerp(colorsHelix[i3 + 1], colorsSupernova[i3 + 1], t);
          cb = THREE.MathUtils.lerp(colorsHelix[i3 + 2], colorsSupernova[i3 + 2], t);
        }

        // Add some noise based on time
        posArray[i3] = px + Math.sin(timeMs + i) * 0.05;
        posArray[i3 + 1] = py + Math.cos(timeMs + i) * 0.05;
        posArray[i3 + 2] = pz;

        colArray[i3] = cr;
        colArray[i3 + 1] = cg;
        colArray[i3 + 2] = cb;
      }

      positionsAttribute.needsUpdate = true;
      colorsAttribute.needsUpdate = true;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    // --- 5. Resize Handler ---
    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Ensure ScrollTrigger gets refreshed to correct heights
    const timeoutId = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Text Animation Setup
  useEffect(() => {
    const texts = document.querySelectorAll('.anim-text');

    texts.forEach((text) => {
      // Check if it's a button/link for faster animation
      const isButton = text.tagName.toLowerCase() === 'a' || text.classList.contains('anim-fast');

      gsap.fromTo(text,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: isButton ? 0.6 : 1.5,
          ease: isButton ? "back.out(1.5)" : "power4.out",
          scrollTrigger: {
            trigger: text,
            start: "top 85%",
            end: "bottom 20%",
            scrub: isButton ? false : 1, // Buttons snap into place instead of scrubbing
            toggleActions: isButton ? "play none none reverse" : undefined
          }
        }
      );
    });
  }, []);

  return (
    <div ref={containerRef} className="relative w-full text-white">
      {/* Fixed 3D Canvas Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full flex flex-col items-center">

        {/* Section 1: The Intro */}
        <section className="h-[120vh] w-full flex flex-col justify-start items-center px-6 sm:px-12 text-center pt-20 sm:pt-24">
          <div className="mb-6 flex flex-col items-center justify-center opacity-0 anim-text" style={{ transform: 'translateY(100px)' }}>
            <div className="bg-black/50 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.2)] border border-white/10 backdrop-blur-md overflow-hidden mb-4 w-fit h-fit flex items-center justify-center">
              <img src="/logo.jpeg" alt="VirtualCall.AI Logo" className="w-56 sm:w-72 h-auto block" />
            </div>
            <span className="text-sm sm:text-base text-white font-bold tracking-[0.2em] uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              <strong className="text-white">VirtualCall.AI</strong> brings you
            </span>
          </div>
          <div className="max-w-7xl mx-auto overflow-visible pb-12">
            <h1 className="anim-text text-[12vw] sm:text-[9vw] font-black tracking-tighter leading-normal uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 drop-shadow-[0_0_25px_rgba(255,255,255,0.15)] text-shadow-xl shadow-black/50">
              Resonance.
            </h1>
          </div>
          <div className="mt-4 max-w-2xl overflow-visible">
            <p className="anim-text text-xl sm:text-2xl text-white font-medium tracking-wide leading-relaxed drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
              We engineer synthetic voices that don&apos;t just speak. They connect, persuade, and convert with perfect prosody.
            </p>
          </div>
        </section>

        {/* Section 2: The Morph / Scale */}
        <section className="h-[150vh] w-full flex flex-col justify-center px-6 sm:px-24">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              {/* Spacer for 3D visibility */}
            </div>
            <div className="order-1 md:order-2 space-y-8 backdrop-blur-3xl bg-white/[0.02] border border-white/5 p-12 rounded-[2rem] shadow-2xl">
              <div className="overflow-hidden pb-4">
                 <h2 className="anim-text text-5xl sm:text-7xl font-black tracking-tight leading-none text-white">
                   Flow State.
                 </h2>
              </div>
              <div className="overflow-hidden">
                <p className="anim-text text-lg text-slate-400 font-medium leading-relaxed">
                  The architecture of conversation is fluid. Our agents adapt in real-time, parsing complex intent and delivering dynamic responses that flow naturally, keeping your users engaged and your sales pipeline moving.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: The Network (Data Integration) */}
        <section className="h-[150vh] w-full flex flex-col justify-center items-end px-6 sm:px-24">
           <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 backdrop-blur-3xl bg-white/[0.02] border border-white/5 p-12 rounded-[2rem] shadow-2xl">
              <div className="overflow-visible pb-4">
                 <h2 className="anim-text text-5xl sm:text-7xl font-black tracking-tight leading-none text-white pb-4">
                   Neural Sync.
                 </h2>
              </div>
              <div className="overflow-visible">
                <p className="anim-text text-lg text-slate-400 font-medium leading-relaxed">
                  We don&apos;t just make calls; we execute dynamic tools. Equip your AI with the ability to check availability, capture rich leads, transfer live calls, and automatically book appointments directly into your systems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Campaigns & Outbound (Helix) */}
        <section className="h-[150vh] w-full flex flex-col justify-center px-6 sm:px-24">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              {/* Spacer for 3D visibility */}
            </div>
            <div className="order-1 md:order-2 space-y-8 backdrop-blur-3xl bg-white/[0.02] border border-white/5 p-12 rounded-[2rem] shadow-2xl">
              <div className="overflow-visible pb-4">
                 <h2 className="anim-text text-5xl sm:text-7xl font-black tracking-tight leading-none text-white pb-4">
                   Mass Persuasion.
                 </h2>
              </div>
              <div className="overflow-visible">
                <p className="anim-text text-lg text-slate-400 font-medium leading-relaxed">
                  Launch massive outbound campaigns with a single click. Our built-in DNC scrubbing and SMS consent management ensure you scale safely, while our analytics dashboard tracks every conversion, cost, and transcript in real-time.
                </p>
              </div>

              <div className="pt-8 overflow-visible">
                <Link href="/dashboard" className="anim-text inline-block px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-vc-cyan hover:text-white transition-all duration-300">
                  Access Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Final Call to Action */}
        <section className="h-[100vh] w-full flex flex-col justify-center items-center px-6 sm:px-12 text-center">
           <div className="max-w-5xl mx-auto overflow-visible pb-12">
            <h1 className="anim-text text-[8vw] sm:text-[6vw] font-black tracking-tighter leading-normal uppercase text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Absolute Scale.
            </h1>
          </div>
          <div className="mt-4 max-w-xl overflow-visible pb-8">
             <p className="anim-text text-xl text-white font-semibold tracking-wide leading-relaxed drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
               Infinite capacity for your business. Zero missed leads. Deploy a bespoke AI voice workforce that responds to every customer instantly, regardless of volume. No hold times, no overhead—just absolute performance.
             </p>
          </div>
          <div className="mt-8 overflow-visible">
            <Link href="/contact" className="anim-text inline-flex items-center justify-center px-12 py-5 text-lg font-black text-vc-dark bg-vc-cyan rounded-full hover:bg-white hover:text-black transition-all shadow-[0_0_40px_rgba(0,255,255,0.3)] active:scale-95">
                Initiate Sequence
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
