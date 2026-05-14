"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Settings,
  LogOut,
  Phone,
  Calendar,
  BarChart,
  Bot,
  DollarSign,
  Wrench,
  CreditCard,
  PhoneOutgoing,
  Contact,
  Inbox,
  Mic,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardLayoutShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  const NavItem = ({
    href,
    icon: Icon,
    children: label,
  }: {
    href: string;
    icon: any;
    children: React.ReactNode;
  }) => {
    const isActive =
      href === "/dashboard" || href === "/admin"
        ? pathname === href
        : pathname === href || pathname?.startsWith(href + "/");

    return (
      <Link
        href={href}
        className={`group relative flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/60"
            : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
        }`}
      >
        {/*
          DESIGN UPDATE: Removed the bg-vc-green and conditional classes here.
          The icon background is now always neutral (bg-slate-100), and the
          icon color itself updates based on the 'isActive' prop.
        */}
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 transition-all duration-200 ${
            isActive
              ? "text-slate-900" // active state color
              : "text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <span className="flex-1">{label}</span>
        {isActive && <ChevronRight className="w-3 h-3 text-slate-400" />}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans selection:bg-vc-green/20">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-[#F1F5F9]/80 backdrop-blur-xl border-r border-slate-200/60 transform transition-all duration-300 ease-in-out flex flex-col
        lg:relative lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Brand Logo & Design Update */}
        <div className="flex items-center justify-between h-20 px-6 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-1.5 group">
            {/* 
              DESIGN UPDATE: 
              1. Removed /roxan_profile.jpg
              2. Replaced with attractive text "Rox Ai" 
            */}
            <div className="flex items-baseline gap-1 group">
              <span className="text-2xl font-black text-slate-900 tracking-tighter transition-colors group-hover:text-indigo-600">
                Rox
              </span>
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-lg font-semibold text-slate-500">Ai</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-full hover:bg-slate-200/50 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {!isAdmin && (
            <>
              <NavItem href="/dashboard" icon={Home}>
                Dashboard
              </NavItem>
              <NavItem href="/dashboard/agents" icon={Bot}>
                AI Agents
              </NavItem>
              <NavItem href="/dashboard/tools" icon={Wrench}>
                Tools
              </NavItem>
              <NavItem href="/dashboard/campaigns" icon={PhoneOutgoing}>
                Campaigns
              </NavItem>
              <NavItem
                href="/dashboard/outbound-results"
                icon={(props: any) => (
                  <svg
                    {...props}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                )}
              >
                Outbound Results
              </NavItem>
              <NavItem href="/dashboard/contacts" icon={Contact}>
                Audience
              </NavItem>
              <NavItem href="/dashboard/calls" icon={Phone}>
                Calls
              </NavItem>
              <NavItem href="/dashboard/appointments" icon={Calendar}>
                Appointments
              </NavItem>
              <NavItem href="/reports" icon={BarChart}>
                Reports
              </NavItem>
              <NavItem href="/dashboard/billing" icon={CreditCard}>
                Billing
              </NavItem>
              <NavItem href="/settings" icon={Settings}>
                Settings
              </NavItem>
            </>
          )}

          {isAdmin && (
            <div className="mt-8">
              <div className="px-4 mb-3 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                Admin Engine
              </div>
              <div className="space-y-1.5">
                <NavItem href="/admin" icon={Users}>
                  Tenants
                </NavItem>
                <NavItem href="/admin/billing" icon={DollarSign}>
                  Revenue
                </NavItem>
                <NavItem href="/admin/calls" icon={BarChart}>
                  Simulation
                </NavItem>
                <NavItem href="/admin/catalog" icon={Wrench}>
                  Catalog
                </NavItem>
                <NavItem href="/admin/tools" icon={Wrench}>
                  Custom Tools
                </NavItem>
                <NavItem href="/admin/numbers" icon={Phone}>
                  Inventory
                </NavItem>
                <NavItem href="/admin/contacts" icon={Inbox}>
                  Requests
                </NavItem>
                <NavItem href="/admin/demo-agent" icon={Mic}>
                  Demo Unit
                </NavItem>
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto border-t border-slate-200/60">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="group flex items-center w-full px-3 py-2.5 text-[13px] font-medium text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-red-100 transition-colors mr-3">
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white m-0 lg:m-2 lg:ml-0 lg:rounded-3xl lg:border lg:border-slate-200 shadow-sm overflow-hidden">
        <header className="flex items-center justify-between h-16 lg:h-18 px-6 lg:px-10 bg-white/50 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold text-slate-900">
                VirtualCall Engine
              </h2>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Instance: v2.4.0-stable
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-slate-900">
                Account Active
              </span>
              <span className="text-[10px] text-vc-green uppercase tracking-tight">
                Pro Plan
              </span>
            </div>
            <button className="relative w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-md transition-all">
              <Users className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-vc-green border-2 border-white rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto p-6 lg:p-10 pb-20">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
