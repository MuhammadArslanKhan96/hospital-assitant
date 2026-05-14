'use client';

import { useState } from 'react';
import { Phone, PhoneOff, Clock, Hash, Filter } from 'lucide-react';

interface PhoneNumberData {
    id: string;
    number: string;
    vapiId: string | null;
    agentId: string | null;
    tenantId: string | null;
    status: string;
    activatedAt: string | null;
    createdAt: string;
    agent: {
        id: string;
        name: string;
        tenant: {
            id: string;
            name: string;
        };
    } | null;
}

interface Stats {
    total: number;
    available: number;
    assigned: number;
    pending: number;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    AVAILABLE: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    ACTIVE: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    ASSIGNED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
};

export default function PhoneNumberManagement({ numbers, stats }: { numbers: PhoneNumberData[]; stats: Stats }) {
    const [filter, setFilter] = useState<string>('ALL');

    const filtered = filter === 'ALL'
        ? numbers
        : numbers.filter(n => {
            if (filter === 'ASSIGNED') return n.status === 'ASSIGNED' || n.status === 'ACTIVE';
            return n.status === filter;
        });

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</span>
                        <Hash className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Available</span>
                        <Phone className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-green-700">{stats.available}</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Assigned</span>
                        <PhoneOff className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-blue-700">{stats.assigned}</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">Pending</span>
                        <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                    <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center space-x-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="ALL">All Numbers ({numbers.length})</option>
                    <option value="AVAILABLE">Available ({stats.available})</option>
                    <option value="ASSIGNED">Assigned ({stats.assigned})</option>
                    <option value="PENDING">Pending ({stats.pending})</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VAPI ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filtered.map((num) => {
                            const style = STATUS_STYLES[num.status] || STATUS_STYLES.AVAILABLE;
                            return (
                                <tr key={num.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono font-medium text-gray-900">{num.number}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`}></span>
                                            {num.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {num.agent ? (
                                            <a href={`/admin/tenants/${num.agent.tenant.id}`} className="font-medium text-blue-600 hover:underline">
                                                {num.agent.name}
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 italic">— Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {num.agent?.tenant ? (
                                            <span className="font-medium">{num.agent.tenant.name}</span>
                                        ) : num.tenantId ? (
                                            <span className="text-gray-500 text-xs">ID: {num.tenantId.slice(0, 8)}...</span>
                                        ) : (
                                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">Global Pool</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 truncate block max-w-[140px]">
                                            {num.vapiId ? num.vapiId.slice(0, 12) + '...' : '—'}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(num.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No phone numbers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
