'use client';

import { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

export default function TenantBillingTable({ tenants }: { tenants: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [markupValue, setMarkupValue] = useState<number>(1.2);
  const [list, setList] = useState(tenants);

  const startEdit = (tenant: any) => {
    setEditingId(tenant.id);
    setMarkupValue(tenant.markup);
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/tenants/${id}/markup`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markup: markupValue }),
      });

      if (res.ok) {
        setList(list.map(t => t.id === id ? { ...t, markup: markupValue } : t));
        setEditingId(null);
      } else {
        alert('Failed to update markup');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Calls</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost (VAPI)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue (Billed)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit Margin</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Markup (x)</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {list.map((tenant) => {
            const totalCost = tenant.calls.reduce((sum: number, c: any) => sum + c.cost, 0);
            const totalRevenue = tenant.calls.reduce((sum: number, c: any) => sum + c.billedCost, 0);
            const profit = totalRevenue - totalCost;

            return (
              <tr key={tenant.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{tenant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{tenant.calls.length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">${totalCost.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">${totalRevenue.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-blue-600">+${profit.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === tenant.id ? (
                    <input
                      type="number"
                      step="0.01"
                      min="1.0"
                      value={markupValue}
                      onChange={(e) => setMarkupValue(parseFloat(e.target.value))}
                      className="w-20 border rounded px-2 py-1"
                    />
                  ) : (
                    <span className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">{tenant.markup}x</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {editingId === tenant.id ? (
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => saveEdit(tenant.id)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="text-red-600 hover:bg-red-50 p-1 rounded"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(tenant)} className="text-gray-400 hover:text-blue-600">
                        <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
