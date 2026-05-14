'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewToolPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parameters, setParameters] = useState('{\n  "type": "object",\n  "properties": {\n    "param1": {\n      "type": "string",\n      "description": "Description..."\n    }\n  },\n  "required": ["param1"]\n}');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, parameters }),
      });

      if (res.ok) {
        router.push('/dashboard/tools');
        router.refresh();
      } else {
        alert('Failed to create tool');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Custom Tool</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tool Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 mt-1 border rounded-md"
            placeholder="check_inventory"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 mt-1 border rounded-md"
            placeholder="Checks if product is in stock"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Parameters (JSON Schema)</label>
          <p className="text-xs text-gray-500 mb-2">Define the inputs your tool expects.</p>
          <textarea
            rows={10}
            value={parameters}
            onChange={(e) => setParameters(e.target.value)}
            className="w-full px-3 py-2 mt-1 border rounded-md font-mono text-sm bg-gray-50"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {loading ? 'Creating...' : 'Create Tool'}
        </button>
      </form>
    </div>
  );
}
