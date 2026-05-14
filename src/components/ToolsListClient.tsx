'use client';

import { useState } from 'react';
import { Plus, Wrench, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ToolsListClient({ initialTools }: { initialTools: any[] }) {
    const [tools, setTools] = useState(initialTools);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this custom tool?')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/tools/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTools(tools.filter(t => t.id !== id));
                router.refresh(); // Refresh NextJS server components
            } else {
                alert("Failed to delete the tool.");
            }
        } catch (error) {
            alert("An error occurred while deleting the tool.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Custom Tools</h1>
                <Link href="/dashboard/tools/new" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Tool
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map((tool) => (
                    <div key={tool.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative group">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-medium text-gray-900 font-mono">{tool.name}</h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleDelete(tool.id)}
                                    disabled={deletingId === tool.id}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete Tool"
                                >
                                    {deletingId === tool.id ? (
                                        <span className="animate-spin w-4 h-4 block border-2 border-red-600 border-t-transparent rounded-full" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                                <Wrench className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                        <div className="bg-gray-50 p-3 rounded border border-gray-100 text-xs font-mono overflow-x-auto">
                            <pre>{JSON.stringify(JSON.parse(tool.parameters), null, 2)}</pre>
                        </div>
                    </div>
                ))}
                {tools.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                        <p>No custom tools yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
