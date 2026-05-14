'use client';

import { useState } from 'react';

export default function AdminMarkupForm() {
  const [markup, setMarkup] = useState(1.2);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to set the Global Markup to ${markup}x for ALL tenants?`)) return;

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/markup', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markup: parseFloat(markup.toString()) }),
      });

      if (res.ok) {
        setMessage('Global Markup Updated Successfully!');
      } else {
        setMessage('Failed to update markup.');
      }
    } catch (error) {
      setMessage('Error updating markup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Global Pricing Control</h3>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Profit Multiplier (Markup)</label>
          <p className="text-xs text-gray-500 mb-2">Example: 1.2 = 20% Profit Margin on top of VAPI cost.</p>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">x</span>
            <input
              type="number"
              step="0.01"
              min="1.0"
              value={markup}
              onChange={(e) => setMarkup(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Apply to All Tenants'}
        </button>

        {message && (
          <p className={`mt-2 text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
