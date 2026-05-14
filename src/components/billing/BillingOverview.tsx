'use client';

import { CreditCard, DollarSign, Download, Clock } from 'lucide-react';

export default function BillingOverview({
    currentUsage,
    totalAccrued
}: {
    currentUsage: number,
    totalAccrued: number
}) {
  return (
    <div className="space-y-8">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Current Usage */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Current Usage (This Month)</h3>
                        <p className="text-sm text-gray-500">Live API usage costs</p>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <DollarSign className="w-5 h-5" />
                    </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">${currentUsage.toFixed(2)}</div>
            </div>

            {/* Total Outstanding */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Total Accrued Balance</h3>
                        <p className="text-sm text-gray-500">All-time unpaid usage</p>
                    </div>
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                        <CreditCard className="w-5 h-5" />
                    </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">${totalAccrued.toFixed(2)}</div>
                <div className="mt-6 flex space-x-3">
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800" disabled>
                        Powered by Stripe (Coming Soon)
                    </button>
                </div>
            </div>
        </div>

        {/* Itemized Usage */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Itemized Usage (Current Month)</h3>
            </div>
            <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">Phone Number Monthly Fee</td>
                        <td className="px-6 py-4 text-sm text-gray-500">Subscription</td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">$2.00</td>
                    </tr>
                    <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">AI Minute Usage</td>
                        <td className="px-6 py-4 text-sm text-gray-500">Metered</td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">${currentUsage.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-gray-50 font-bold">
                        <td className="px-6 py-4 text-sm text-gray-900">Total Estimated</td>
                        <td className="px-6 py-4 text-sm text-gray-500"></td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900">${(currentUsage + 2.00).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            </div>
        </div>
    </div>
  );
}
