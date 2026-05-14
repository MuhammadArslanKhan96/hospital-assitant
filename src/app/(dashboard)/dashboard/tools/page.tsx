import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Mail,
  Phone,
  Inbox,
  ArrowRight,
  Zap,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ToolsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tenantId = session.tenantId;

  // Fetch tenant's custom tools - Logic remains identical
  const customTools = await prisma.tool.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-20">
      {/* Refined Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-vc-green animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              System Integrations
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Custom Tools
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Manage and monitor specialized AI agent capabilities.
          </p>
        </div>

        {customTools.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-600">
              {customTools.length} Active Tools
            </span>
          </div>
        )}
      </div>

      {customTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {customTools.map((tool) => (
            <div
              key={tool.id}
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-vc-green/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-vc-green group-hover:bg-vc-green/5 transition-colors border border-slate-100">
                  <Inbox className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-md uppercase tracking-tighter">
                  {tool.actionType}
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
                {tool.name.replace(/_/g, " ")}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-grow">
                {tool.description}
              </p>

              <Link
                href={`/dashboard/tools/${tool.id}/submissions`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 text-slate-900 text-xs font-bold border border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all"
              >
                View Submissions
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        /* Minimalist Empty State */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                Supercharge your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-vc-green to-emerald-600">
                  AI Workflows.
                </span>
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed max-w-md">
                You haven't deployed any custom tools yet. Our team can build
                bespoke integrations that allow your agents to process orders,
                update CRMs, or trigger external APIs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <Zap className="w-5 h-5 text-vc-green mb-2" />
                <p className="text-xs font-bold text-slate-900">
                  API Triggering
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  Connect agents to your internal backends.
                </p>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <ShieldCheck className="w-5 h-5 text-vc-green mb-2" />
                <p className="text-xs font-bold text-slate-900">Secure Data</p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  Handled with enterprise-grade encryption.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-vc-green/10 blur-[80px] rounded-full" />

            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">
              Request Integration
            </h3>

            <div className="space-y-6">
              <a
                href="mailto:support@virtualcall.ai"
                className="flex items-center gap-5 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-vc-green group-hover:text-slate-900 transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Support Email
                  </span>
                  <span className="text-sm font-bold tracking-tight">
                    support@virtualcall.ai
                  </span>
                </div>
              </a>

              <div className="flex items-start gap-5 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-vc-green group-hover:text-slate-900 transition-all mt-1">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Direct Lines
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-bold tracking-tight">
                      +1 (817) 875-7777
                    </p>
                    <p className="text-sm font-bold tracking-tight">
                      +1 (817) 863-3000
                    </p>
                    <p className="text-sm font-bold tracking-tight text-slate-400">
                      +1 (505) 596-9776
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold"
                  >
                    Dev
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 font-bold">
                Engineers available now
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
