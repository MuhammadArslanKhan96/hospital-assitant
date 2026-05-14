'use client';

import { useState } from 'react';
import { Download, Filter, FileText, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminCallListClient({ initialCalls, tenants }: { initialCalls: any[], tenants: any[] }) {
  const router = useRouter();
  const [calls, setCalls] = useState(initialCalls);
  const [selectedTenant, setSelectedTenant] = useState('ALL');
  const [selectedAgent, setSelectedAgent] = useState('ALL');

  // Derive unique agents for the filter
  const uniqueAgents = Array.from(new Set(initialCalls.filter(c => c.agentId).map(c => c.agent.name)));

  const filteredCalls = calls.filter(call => {
    if (selectedTenant !== 'ALL' && call.tenantId !== selectedTenant) return false;
    if (selectedAgent !== 'ALL' && call.agent?.name !== selectedAgent) return false;
    return true;
  });

  const totalRawCost = filteredCalls.reduce((sum, call) => sum + (call.cost || 0), 0);
  const totalBilled = filteredCalls.reduce((sum, call) => sum + (call.billedCost || 0), 0);
  const totalProfit = totalBilled - totalRawCost;

  const handleToggleBillingMode = async (tenantId: string, currentMode: string) => {
    const newMode = currentMode === 'REAL' ? 'FALLBACK' : 'REAL';
    try {
      await fetch(`/api/admin/tenants/${tenantId}/billing-mode`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingMode: newMode })
      });
      // Optionally refresh the data or optimistically update
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('Failed to update billing mode.');
    }
  };

  return (
    <div className="space-y-6">

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Raw Cost</p>
          <p className="text-3xl font-bold text-gray-900">${totalRawCost.toFixed(4)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Billed</p>
          <p className="text-3xl font-bold text-blue-600">${totalBilled.toFixed(4)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Profit</p>
          <p className="text-3xl font-bold text-green-600">${totalProfit.toFixed(4)}</p>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Global Billing Configuration</h3>
          <p className="text-xs text-slate-500 mb-4">Toggle how calls are billed. "REAL" uses the exact Vapi/OpenAI cost. "FALLBACK" uses estimated per-minute flat rates ($0.05 + $0.01 + $0.04) regardless of actual token usage. Both are multiplied by the tenant's markup.</p>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-4">
              {tenants.map(t => (
                  <div key={t.id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm border border-slate-200">
                      <div>
                          <p className="text-sm font-bold text-slate-900">{t.name}</p>
                          <p className="text-xs text-slate-500 font-mono">ID: {t.id}</p>
                      </div>
                      <button
                          onClick={() => handleToggleBillingMode(t.id, t.billingMode)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${t.billingMode === 'REAL' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-orange-100 text-orange-800 border border-orange-200'}`}
                      >
                          {t.billingMode === 'REAL' ? 'Using Real Costs' : 'Using Fallback Costs'}
                      </button>
                  </div>
              ))}
          </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex space-x-4 w-full md:w-auto">
          <select value={selectedTenant} onChange={(e) => setSelectedTenant(e.target.value)} className="px-3 py-2 border rounded-md text-sm w-full md:w-48">
            <option value="ALL">All Tenants</option>
            {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="px-3 py-2 border rounded-md text-sm w-full md:w-48">
            <option value="ALL">All Agents</option>
            {uniqueAgents.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Call Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant / Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Raw Cost (Platform)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Billed (Tenant)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider">Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(call.createdAt).toLocaleString('en-US', { timeZone: call.tenant?.timezone || 'UTC', timeZoneName: 'short' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{call.tenant?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{call.agent?.name || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-gray-400" /> {call.duration}s</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${call.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {call.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    ${(call.cost || 0).toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">
                    ${(call.billedCost || 0).toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                    ${((call.billedCost || 0) - (call.cost || 0)).toFixed(4)}
                  </td>
                </tr>
              ))}
              {filteredCalls.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    No calls found for the selected criteria.
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