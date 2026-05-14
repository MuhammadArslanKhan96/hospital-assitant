'use client';

import { useState } from 'react';
import BillingOverview from '@/components/billing/BillingOverview';
import AgentListClient from '@/components/AgentListClient';
import Link from 'next/link';
import { Plus, Wrench } from 'lucide-react';

export default function AdminTenantDetail({ tenant, usage, invoices, inventory }: { tenant: any, usage: number, invoices: any[], inventory: any[] }) {
  const [markup, setMarkup] = useState(tenant.markup);
  const [loading, setLoading] = useState(false);

  const updateMarkup = async () => {
    setLoading(true);
    try {
        await fetch(`/api/admin/tenants/${tenant.id}/markup`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ markup: parseFloat(markup) })
        });
        alert('Markup updated');
    } catch(e) { alert('Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
                <p className="text-gray-500">{tenant.user.email} • ID: {tenant.id}</p>
            </div>
            <div className="flex items-center space-x-4">
                <Link
                    href={`/admin/tenants/${tenant.id}/tools`}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                    <Wrench className="w-4 h-4" />
                    <span>Manage Custom Tools</span>
                </Link>
                <div className="flex items-center space-x-2 bg-white p-3 rounded border">
                    <span className="text-sm font-medium">Markup:</span>
                    <input
                        type="number"
                        step="0.01"
                        value={markup}
                        onChange={(e) => setMarkup(e.target.value)}
                        className="w-20 border rounded px-2 py-1"
                    />
                    <button
                        onClick={updateMarkup}
                        disabled={loading}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                        {loading ? '...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>

        {/* Agent Management Section */}
        <div className="border-t pt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Agents for this Tenant</h2>
                <Link
                    href={`/dashboard/agents/new?tenantId=${tenant.id}`}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Agent
                </Link>
            </div>

            {tenant.agents && tenant.agents.length > 0 ? (
                <AgentListClient
                    initialAgents={tenant.agents}
                    inventory={inventory}
                    userRole="SUPER_ADMIN"
                />
            ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 text-center">
                    <p className="text-slate-500 font-medium">No agents found for this tenant.</p>
                </div>
            )}
        </div>

        {/* Reusing Billing Component for Admin View */}
        <div className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">Billing & Usage (Admin View)</h2>
            <BillingOverview
                currentUsage={usage}
                totalAccrued={invoices.reduce((sum, inv) => sum + inv.amount, 0)} // Use invoices sum for admin view mock or actual data
            />
        </div>
    </div>
  );
}
