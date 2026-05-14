'use client';

import { useState, useEffect } from 'react';
import { Calculator, DollarSign, Activity, HelpCircle, FileText } from 'lucide-react';

export default function AdminCostSimulator() {
    const [catalog, setCatalog] = useState<{ models: any[], voices: any[] }>({ models: [], voices: [] });

    // Form State
    const [model, setModel] = useState('gpt-4o');
    const [voiceId, setVoiceId] = useState('sarah');
    const [markup, setMarkup] = useState(1.2);
    const [durationMin, setDurationMin] = useState(1);

    useEffect(() => {
        fetch('/api/catalog')
            .then(res => res.json())
            .then(data => {
                if (data.catalog) {
                    setCatalog({
                        models: data.catalog.filter((i: any) => i.type === 'model'),
                        voices: data.catalog.filter((i: any) => i.type === 'voice')
                    });
                }
            })
            .catch(err => console.error("Failed to load catalog", err));
    }, []);

    // Helper: Find selected entities
    const selectedModel = catalog.models.find(m => m.value === model);
    const selectedVoice = catalog.voices.find(v => v.value === voiceId);

    // --- FALLBACK LOGIC CALCULATOR ---
    // Uses the EXACT logic from `api/vapi/route.ts` and `AgentSettingsForm`
    const calculateFallback = () => {
        const vapiBaseCost = 0.05;
        const modelCost = selectedModel?.costPerUnit ?? (model.includes('gpt-4') && !model.includes('mini') ? 0.06 : 0.01);
        const voiceCost = selectedVoice?.costPerUnit ?? (voiceId.includes('11labs') ? 0.12 : 0.04);

        const baseCostPerMinute = vapiBaseCost + modelCost + voiceCost;
        const totalBaseCost = baseCostPerMinute * durationMin;
        const billedToTenant = totalBaseCost * markup;

        return {
            baseCost: totalBaseCost,
            billed: billedToTenant,
            profit: billedToTenant - totalBaseCost,
            breakdown: `Vapi ($0.05) + Model ($${modelCost.toFixed(3)}) + Voice ($${voiceCost.toFixed(3)})`
        };
    };

    // --- REAL LOGIC CALCULATOR (ESTIMATED BASED ON REAL WORLD AVG) ---
    // Vapi costs $0.05. Model costs based on realistic token/char averages.
    const calculateRealEstimate = () => {
        const vapiBaseCost = 0.05;

        // Realistic Model Averages per minute (input + output tokens for voice)
        let realModelCostPerMin = 0.001; // generic cheap model
        if (model.includes('mini') || model.includes('llama')) realModelCostPerMin = 0.0001;
        else if (model.includes('gpt-4') || model.includes('claude-3-opus')) realModelCostPerMin = 0.03; // GPT-4o is expensive
        else if (model.includes('claude-3-haiku')) realModelCostPerMin = 0.001;

        // Realistic Voice Averages per minute (chars generated)
        let realVoiceCostPerMin = 0.04; // Vapi standard
        if (voiceId.includes('11labs')) realVoiceCostPerMin = 0.12;
        else if (voiceId.includes('openai') || voiceId.includes('alloy') || voiceId.includes('fable')) realVoiceCostPerMin = 0.009; // OpenAI TTS
        else if (voiceId.includes('playht')) realVoiceCostPerMin = 0.05;

        const baseCostPerMinute = vapiBaseCost + realModelCostPerMin + realVoiceCostPerMin;
        const totalBaseCost = baseCostPerMinute * durationMin;
        const billedToTenant = totalBaseCost * markup;

        return {
            baseCost: totalBaseCost,
            billed: billedToTenant,
            profit: billedToTenant - totalBaseCost,
            breakdown: `Vapi ($0.05) + Real Model (~$${realModelCostPerMin.toFixed(4)}) + Real Voice (~$${realVoiceCostPerMin.toFixed(4)})`
        };
    };

    const fallback = calculateFallback();
    const realEst = calculateRealEstimate();

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
            <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
                <Calculator className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">Billing Logic Simulator</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Controls */}
                <div className="lg:col-span-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Agent Model</label>
                        <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                            {catalog.models.map(m => <option key={m.id} value={m.value}>{m.name}</option>)}
                            {catalog.models.length === 0 && <option value="gpt-4o">GPT-4o (Fallback)</option>}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Agent Voice</label>
                        <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                            {catalog.voices.map(v => <option key={v.id} value={v.value}>{v.name}</option>)}
                            {catalog.voices.length === 0 && <option value="sarah">Sarah (Fallback)</option>}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Markup Multiplier</label>
                            <input type="number" step="0.1" value={markup} onChange={(e) => setMarkup(parseFloat(e.target.value))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Call Duration (Min)</label>
                            <input type="number" step="0.5" value={durationMin} onChange={(e) => setDurationMin(parseFloat(e.target.value))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Results Comparison */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fallback Card */}
                    <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-orange-900 flex items-center">
                                <FileText className="w-4 h-4 mr-1.5" /> FALLBACK LOGIC
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-orange-100">
                                <span className="text-xs text-orange-800 font-medium">Assumed Platform Cost</span>
                                <span className="text-sm font-bold text-orange-900">${fallback.baseCost.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-orange-100">
                                <span className="text-xs text-orange-800 font-medium">Billed to Tenant</span>
                                <span className="text-sm font-bold text-blue-700">${fallback.billed.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-xs font-bold text-orange-900">Your Platform Profit</span>
                                <span className="text-lg font-black text-green-600">${fallback.profit.toFixed(4)}</span>
                            </div>
                            <p className="text-[10px] text-orange-700 mt-2 font-mono leading-tight bg-orange-100/50 p-2 rounded">
                                Base per min: {fallback.breakdown}
                            </p>
                        </div>
                    </div>

                    {/* Real Est Card */}
                    <div className="bg-green-50 p-5 rounded-xl border border-green-200 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-green-900 flex items-center">
                                <Activity className="w-4 h-4 mr-1.5" /> REAL LOGIC (Est.)
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-green-100">
                                <span className="text-xs text-green-800 font-medium">Actual Platform Cost</span>
                                <span className="text-sm font-bold text-green-900">${realEst.baseCost.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-green-100">
                                <span className="text-xs text-green-800 font-medium">Billed to Tenant</span>
                                <span className="text-sm font-bold text-blue-700">${realEst.billed.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-xs font-bold text-green-900">Your Platform Profit</span>
                                <span className="text-lg font-black text-green-600">${realEst.profit.toFixed(4)}</span>
                            </div>
                            <p className="text-[10px] text-green-700 mt-2 font-mono leading-tight bg-green-100/50 p-2 rounded">
                                Base per min: {realEst.breakdown}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-start space-x-2 bg-blue-50 text-blue-800 p-3 rounded-lg text-xs font-medium border border-blue-100">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                <p>
                    <strong>Why two logics?</strong> "Real" logic passes the true, hyper-granular AI token cost directly to the tenant + markup. However, if you want predictable margins regardless of what models the tenant uses, "Fallback" logic assumes a static, flat rate based on your ProviderModel Catalog settings.
                </p>
            </div>
        </div>
    );
}
