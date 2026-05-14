'use client';
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SyncCatalogButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/catalog/sync', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                alert(`Sync Complete! Added: ${data.added}, Updated: ${data.updated}`);
                router.refresh();
            } else {
                alert('Sync failed.');
            }
        } catch (e) {
            alert('Error syncing.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing...' : 'Sync with VAPI'}
        </button>
    );
}
