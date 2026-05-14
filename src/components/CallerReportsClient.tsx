'use client';

import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Phone, User, Search, X, Repeat, Clock, MapPin } from 'lucide-react';

export default function CallerReportsClient({
    allCalls,
    tenantTimezone = 'UTC'
}: {
    allCalls: any[],
    tenantTimezone?: string
}) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter calls by date range
    const filteredCalls = useMemo(() => {
        return allCalls.filter(call => {
            const callDate = new Date(call.createdAt);
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (callDate < start) return false;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (callDate > end) return false;
            }
            return true;
        });
    }, [allCalls, startDate, endDate]);

    // Group by customer number
    const callerMetrics = useMemo(() => {
        const groups = new Map();

        filteredCalls.forEach(call => {
            if (!call.customerNumber) return;

            if (!groups.has(call.customerNumber)) {
                groups.set(call.customerNumber, {
                    number: call.customerNumber,
                    callCount: 0,
                    totalDuration: 0,
                    lastCalled: call.createdAt,
                    history: [] as any[]
                });
            }

            const group = groups.get(call.customerNumber);
            group.callCount += 1;
            group.totalDuration += call.duration;
            if (new Date(call.createdAt) > new Date(group.lastCalled)) {
                group.lastCalled = call.createdAt;
            }
            group.history.push(call);
        });

        return Array.from(groups.values())
            .filter(g => {
                if (!searchQuery) return true;
                return g.number.includes(searchQuery);
            })
            .sort((a, b) => b.callCount - a.callCount); // Sort by frequency
    }, [filteredCalls, searchQuery]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by phone number..."
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
                        <span className="px-1 text-slate-400 text-xs">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="pl-2 pr-2 py-2 border-none bg-transparent text-xs font-medium focus:ring-0"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Caller Number</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Frequency</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total Duration</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Interaction</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {callerMetrics.map((caller) => (
                            <tr key={caller.number} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-slate-100 rounded-lg mr-3 text-slate-600">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-black text-slate-900 font-mono">{caller.number}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full ${caller.callCount > 5 ? 'bg-red-50 text-red-700 border border-red-100' :
                                            caller.callCount > 2 ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                                                'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                        {caller.callCount} calls
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500 font-mono">
                                    {Math.floor(caller.totalDuration / 60)}m {Math.floor(caller.totalDuration % 60)}s
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-xs font-bold text-slate-900">{new Date(caller.lastCalled).toLocaleDateString('en-US', { timeZone: tenantTimezone })}</div>
                                    <div className="text-[10px] text-slate-400">{new Date(caller.lastCalled).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: tenantTimezone, timeZoneName: 'short' })}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-slate-400 hover:text-slate-900 font-bold transition-colors">
                                        View Logs
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {callerMetrics.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-slate-400">
                                    <Repeat className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p className="text-lg font-bold">No frequent callers found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
}
