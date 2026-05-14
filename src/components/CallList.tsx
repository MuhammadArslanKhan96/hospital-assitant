'use client';

import { useState, useMemo } from 'react';
import CallDetailModal from '@/components/modals/CallDetailModal';
import { Search, Filter, Phone, Calendar as CalendarIcon, Clock, DollarSign, X, User } from 'lucide-react';
import { formatTimezoneWithStates } from '@/lib/timezone';

export default function CallList({ logs, agents, initialSearch = '', tenantTimezone = 'UTC' }: { logs: any[], agents?: { id: string, name: string }[], initialSearch?: string, tenantTimezone?: string }) {
  const [selectedCall, setSelectedCall] = useState<any | null>(null);

  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'desc' | 'asc'>('desc');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Derived filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. Status Filter
      if (statusFilter !== 'all' && log.status !== statusFilter) {
        return false;
      }

      // 1.5 Agent Filter
      if (agentFilter !== 'all' && log.agentId !== agentFilter) {
        return false;
      }

      // 2. Search Query (Check summary, id, number, and intent)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesSummary = log.summary?.toLowerCase().includes(query);
        const matchesId = log.id?.toLowerCase().includes(query);
        const matchesIntent = (log as any).intent?.toLowerCase().includes(query);
        const matchesNumber = log.customerNumber?.toLowerCase().includes(query);

        if (!matchesSummary && !matchesId && !matchesIntent && !matchesNumber) {
          return false;
        }
      }

      // 3. Date Range Filter
      const callDate = new Date(log.createdAt);
      if (startDate) {
        const start = new Date(startDate + 'T00:00:00');
        if (callDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate + 'T23:59:59');
        if (callDate > end) return false;
      }

      return true;
    }).sort((a, b) => {
      // 4. Date Sort
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateSort === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [logs, searchQuery, statusFilter, agentFilter, dateSort, startDate, endDate]);

  // Statistics for the header
  const totalCalls = filteredLogs.length;
  const totalMinutes = filteredLogs.reduce((acc, log) => acc + log.duration, 0) / 60;
  const totalCost = filteredLogs.reduce((acc, log) => acc + log.billedCost, 0);

  return (
    <div className="space-y-6">

      {/* Analytics Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600"><Phone className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Matched Calls</p>
            <p className="text-xl font-bold text-slate-900 tracking-tight">{totalCalls}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600"><Clock className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Duration</p>
            <p className="text-xl font-bold text-slate-900 tracking-tight">{Math.round(totalMinutes)}m</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600"><DollarSign className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Est. Spend</p>
            <p className="text-xl font-bold text-slate-900 tracking-tight">${totalCost.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search summaries, intents, or IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm shadow-inner transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg overflow-hidden shadow-sm">
            <span className="pl-3 pr-2 py-2 text-slate-500 bg-slate-100 border-r border-slate-200 text-sm font-medium flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" /> Range
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-2 pr-2 py-2.5 bg-transparent border-none text-xs font-medium text-slate-700 focus:ring-0 cursor-pointer"
            />
            <span className="px-1 text-slate-400">至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-2 pr-2 py-2.5 bg-transparent border-none text-xs font-medium text-slate-700 focus:ring-0 cursor-pointer"
            />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="px-2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {agents && agents.length > 0 && (
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg overflow-hidden shadow-sm">
              <span className="pl-3 pr-2 py-2 text-slate-500 bg-slate-100 border-r border-slate-200 text-sm font-medium flex items-center">
                <User className="w-4 h-4 mr-2" /> Agent
              </span>
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="pl-2 pr-8 py-2.5 bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer max-w-[150px] truncate"
              >
                <option value="all">All Agents</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg overflow-hidden shadow-sm">
            <span className="pl-3 pr-2 py-2 text-slate-500 bg-slate-100 border-r border-slate-200 text-sm font-medium flex items-center">
              <Filter className="w-4 h-4 mr-2" /> Status
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-2 pr-8 py-2.5 bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer"
            >
              <option value="all">All Calls</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed / Error</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>

          <button
            onClick={() => setDateSort(dateSort === 'desc' ? 'asc' : 'desc')}
            className="flex items-center px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors group"
          >
            <CalendarIcon className="w-4 h-4 mr-2 text-slate-400 group-hover:text-slate-600 transition-colors" />
            Sort: {dateSort === 'desc' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              {agents && <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Agent</th>}
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Caller ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time <span className="normal-case font-medium text-slate-400">({formatTimezoneWithStates(tenantTimezone)})</span></th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cost</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Summary</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-md border ${log.status === 'completed' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                    log.status === 'in-progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    {log.status}
                  </span>
                </td>
                {agents && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                    {log.agent?.name || <span className="text-slate-400 font-normal italic">Unknown</span>}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 font-mono">
                  {log.customerNumber || <span className="text-slate-400 font-normal italic">Private</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-slate-900">{new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: tenantTimezone })}</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">{new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: tenantTimezone })}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500 font-mono bg-slate-50/50">
                  {Math.floor(log.duration / 60)}m {(log.duration % 60).toString().padStart(2, '0')}s
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700 tracking-tight">
                  ${log.billedCost.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 max-w-sm">
                  {log.outcome && (
                    <div className="mb-2">
                      {log.outcome.includes('BOOKED') ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wider border border-purple-200">
                          Appointment Booked
                        </span>
                      ) : log.outcome.includes('LEAD') ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wider border border-orange-200">
                          Lead Captured
                        </span>
                      ) : null}
                    </div>
                  )}
                  <div className="truncate max-w-xs">{log.summary || <span className="italic text-slate-400 font-medium">No summary available</span>}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedCall(log)}
                    className="inline-flex items-center px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={agents ? 8 : 7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Search className="w-12 h-12 mb-4 text-slate-300" />
                    <p className="text-lg font-bold text-slate-600">No calls found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                    {(searchQuery || statusFilter !== 'all' || startDate || endDate) && (
                      <button
                        onClick={() => { setSearchQuery(''); setStatusFilter('all'); setStartDate(''); setEndDate(''); }}
                        className="mt-4 text-sm font-medium text-slate-600 hover:text-slate-900 underline underline-offset-4"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {selectedCall && (
        <CallDetailModal call={selectedCall} onClose={() => setSelectedCall(null)} tenantTimezone={tenantTimezone} />
      )}
    </div>
  );
}
