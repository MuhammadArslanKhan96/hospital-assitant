'use client';

import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Phone, DollarSign, ArrowRight, User, Search, X } from 'lucide-react';

export default function AgentReportsClient({
    agents,
    allCalls
}: {
    agents: any[],
    allCalls: any[]
}) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter calls by date range
    const filteredCalls = useMemo(() => {
        return allCalls.filter(call => {
            const callDate = new Date(call.createdAt);
            if (startDate) {
                const start = new Date(startDate + 'T00:00:00');
                if (callDate < start) return false;
            }
            if (endDate) {
                const end = new Date(endDate + 'T23:59:59');
                if (callDate > end) return false;
            }
            return true;
        });
    }, [allCalls, startDate, endDate]);

    // Aggregate metrics per agent
    const agentMetrics = useMemo(() => {
        const metricsMap = new Map();

        // Initialize map with all agents
        agents.forEach(agent => {
            let parsedTargets: { label: string, number: string }[] = [];
            try {
                if (agent.transferTargets) {
                    parsedTargets = typeof agent.transferTargets === 'string' ? JSON.parse(agent.transferTargets) : agent.transferTargets;
                }
            } catch (e) { }

            metricsMap.set(agent.id, {
                id: agent.id,
                name: agent.name,
                role: agent.role,
                callsTaken: 0,
                totalCost: 0,
                totalMinutes: 0,
                parsedTargets,
                transfers: [] as { target: string, count: number }[]
            });
        });

        filteredCalls.forEach(call => {
            const metric = metricsMap.get(call.agentId);
            if (metric) {
                metric.callsTaken += 1;
                metric.totalCost += call.billedCost;
                metric.totalMinutes += call.duration / 60;

                if (call.transferTarget) {
                    // Map raw number to label if possible
                    const tObj = metric.parsedTargets.find((t: any) => t.number === call.transferTarget || t.label === call.transferTarget);
                    const displayTarget = tObj ? tObj.label : call.transferTarget;

                    const existingTransfer = metric.transfers.find((t: any) => t.target === displayTarget);
                    if (existingTransfer) {
                        existingTransfer.count += 1;
                    } else {
                        metric.transfers.push({ target: displayTarget, count: 1 });
                    }
                }
            }
        });

        return Array.from(metricsMap.values()).filter(m => {
            if (!searchQuery) return true;
            return m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.role.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [agents, filteredCalls, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Filters Header */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by agent name or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 sm:text-sm"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg overflow-hidden">
                        <span className="pl-3 pr-2 py-2 text-slate-500 bg-slate-100 border-r border-slate-200 text-sm font-medium flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2" /> Range
                        </span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="pl-2 pr-2 py-2 border-none bg-transparent text-xs font-medium focus:ring-0"
                        />
                        <span className="px-1 text-slate-400 text-xs text-xs">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="pl-2 pr-2 py-2 border-none bg-transparent text-xs font-medium focus:ring-0"
                        />
                    </div>
                </div>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agentMetrics.map((agent) => (
                    <div key={agent.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{agent.name}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{agent.role}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calls Taken</p>
                                    <div className="flex items-center text-slate-900">
                                        <Phone className="w-4 h-4 mr-2 text-slate-400" />
                                        <span className="text-xl font-black">{agent.callsTaken}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Cost</p>
                                    <div className="flex items-center text-slate-900">
                                        <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                                        <span className="text-xl font-black">${agent.totalCost.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Transfers Section */}
                            {agent.transfers.length > 0 && (
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Transfers by Dept/Target</p>
                                    <div className="space-y-2">
                                        {agent.transfers.map((t: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                <span className="text-xs font-bold text-slate-600 flex items-center">
                                                    <ArrowRight className="w-3 h-3 mr-2 text-blue-500" /> {t.target}
                                                </span>
                                                <span className="text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">
                                                    {t.count} calls
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {agent.transfers.length === 0 && agent.callsTaken > 0 && (
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-xs text-slate-400 italic">No transfers initiated</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {agentMetrics.length === 0 && (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
                    <div className="flex flex-col items-center max-w-xs mx-auto">
                        <User className="w-12 h-12 text-slate-200 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No agents found</h3>
                        <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or link some agents to your calls.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
