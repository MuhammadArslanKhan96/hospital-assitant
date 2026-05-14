'use client';
import { useState } from 'react';
import { Check, X, Edit, Save, Trash2, Power, PowerOff } from 'lucide-react';

export default function CatalogTable({ initialData }: { initialData: any[] }) {
    const [data, setData] = useState(initialData);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCost, setEditCost] = useState<string>('');

    const toggleEnabled = async (id: string, currentState: boolean) => {
        const newState = !currentState;
        try {
            const res = await fetch('/api/admin/catalog', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isEnabled: newState })
            });
            if (res.ok) {
                setData(data.map(item => item.id === id ? { ...item, isEnabled: newState } : item));
            }
        } catch (e) { console.error(e); }
    };

    const deleteItem = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item? If it is a custom voice, the model files will also be removed from the server.')) return;

        try {
            const res = await fetch('/api/admin/catalog', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                setData(data.filter(item => item.id !== id));
            }
        } catch (e) { console.error(e); }
    };

    const startEdit = (item: any) => {
        setEditingId(item.id);
        setEditCost(item.costPerUnit.toString());
    };

    const saveEdit = async (id: string) => {
        try {
            const cost = parseFloat(editCost);
            await fetch('/api/admin/catalog', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, costPerUnit: cost })
            });
            setData(data.map(item => item.id === id ? { ...item, costPerUnit: cost } : item));
            setEditingId(null);
        } catch (e) { console.error(e); }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Cost (USD)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.provider}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {editingId === item.id ? (
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={editCost}
                                        onChange={e => setEditCost(e.target.value)}
                                        className="w-20 px-2 py-1 border rounded"
                                    />
                                ) : (
                                    `$${item.costPerUnit.toFixed(4)}`
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {item.isEnabled ? 'Active' : 'Disabled'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                    <button
                                        onClick={() => toggleEnabled(item.id, item.isEnabled)}
                                        title={item.isEnabled ? 'Deactivate' : 'Activate'}
                                        className={`p-2 rounded-lg transition-colors ${item.isEnabled ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                    >
                                        {item.isEnabled ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                    </button>

                                    {editingId === item.id ? (
                                        <>
                                            <button onClick={() => saveEdit(item.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Save className="w-4 h-4" /></button>
                                            <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><X className="w-4 h-4" /></button>
                                        </>
                                    ) : (
                                        <button onClick={() => startEdit(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                    )}

                                    {item.provider === 'custom-render' && (
                                        <button
                                            onClick={() => deleteItem(item.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            title="Delete Custom Voice"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}
