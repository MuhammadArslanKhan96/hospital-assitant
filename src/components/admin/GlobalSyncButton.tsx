'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function GlobalSyncButton() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [stats, setStats] = useState<any>(null);

    const handleSync = async () => {
        if (!confirm('This will re-sync EVERY agent on the platform with Vapi to apply the latest prompt protocols. Continue?')) return;
        
        setStatus('loading');
        try {
            const res = await fetch('/api/admin/agents/sync-all', { method: 'POST' });
            const data = await res.json();
            
            if (data.success) {
                setStats(data.results);
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        }
    };

    return (
        <div className="flex flex-col items-end space-y-2">
            <button
                onClick={handleSync}
                disabled={status === 'loading'}
                className={`flex items-center px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${
                    status === 'loading' 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-vc-dark text-white hover:bg-slate-800'
                }`}
            >
                <RefreshCw className={`w-4 h-4 mr-2 ${status === 'loading' ? 'animate-spin' : ''}`} />
                {status === 'loading' ? 'Syncing Agents...' : 'Sync All Agents'}
            </button>

            {status === 'success' && stats && (
                <div className="flex items-center text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 animate-in fade-in slide-in-from-top-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Updated {stats.success} agents ({stats.failed} failed)
                </div>
            )}

            {status === 'error' && (
                <div className="flex items-center text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Global Sync Failed
                </div>
            )}
        </div>
    );
}
