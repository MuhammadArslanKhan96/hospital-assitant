'use client';

import { useState } from 'react';
import { Trash2, ExternalLink, Bot, Phone } from 'lucide-react';

export default function TenantManagementTable({ tenants }: { tenants: any[] }) {
  const [list, setList] = useState(tenants);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`DANGER: Are you sure you want to DELETE "${name}"?\n\nThis will:\n1. Delete all their Agents & Numbers from VAPI.\n2. Delete all Call Logs & Appointments.\n3. Remove the user permanently.\n\nThis cannot be undone.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/tenants/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setList(list.filter(t => t.id !== id));
      } else {
        alert('Failed to delete tenant. Check server logs.');
      }
    } catch (e) {
      alert('Network error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resources</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Markup</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {list.map((tenant) => (
            <tr key={tenant.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <a href={`/admin/tenants/${tenant.id}`} className="font-medium text-blue-600 hover:underline">
                    {tenant.name}
                </a>
                <div className="text-xs text-gray-400">ID: {tenant.id.slice(0, 8)}...</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {tenant.user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex space-x-4">
                    <span className="flex items-center" title="Agents">
                        <Bot className="w-4 h-4 mr-1 text-blue-500" /> {tenant._count.agents}
                    </span>
                    <span className="flex items-center" title="Phone Numbers">
                        <Phone className="w-4 h-4 mr-1 text-green-500" /> {tenant._count.calls}
                    </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    {tenant.markup}x
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                    onClick={() => handleDelete(tenant.id, tenant.name)}
                    disabled={deletingId === tenant.id}
                    className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md hover:bg-red-100 transition-colors"
                    title="Delete Tenant"
                >
                    {deletingId === tenant.id ? '...' : <Trash2 className="w-4 h-4" />}
                </button>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No tenants found.
                </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
