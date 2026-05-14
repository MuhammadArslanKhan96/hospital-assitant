'use client';

import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, MapPin, X, Phone, DollarSign, Clock } from 'lucide-react';
import { extractAreaCode, cityMapping } from '@/lib/area-codes';

export default function AreaCodesClient({ logs }: { logs: any[] }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Derived filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Date Range Filter
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
    });
  }, [logs, startDate, endDate]);

  const areaCodeMetrics = useMemo(() => {
    const map: Record<string, { code: string, city: string, count: number, duration: number, cost: number }> = {};

    filteredLogs.forEach(log => {
      const code = extractAreaCode(log.customerNumber);
      if (code) {
        if (!map[code]) {
          map[code] = {
            code,
            city: cityMapping[code] || `Unknown Area ${code}`,
            count: 0,
            duration: 0,
            cost: 0
          };
        }
        map[code].count += 1;
        map[code].duration += log.duration;
        map[code].cost += log.billedCost;
      }
    });

    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filteredLogs]);

  const totalCalls = areaCodeMetrics.reduce((sum, item) => sum + item.count, 0);
  const totalCost = areaCodeMetrics.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600"><MapPin className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unique Codes</p>
            <p className="text-xl font-bold text-slate-900 tracking-tight">{areaCodeMetrics.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600"><Phone className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matched Calls</p>
            <p className="text-xl font-bold text-slate-900 tracking-tight">{totalCalls}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600"><DollarSign className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Spend</p>
            <p className="text-xl font-bold text-slate-900 tracking-tight">${totalCost.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
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
            <span className="px-1 text-slate-400">to</span>
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
        </div>
      </div>

      {/* Main Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Area Code</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Region / City</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Calls</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Spend</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {areaCodeMetrics.map((item) => (
              <tr key={item.code} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 font-mono">
                  {item.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                  {item.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">
                  {item.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500 font-mono bg-slate-50/50">
                  {Math.floor(item.duration / 60)}m {(item.duration % 60).toString().padStart(2, '0')}s
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700 tracking-tight">
                  ${item.cost.toFixed(2)}
                </td>
              </tr>
            ))}
            {areaCodeMetrics.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <MapPin className="w-12 h-12 mb-4 text-slate-300" />
                    <p className="text-lg font-bold text-slate-600">No area codes found</p>
                    <p className="text-sm mt-1">Try adjusting your filters.</p>
                  </div>
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
