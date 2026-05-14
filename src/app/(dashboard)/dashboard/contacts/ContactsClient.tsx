'use client';

import { useState } from 'react';

type ContactData = {
  id: string;
  phoneNumber: string;
  smsConsent: boolean;
  doNotCall: boolean;
  lastCallContext: string | null;
  agentId: string | null;
  updatedAt: Date;
  agent: { name: string } | null;
};

export default function ContactsClient({ initialContacts, tenantTimezone = 'UTC' }: { initialContacts: ContactData[], tenantTimezone?: string }) {
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [listType, setListType] = useState<'all' | 'sms' | 'no-sms' | 'dnc'>('all');

  // Derive unique agents for the filter dropdown
  const agents = Array.from(new Set(initialContacts.map(c => c.agent?.name).filter(Boolean))) as string[];

  // Filter logic
  const filteredContacts = initialContacts.filter((contact) => {
    // 1. Filter by Agent
    if (selectedAgent !== 'all' && contact.agent?.name !== selectedAgent) {
      return false;
    }

    // 2. Filter by List Type
    if (listType === 'sms' && !contact.smsConsent) return false;
    if (listType === 'no-sms' && contact.smsConsent) return false;
    if (listType === 'dnc' && !contact.doNotCall) return false;

    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Filters Section */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* Agent Filter */}
        <div className="flex items-center space-x-2">
            <label className="text-sm font-bold text-slate-700">Agent:</label>
            <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="block w-48 pl-3 pr-10 py-2 text-sm border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm"
            >
                <option value="all">All Agents</option>
                {agents.map(agent => (
                    <option key={agent} value={agent}>{agent}</option>
                ))}
            </select>
        </div>

        {/* List Type segmented control */}
        <div className="flex bg-slate-200/50 p-1 rounded-lg">
          {(['all', 'sms', 'no-sms', 'dnc'] as const).map((type) => {
            const labels = {
                'all': 'All',
                'sms': 'SMS Consented',
                'no-sms': 'No SMS Consent',
                'dnc': 'Do Not Call'
            };
            return (
              <button
                key={type}
                onClick={() => setListType(type)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  listType === type
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {labels[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">SMS Consent</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">DNC Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Agent</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Call Context</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Updated</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {contact.phoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-md border ${
                       contact.smsConsent
                           ? 'bg-green-50 text-green-700 border-green-200'
                           : 'bg-red-50 text-red-700 border-red-200'
                   }`}>
                    {contact.smsConsent ? 'Consented' : 'Not Consented'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   {contact.doNotCall ? (
                       <span className="px-2.5 py-1 inline-flex text-xs font-bold rounded-md bg-red-50 text-red-700 border border-red-200">
                           DNC Active
                       </span>
                   ) : (
                       <span className="text-slate-400 text-xs font-medium">None</span>
                   )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                   {contact.agent?.name || 'Unknown'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={contact.lastCallContext || ''}>
                   {contact.lastCallContext || <span className="italic text-slate-400">No context available</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                   {new Date(contact.updatedAt).toLocaleDateString('en-US', { timeZone: tenantTimezone })}
                </td>
              </tr>
            ))}
            {filteredContacts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-lg font-medium text-slate-900">No contacts found</p>
                    <p className="text-sm">Adjust your filters or make some calls to populate this list.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
