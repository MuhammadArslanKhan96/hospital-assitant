"use client";

import { useState, useEffect } from "react";
import {
  PhoneOutgoing,
  Play,
  Plus,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Search,
  Activity,
  History,
  ChevronRight,
} from "lucide-react";

type Contact = { name: string; number: string };
type Campaign = {
  id: string;
  name: string;
  agentId: string;
  inputData: string;
  results: any[];
  createdAt: number;
};

export default function CampaignClient({
  agents,
  tenantTimezone = "UTC",
}: {
  agents: any[];
  tenantTimezone?: string;
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("crossConnectCampaigns");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCampaigns(parsed);
        if (parsed.length > 0) setActiveCampaignId(parsed[0].id);
      } catch (e) {}
    } else {
      createNewCampaign();
    }
  }, []);

  useEffect(() => {
    if (campaigns.length > 0) {
      localStorage.setItem("crossConnectCampaigns", JSON.stringify(campaigns));
    }
  }, [campaigns]);

  const createNewCampaign = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    const newCamp: Campaign = {
      id: newId,
      name: `Campaign ${campaigns.length + 1}`,
      agentId: "",
      inputData: "",
      results: [],
      createdAt: Date.now(),
    };
    setCampaigns([...campaigns, newCamp]);
    setActiveCampaignId(newId);
  };

  const deleteCampaign = (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    const updated = campaigns.filter((c) => c.id !== id);
    setCampaigns(updated);
    if (activeCampaignId === id) {
      setActiveCampaignId(updated.length > 0 ? updated[0].id : null);
    }
    if (updated.length === 0) {
      localStorage.removeItem("crossConnectCampaigns");
    }
  };

  const outboundAgents = agents.filter(
    (a) => a.type !== "INBOUND" && a.phoneNumber
  );
  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId);

  const updateActiveCampaign = (updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === activeCampaignId ? { ...c, ...updates } : c))
    );
  };

  useEffect(() => {
    if (!activeCampaign) return;
    const pendingCalls = activeCampaign.results.filter(
      (r) => r.status === "initiated" && r.id
    );
    if (pendingCalls.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/campaigns/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callIds: pendingCalls.map((c) => c.id) }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.logs && data.logs.length > 0) {
            const logsMap = new Map();
            data.logs.forEach((log: any) => logsMap.set(log.vapiCallId, log));
            const updatedResults = activeCampaign.results.map((r) => {
              if (r.id && logsMap.has(r.id)) {
                const dbLog = logsMap.get(r.id);
                return { ...r, status: dbLog.status, outcome: dbLog.outcome };
              }
              return r;
            });
            if (
              JSON.stringify(updatedResults) !==
              JSON.stringify(activeCampaign.results)
            ) {
              updateActiveCampaign({ results: updatedResults });
            }
          }
        }
      } catch (e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [activeCampaign?.results]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      updateActiveCampaign({ inputData: text });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const parseContacts = (text: string): Contact[] => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        if (line.includes(",")) {
          const parts = line.split(",");
          return { name: parts[0].trim(), number: parts[1].trim() };
        } else if (line.includes("\t")) {
          const parts = line.split("\t");
          return { name: parts[0].trim(), number: parts[1].trim() };
        } else {
          return { name: "Customer", number: line };
        }
      })
      .filter((c) => c.number.length > 5);
  };

  const handleStart = async () => {
    if (!activeCampaign) return;
    if (!activeCampaign.agentId) return alert("Select an agent");
    const contacts = parseContacts(activeCampaign.inputData);
    if (contacts.length === 0) return alert("No valid contacts found.");
    setLoading(true);
    updateActiveCampaign({ results: [] });
    try {
      const res = await fetch("/api/campaigns/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: activeCampaign.agentId, contacts }),
      });
      const data = await res.json();
      if (res.ok) updateActiveCampaign({ results: data.results });
      else alert(data.error);
    } catch (e) {
      alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  if (!activeCampaign)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white border border-slate-200 rounded-[2.5rem] shadow-sm m-4">
        <Layers className="w-12 h-12 text-slate-200 mb-4" />
        <p className="text-slate-500 font-medium mb-6">
          No campaigns found in your local session.
        </p>
        <button
          onClick={createNewCampaign}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95"
        >
          Initialize New Campaign
        </button>
      </div>
    );

  const parsedContacts = parseContacts(activeCampaign.inputData);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12 px-4">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-vc-green animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Dialing Engine v2.0
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Outbound <span className="text-slate-400">Campaigns</span>
          </h1>
        </div>
        <button
          onClick={createNewCampaign}
          className="h-12 px-6 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
        >
          <Plus className="w-4 h-4" /> Initialize New
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Active Queue
            </h2>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {campaigns.length}
            </span>
          </div>
          <div className="space-y-2">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                onClick={() => setActiveCampaignId(camp.id)}
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  activeCampaignId === camp.id
                    ? "bg-white border-slate-900 shadow-xl shadow-slate-200/50 -translate-y-1"
                    : "bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="truncate">
                    <p
                      className={`text-sm font-bold truncate ${activeCampaignId === camp.id ? "text-slate-900" : "text-slate-500"}`}
                    >
                      {camp.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                      {new Date(camp.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCampaign(camp.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {activeCampaignId === camp.id && (
                  <div className="absolute right-4 bottom-4">
                    <ChevronRight className="w-4 h-4 text-slate-900" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Interface */}
        <div className="lg:col-span-9 grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Configuration Panel */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Campaign Identity
                </label>
                <div className="flex items-center gap-3 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                    <Activity className="w-4 h-4 text-slate-900" />
                  </div>
                  <input
                    type="text"
                    value={activeCampaign.name}
                    onChange={(e) =>
                      updateActiveCampaign({ name: e.target.value })
                    }
                    className="flex-1 bg-transparent border-none font-bold text-slate-900 focus:ring-0 text-sm"
                    placeholder="Unnamed Campaign"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Autonomous Agent
                </label>
                <select
                  value={activeCampaign.agentId}
                  onChange={(e) =>
                    updateActiveCampaign({ agentId: e.target.value })
                  }
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-slate-900 transition-all appearance-none"
                >
                  <option value="">Select Outbound Voice</option>
                  {outboundAgents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.phoneNumber?.number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Contact Matrix
                  </label>
                  <label className="cursor-pointer group flex items-center gap-1.5 text-[10px] font-black text-vc-green">
                    <Upload className="w-3 h-3 transition-transform group-hover:-translate-y-0.5" />{" "}
                    ATTACH CSV
                    <input
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                <textarea
                  rows={6}
                  value={activeCampaign.inputData}
                  onChange={(e) =>
                    updateActiveCampaign({ inputData: e.target.value })
                  }
                  className="w-full p-5 bg-slate-50 border border-slate-100 text-slate-900 rounded-[2rem] font-mono text-xs focus:ring-2 focus:ring-slate-900 transition-all resize-none placeholder:text-slate-300"
                  placeholder="Name, Number..."
                />
                <div className="flex items-center gap-2 px-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-vc-green" />
                  <span className="text-[11px] font-bold text-slate-500">
                    {parsedContacts.length} Targets Verified
                  </span>
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={
                  loading ||
                  !activeCampaign.agentId ||
                  outboundAgents.length === 0
                }
                className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 disabled:opacity-30 disabled:grayscale transition-all flex justify-center items-center gap-3 shadow-xl shadow-slate-200"
              >
                {loading ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />{" "}
                    DEPLOYING...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> DEPLOY CAMPAIGN
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real-time Results */}
          <div className="xl:col-span-3">
            <div className="bg-white h-[700px] rounded-[3rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-vc-green/10 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-vc-green" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Live Intelligence
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Real-time Feed
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
                {activeCampaign.results.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30">
                    <History className="w-16 h-16 text-slate-200 mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      Awaiting Deployment
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {activeCampaign.results.map((r, idx) => (
                      <div
                        key={idx}
                        className="group flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${
                              r.status === "completed"
                                ? "bg-vc-green text-white"
                                : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {r.name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 font-bold">
                              {r.number}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                          {r.outcome && r.outcome.includes("BOOKED") && (
                            <span className="text-[9px] px-2.5 py-1 rounded-lg font-black uppercase bg-purple-600 text-white">
                              Booked
                            </span>
                          )}
                          {r.outcome && r.outcome.includes("LEAD") && (
                            <span className="text-[9px] px-2.5 py-1 rounded-lg font-black uppercase bg-orange-500 text-white">
                              Lead
                            </span>
                          )}
                          <span
                            className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase border shadow-sm ${
                              r.status === "initiated"
                                ? "bg-white text-yellow-600 border-yellow-100"
                                : r.status === "completed"
                                  ? "bg-white text-vc-green border-vc-green/20"
                                  : "bg-white text-red-500 border-red-100"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
