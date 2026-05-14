'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';

const POPULAR_AREA_CODES = [
    { code: '415', label: 'San Francisco (415)' },
    { code: '310', label: 'Los Angeles (310)' },
    { code: '212', label: 'New York (212)' },
    { code: '512', label: 'Austin (512)' },
    { code: '305', label: 'Miami (305)' },
    { code: '206', label: 'Seattle (206)' },
    { code: '312', label: 'Chicago (312)' },
    { code: '617', label: 'Boston (617)' },
    { code: '702', label: 'Las Vegas (702)' },
    { code: 'OTHER', label: 'Other (Type Manually)' }
];

export default function BuyNumberPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/session').then(res => res.json()).then(session => {
        if (session && session.role !== 'SUPER_ADMIN') {
            router.push('/dashboard/agents');
        }
    });
  }, [router]);

  const [selectedCode, setSelectedCode] = useState('415');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuy = async () => {
    setLoading(true);
    setError('');

    const areaCodeToBuy = selectedCode === 'OTHER' ? customCode : selectedCode;

    try {
      const res = await fetch('/api/numbers/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: params.id, areaCode: areaCodeToBuy }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard/agents');
        router.refresh();
      } else {
        // Smart Error Handling suggestion
        if (data.error?.includes("limit")) {
            setError(data.error);
        } else {
            setError(data.error || `Failed to buy ${areaCodeToBuy}. Try a different area code.`);
        }
      }
    } catch (error) {
      console.error(error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Get a Phone Number</h1>
      <p className="text-gray-500 mb-8">This number will be linked to your AI Agent instantly.</p>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-left">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Area Code</label>

        <div className="space-y-4">
            <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white"
            >
                {POPULAR_AREA_CODES.map(opt => (
                    <option key={opt.code} value={opt.code}>{opt.label}</option>
                ))}
            </select>

            {selectedCode === 'OTHER' && (
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Enter 3-digit Area Code</label>
                    <input
                        type="text"
                        maxLength={3}
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md tracking-widest"
                        placeholder="e.g. 917"
                    />
                </div>
            )}

            <button
                onClick={handleBuy}
                disabled={loading}
                className="w-full px-4 py-3 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 mt-4"
            >
                {loading ? 'Provisioning...' : 'Buy Number ($2/mo)'}
            </button>
        </div>

        {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {error}
            </div>
        )}

        <div className="mt-6 text-xs text-gray-500 space-y-1">
            <p>• Powered by VAPI Native Network.</p>
            <p>• Instant activation (approx 60s).</p>
            <p>• Voice capabilities only.</p>
        </div>
      </div>
    </div>
  );
}
