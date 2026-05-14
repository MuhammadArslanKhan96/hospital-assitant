'use client';

import { useState } from 'react';
import { Save, Loader2, Info, CheckCircle2 } from 'lucide-react';
import AgentTestButton from '@/components/AgentTestButton';

export default function DemoAgentClient({ initialData, models, voices }: { initialData: any, models: any[], voices: any[] }) {
  const [formData, setFormData] = useState({
    name: initialData.name,
    vapiAssistantId: initialData.vapiAssistantId || '',
    systemPrompt: initialData.systemPrompt,
    firstMessage: initialData.firstMessage,
    model: initialData.model,
    voiceId: initialData.voiceId,
    isActive: initialData.isActive,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/demo-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      const updated = await res.json();
      setFormData({
        ...formData,
        vapiAssistantId: updated.vapiAssistantId // In case the backend syncs it
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2" /> Configuration saved successfully.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Agent Configuration</h2>
              <p className="text-sm text-slate-500 mt-1">This agent will be accessible via the "Talk to our Agent" button on the home page.</p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isActive ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.isActive ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-sm font-medium text-slate-700">
                  {formData.isActive ? 'Enabled on Marketing Site' : 'Disabled'}
                </div>
              </label>
            </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Agent Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Marketing Demo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">First Message</label>
            <input
              type="text"
              value={formData.firstMessage}
              onChange={(e) => setFormData({ ...formData, firstMessage: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="What the AI says first when someone clicks call."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">System Prompt</label>
            <textarea
              rows={6}
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono"
              placeholder="You are an AI receptionist..."
            />
            <p className="text-xs text-slate-500">Define the personality, knowledge, and restrictions of the demo agent.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Voice</label>
                <select
                  value={formData.voiceId}
                  onChange={(e) => setFormData({ ...formData, voiceId: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {voices.length > 0 ? voices.map(v => (
                    <option key={v.value} value={v.value}>{v.name}</option>
                  )) : (
                     <option value={formData.voiceId}>Default ({formData.voiceId})</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Language Model</label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {models.length > 0 ? models.map(m => (
                    <option key={m.value} value={m.value}>{m.name}</option>
                  )) : (
                     <option value={formData.model}>Default ({formData.model})</option>
                  )}
                </select>
              </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <div className="flex items-center text-sm text-slate-500">
              <Info className="w-4 h-4 mr-2" />
              Saving this configuration will sync it instantly to the VAPI network.
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? 'Syncing...' : 'Save & Sync'}
            </button>
        </div>
      </div>

      {formData.vapiAssistantId && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Test Your Demo Agent</h3>
              <p className="text-sm text-slate-500 mt-1">Talk to the agent exactly as it will appear on the landing page.</p>
              <div className="mt-2 text-xs font-mono text-slate-400">VAPI ID: {formData.vapiAssistantId}</div>
            </div>
            <AgentTestButton assistantId={formData.vapiAssistantId} agentName={formData.name} />
        </div>
      )}
    </div>
  );
}
