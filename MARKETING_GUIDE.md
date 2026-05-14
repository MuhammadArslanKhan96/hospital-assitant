# VirtualCall.AI Marketing Site Guide

This document outlines the architecture, components, and styling conventions for the public-facing marketing site of VirtualCall.AI, located under `src/app/(marketing)`.

## Overview
The marketing site is designed to convey an "enterprise-grade" aesthetic, heavily inspired by platforms like Nextiva. It leverages a clean, high-contrast aesthetic (utilizing Tailwind's `slate`, `blue`, `indigo`, and `emerald` palettes), butter-smooth scroll animations via `framer-motion`, and interactive 3D elements.

## Pages
1. **Home (`/`)**: High-impact hero section with a dynamic BackgroundPaths SVG wrapper and an interactive 3D Spline robot. Includes a partner logo strip, feature grid, and industry use-case alternating layout.
2. **Features (`/features`)**: Deep dive into platform capabilities (Inbound, Outbound, Transfers, CRM, Analytics) paired with custom-crafted Tailwind "mock UI" illustrations. Features the "Army of Agents in 60 Seconds" 3-step rapid deployment guide.
3. **Solutions (`/solutions`)**: Industry-specific use cases (Sales, Real Estate, Healthcare, B2B Support). Uses a darker, high-contrast theme to differentiate from the core product pages.
4. **Contact (`/contact`)**: Sleek lead generation page featuring the parent company (Crossway Consulting) contact information and an interactive form layout.

## Layout & Navigation (`MarketingLayout`)
The entire marketing site is wrapped in `src/app/(marketing)/layout.tsx`.
- **Navbar**: Features a glassmorphism effect (`backdrop-blur-md bg-white/80`) that activates on scroll. Includes desktop links, CTA buttons ("Log In", "Get a Demo"), and an animated mobile menu dropdown.
- **Footer**: A heavy, dark-themed (`bg-slate-950`) enterprise footer with multiple link columns (Product, Solutions, Contact) and the company's copyright.

## Advanced UI Components (`src/components/ui/` & `src/components/blocks/`)

To achieve the enterprise look, several advanced, reusable components have been implemented:

### 1. `BackgroundPaths` (`src/components/ui/background-paths.tsx`)
An animated, infinitely looping SVG path background powered by `framer-motion`.
- **Usage**: Used to wrap the Hero sections of all four marketing pages.
- **Props**: Accepts `children` (to overlay the hero text/buttons) and an optional `className` for the outer wrapper.
- **Dependencies**: `framer-motion`

### 2. `InteractiveRobotSpline` (`src/components/blocks/interactive-3d-robot.tsx`)
A `Suspense`-wrapped lazy-loaded React wrapper for Spline 3D scenes.
- **Usage**: Located in the Homepage Hero section to provide an interactive, drag-to-rotate 3D visual representing the "AI Core".
- **Props**: `scene` (the `.splinecode` URL) and `className`.
- **Dependencies**: `@splinetool/react-spline`

### 3. Shadcn UI Base Components
To support modern, portable UI components, the repository now includes foundational setup for Shadcn UI:
- `src/lib/utils.ts` (exports `cn` combining `clsx` and `tailwind-merge`)
- `src/components/ui/button.tsx` (Standard cva-based button with variants)
- `src/components/ui/card.tsx` (Standard card layout blocks)
- **Dependencies**: `class-variance-authority`, `@radix-ui/react-slot`, `clsx`, `tailwind-merge`

## Animation Conventions
Throughout the marketing pages, `framer-motion` is used consistently via two main variant objects:
- `fadeUp`: Smoothly translates elements upward (`y: 30` to `y: 0`) while fading them in. Used on almost all text blocks and feature cards.
- `staggerContainer`: Applied to parent containers to automatically sequence the `fadeUp` animations of their children with a 0.15s delay.
- Scroll animations are triggered using `<motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>`.