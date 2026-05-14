'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CustomToolsClient({ tenantId, tenantName, initialTools }: { tenantId: string, tenantName: string, initialTools: any[] }) {
  const router = useRouter();
  const [tools, setTools] = useState(initialTools);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [actionType, setActionType] = useState('EMAIL');
  const [actionTarget, setActionTarget] = useState('');
  const [error, setError] = useState('');

  // UI Builder State for Parameters
  const [paramsList, setParamsList] = useState<{name: string, type: string, desc: string, required: boolean}[]>([
      { name: 'name', type: 'string', desc: 'The callers full name', required: true }
  ]);

  const CORE_FIELDS: Record<string, {name: string, type: string, desc: string, required: boolean}[]> = {
      'book_appointment': [
          { name: 'name', type: 'string', desc: 'The callers full name', required: false },
          { name: 'email', type: 'string', desc: "The caller's email. Ask for this gently if not provided.", required: false },
          { name: 'phone', type: 'string', desc: "The caller's phone number", required: false },
          { name: 'startTime', type: 'string', desc: 'ISO 8601 formatted start time', required: true },
          { name: 'endTime', type: 'string', desc: 'ISO 8601 formatted end time', required: true },
          { name: 'purpose', type: 'string', desc: 'Purpose of the appointment', required: false },
          { name: 'timezone', type: 'string', desc: "The caller's timezone. Ask gently. Default to 'US/Central' if unknown.", required: false }
      ]
  };

  const isCoreField = (toolName: string, paramName: string) => {
      return CORE_FIELDS[toolName]?.some(f => f.name === paramName) || false;
  };

  const handleNameChange = (val: string) => {
      const formattedName = val.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      setName(formattedName);

      // Auto-inject missing core fields if this tool matches a standard one
      if (CORE_FIELDS[formattedName]) {
          setParamsList(current => {
              const newParams = [...current];
              CORE_FIELDS[formattedName].forEach(coreParam => {
                  if (!newParams.some(p => p.name === coreParam.name)) {
                      newParams.push({ ...coreParam });
                  }
              });
              return newParams;
          });
      }
  };

  const generateJsonSchema = () => {
      const properties: any = {};
      const required: string[] = [];

      paramsList.forEach(p => {
          if (!p.name.trim()) return;
          properties[p.name.trim()] = {
              type: p.type,
              description: p.desc || undefined
          };
          if (p.required) required.push(p.name.trim());
      });

      return {
          type: "object",
          properties,
          required
      };
  };

  const loadToolForEditing = (tool: any) => {
      setEditingId(tool.id);
      setName(tool.name);
      setDescription(tool.description);
      setActionType(tool.actionType);
      setActionTarget(tool.actionTarget);

      try {
          const parsed = JSON.parse(tool.parameters);
          const props = parsed.properties || {};
          const req = parsed.required || [];

          const loadedParams = Object.keys(props).map(k => ({
              name: k,
              type: props[k].type || 'string',
              desc: props[k].description || '',
              required: req.includes(k)
          }));

          setParamsList(loadedParams.length > 0 ? loadedParams : [{ name: '', type: 'string', desc: '', required: false }]);
      } catch (e) {
          setParamsList([{ name: 'name', type: 'string', desc: 'The callers full name', required: true }]);
      }

      // Re-inject core fields just in case they were deleted from the JSON historically
      if (CORE_FIELDS[tool.name]) {
          setParamsList(current => {
              const newParams = [...current];
              CORE_FIELDS[tool.name].forEach(coreParam => {
                  if (!newParams.some(p => p.name === coreParam.name)) {
                      newParams.push({ ...coreParam });
                  }
              });
              return newParams;
          });
      }
      setIsCreating(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const schema = generateJsonSchema();

      const endpoint = editingId
        ? `/api/admin/tenants/${tenantId}/tools/${editingId}`
        : `/api/admin/tenants/${tenantId}/tools`;

      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          parameters: JSON.stringify(schema),
          actionType,
          actionTarget
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save tool');
      }

      const { tool } = await res.json();

      if (editingId) {
          setTools(tools.map((t: any) => t.id === tool.id ? tool : t));
      } else {
          setTools([tool, ...tools]);
      }

      setIsCreating(false);
      setEditingId(null);
      // Reset Form
      setName('');
      setDescription('');
      setActionType('EMAIL');
      setActionTarget('');
      setParamsList([{ name: 'name', type: 'string', desc: 'The callers full name', required: true }]);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error saving tool.');
    } finally {
      setLoading(false);
    }
  };

  const addParam = () => setParamsList([...paramsList, { name: '', type: 'string', desc: '', required: false }]);
  const updateParam = (index: number, key: string, value: any) => {
      const newParams = [...paramsList];
      newParams[index] = { ...newParams[index], [key]: value };
      setParamsList(newParams);
  };
  const removeParam = (index: number) => setParamsList(paramsList.filter((_, i) => i !== index));

  const handleDelete = async (toolId: string) => {
    if (!confirm('Are you sure you want to delete this custom tool? It may break agents actively using it.')) return;
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}/tools/${toolId}`, { method: 'DELETE' });
      if (res.ok) {
        setTools(tools.filter(t => t.id !== toolId));
        router.refresh();
      }
    } catch(e) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link href={`/admin/tenants/${tenantId}`} className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Tools</h1>
          <p className="text-gray-500">Manage custom LLM capabilities for {tenantName}</p>
        </div>
      </div>

      {!isCreating && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Tool</span>
          </button>
        </div>
      )}

      {isCreating && (
        <div className="bg-white p-6 border rounded-xl shadow-sm mb-8">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Custom Tool' : 'Create New Custom Tool'}</h2>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSave} className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tool Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  required
                  placeholder="e.g. prescription_refill"
                  className="w-full border rounded-lg p-2"
                />
                <p className="text-xs text-gray-500 mt-1">Lowercase and underscores only.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (for LLM)</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  placeholder="Trigger this tool when the user asks to refill..."
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t pt-4 border-b pb-4">
                <div>
                  <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium">Tool Parameters</label>
                      <button type="button" onClick={addParam} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 hover:bg-gray-200">
                          + Add Field
                      </button>
                  </div>

                  <div className="space-y-3">
                      {paramsList.map((p, idx) => {
                          const isLocked = isCoreField(name, p.name);
                          return (
                          <div key={idx} className="bg-gray-50 p-3 rounded border space-y-2 relative">
                              {!isLocked && (
                                  <button type="button" onClick={() => removeParam(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              )}
                              {isLocked && (
                                  <span className="absolute top-2 right-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Core Field (Locked)</span>
                              )}
                              <div className="grid grid-cols-2 gap-2 pr-20">
                                  <input
                                      placeholder="Field Name (e.g. dob)"
                                      value={p.name}
                                      onChange={e => updateParam(idx, 'name', e.target.value)}
                                      disabled={isLocked}
                                      className={`border px-2 py-1 text-sm rounded w-full ${isLocked ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                                  />
                                  <select
                                      value={p.type}
                                      onChange={e => updateParam(idx, 'type', e.target.value)}
                                      disabled={isLocked}
                                      className={`border px-2 py-1 text-sm rounded w-full ${isLocked ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                                  >
                                      <option value="string">Text (String)</option>
                                      <option value="number">Number</option>
                                      <option value="boolean">Yes/No (Boolean)</option>
                                  </select>
                              </div>
                              <input
                                  placeholder="Description for AI (e.g. 'The users date of birth')"
                                  value={p.desc}
                                  onChange={e => updateParam(idx, 'desc', e.target.value)}
                                  className="border px-2 py-1 text-sm rounded w-full mt-1"
                              />
                              <label className="flex items-center space-x-2 text-xs text-gray-600">
                                  <input
                                      type="checkbox"
                                      checked={p.required}
                                      onChange={e => updateParam(idx, 'required', e.target.checked)}
                                      disabled={isLocked && CORE_FIELDS[name]?.find(f => f.name === p.name)?.required}
                                  />
                                  <span>Required Field</span>
                              </label>
                          </div>
                      )})}
                      {paramsList.length === 0 && (
                          <p className="text-sm text-gray-500 italic">No parameters defined. The AI will call this tool without any arguments.</p>
                      )}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                    <div className="text-gray-400 mb-2">// Generated JSON Schema</div>
                    <pre>{JSON.stringify(generateJsonSchema(), null, 2)}</pre>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Action Type</label>
                <select
                  value={actionType}
                  onChange={e => setActionType(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="EMAIL">Send Email</option>
                  <option value="WEBHOOK">Send Webhook (POST)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Action Target</label>
                <input
                  type="text"
                  value={actionTarget}
                  onChange={e => setActionTarget(e.target.value)}
                  required
                  placeholder={actionType === 'EMAIL' ? "e.g. info@clinic.com" : "e.g. https://hook.zapier.com/..."}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  setName('');
                  setDescription('');
                  setParamsList([{ name: 'name', type: 'string', desc: 'The callers full name', required: true }]);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingId ? 'Update Tool' : 'Save Tool')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Custom Tools */}
      <div className="space-y-4">
        {tools.length === 0 && !isCreating && (
          <div className="text-center py-12 bg-white border rounded-xl text-gray-500">
            No custom tools defined yet.
          </div>
        )}

        {tools.map((tool: any) => (
          <div key={tool.id} className="bg-white p-5 border rounded-xl flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-gray-900">{tool.name}</h3>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                  {tool.actionType}
                </span>
              </div>
              <p className="text-sm text-gray-600">{tool.description}</p>
              <p className="text-xs text-gray-500 font-mono mt-2">Target: {tool.actionTarget}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadToolForEditing(tool)}
                className="text-blue-500 hover:text-blue-700 p-2 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(tool.id)}
                className="text-red-500 hover:text-red-700 p-2"
                title="Delete Tool"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
