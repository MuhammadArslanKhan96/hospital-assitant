'use client';

import { useState, useEffect } from 'react';
import { Phone, Activity, Unlink, Trash2, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AgentListClient({ initialAgents, inventory, userRole }: { initialAgents: any[], inventory: any[], userRole?: string }) {
  const [agents, setAgents] = useState(initialAgents);
  const router = useRouter();
  const isAdmin = userRole === 'SUPER_ADMIN';
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Timer State for Pending Numbers
  const [timers, setTimers] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Initialize timers for any pending numbers
    const newTimers: { [key: string]: number } = {};
    agents.forEach(agent => {
      if (agent.phoneNumber && agent.phoneNumber.status === 'PENDING' && agent.phoneNumber.activatedAt) {
        const remaining = Math.max(0, Math.floor((new Date(agent.phoneNumber.activatedAt).getTime() - Date.now()) / 1000));
        if (remaining > 0) newTimers[agent.phoneNumber.id] = remaining;
      }
    });
    setTimers(newTimers);

    // Countdown Interval
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        let changed = false;
        Object.keys(updated).forEach(id => {
          if (updated[id] > 0) {
            updated[id]--;
            changed = true;
          }
        });
        if (!changed) return prev; // Avoid re-render if nothing changed
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Run once on mount to set up

  const handleDetach = async (numberId: string) => {
    if (!confirm("Are you sure? This number will be returned to your inventory.")) return;
    setLoadingId(numberId);
    try {
      await fetch('/api/numbers/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numberId })
      });
      router.refresh();
    } catch (e) { alert("Failed to detach"); }
    finally { setLoadingId(null); }
  };

  const handleAssign = async (agentId: string, numberId: string) => {
    setLoadingId(agentId);
    try {
      await fetch('/api/numbers/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, numberId })
      });
      router.refresh();
    } catch (e) { alert("Failed to assign"); }
    finally { setLoadingId(null); }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm("DANGER: Delete this Agent? This cannot be undone.")) return;
    setLoadingId(agentId);
    try {
      await fetch(`/api/agents/${agentId}`, { method: 'DELETE' });
      router.refresh();
    } catch (e) { alert("Failed to delete agent"); }
    finally { setLoadingId(null); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => {
        const phone = agent.phoneNumber;
        const isPending = phone && phone.status === 'PENDING' && timers[phone.id] > 0;

        return (
          <div key={agent.id} className="premium-card p-6 flex flex-col justify-between group hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{agent.name}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">{agent.model}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 truncate max-w-[120px]">{agent.voiceId}</span>
                  </div>
                </div>
                {phone ? (
                  <div className={`p-2.5 rounded-xl ${isPending ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' : 'bg-green-50 text-green-600 border border-green-200'}`} title={isPending ? "Activating..." : "Live"}>
                    {isPending ? <Clock className="w-5 h-5 animate-pulse" /> : <Phone className="w-5 h-5" />}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200" title="Ready for Web Call">
                    <Activity className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Performance Metrics Quick View */}
              <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Performance</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Calls</p>
                    <p className="text-sm font-black text-slate-900">{agent.metrics?.totalCalls || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Mins</p>
                    <p className="text-sm font-black text-slate-900">{agent.metrics?.totalMinutes || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Spend</p>
                    <p className="text-sm font-black text-slate-900">${agent.metrics?.totalSpend.toFixed(2) || "0.00"}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Connectivity</p>
                {phone ? (
                  <div className={`flex items-center justify-between font-medium p-3 rounded-lg border ${isPending ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-white transition-colors'}`}>
                    <div className="flex items-center">
                      {isPending ? (
                        <span className="text-sm">Activating... {timers[phone.id]}s</span>
                      ) : (
                        <>
                          <Phone className="w-4 h-4 mr-2.5 text-slate-400" />
                          <span className="text-sm tracking-wide">{phone.number}</span>
                        </>
                      )}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDetach(phone.id)}
                        disabled={loadingId === phone.id}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors" title="Detach Number"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 font-medium">No active number</span>
                      {isAdmin && (
                        <Link href={`/dashboard/agents/${agent.id}/number`} className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-2.5 py-1 rounded shadow-sm hover:shadow transition-all">
                          + Buy Number
                        </Link>
                      )}
                    </div>
                    {/* Inventory Dropdown */}
                    {isAdmin && inventory.length > 0 && (
                      <div className="pt-2 border-t border-slate-200">
                        <select
                          className="text-xs border-slate-300 rounded-md px-2.5 py-1.5 w-full bg-white text-slate-700 focus:ring-slate-900 focus:border-slate-900 shadow-sm"
                          onChange={(e) => {
                            if (e.target.value) handleAssign(agent.id, e.target.value);
                          }}
                          disabled={loadingId === agent.id}
                        >
                          <option value="">Assign from inventory...</option>
                          {inventory.map(num => (
                            <option key={num.id} value={num.id}>{num.number}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={`grid ${isAdmin ? 'grid-cols-5' : 'grid-cols-1'} gap-2 mt-auto pt-4 border-t border-slate-100`}>
              {isAdmin && (
                <Link
                  href={`/dashboard/agents/${agent.id}`}
                  className="col-span-2 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Configure
                </Link>
              )}
              <Link
                href={`/dashboard/agents/${agent.id}/analytics`}
                className={`${isAdmin ? 'col-span-2' : 'col-span-1'} flex items-center justify-center px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 border border-slate-200 transition-colors`}
              >
                Analytics
              </Link>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteAgent(agent.id)}
                  disabled={loadingId === agent.id}
                  className="col-span-1 flex items-center justify-center px-2 py-2 border border-slate-200 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  title="Delete Agent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
}
