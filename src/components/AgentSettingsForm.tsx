'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VAPI_TOOLS_CLIENT } from '@/lib/vapi-tools-client';
import { HelpCircle, Copy, Plus, Trash2, Volume2, MessageSquare, Wrench, DollarSign, Sparkles, Eye, Check, Phone, Clock, Zap } from 'lucide-react';
import AIPromptModal from './agents/AIPromptModal';
import { buildFullSystemPrompt, TIME_CONTEXT_INSTRUCTION, SCHEDULING_PROTOCOL_INSTRUCTION, COMPLIANCE_PROTOCOL_INSTRUCTION, CALLER_ID_INSTRUCTION } from '@/lib/agent-instructions';

const AVAILABLE_TOOLS = [
    { name: 'check_availability', label: 'Check Availability', tip: "To check availability, say: 'Let me check the schedule for you.' and call check_availability with the user's desired time." },
    { name: 'book_appointment', label: 'Book Appointment', tip: "To book, say: 'Great, I'm booking that now.' and call book_appointment with the name, time, and email." },
    { name: 'cancel_appointment', label: 'Cancel Appointment', tip: "Use this to cancel an existing appointment." },
    { name: 'reschedule_appointment', label: 'Reschedule Appointment', tip: "Use this to move an appointment to a new date and time." },
    { name: 'capture_lead', label: 'Capture Lead', tip: "If they aren't ready to book, say: 'I can have someone call you back.' and call capture_lead." },
    { name: 'log_call', label: 'Log Call Outcome', tip: "At the end of the call, always call log_call to save the summary and outcome." },
    { name: 'end_call', label: 'End Call', tip: "Use the end_call tool when the conversation is finished, or after leaving a voicemail." },
  { name: 'transferCall', label: 'Call Transfer', tip: "To transfer a call, use the transfer_call_tool. Select the appropriate destination from the available options based on the user's request. Do NOT ask the user for a phone number." },
  {
      name: 'record_contact_preferences',
      label: 'Consent & DNC',
      tip: "At the end of the call, ask: 'Do you consent to receiving text messages from us?' and use record_contact_preferences to log their choice. If they ever get angry or ask not to be called, immediately use the tool to flag them as DNC and end the call."
  }
];

export default function AgentSettingsForm({ agent, markup = 1.2, billingMode = 'FALLBACK', isAdmin = false }: { agent: any, markup?: number, billingMode?: string, isAdmin?: boolean }) {

    const router = useRouter();
    const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt);
    const [voicemailHandling, setVoicemailHandling] = useState(agent.voicemailHandling || '');
    const [voiceId, setVoiceId] = useState(agent.voiceId);
    const [model, setModel] = useState(agent.model);
    const [type, setType] = useState(agent.type || 'INBOUND');

    // Voice Controls
    const [speaksFirst, setSpeaksFirst] = useState(!!agent.firstMessage);
    const [firstMessage, setFirstMessage] = useState(agent.firstMessage || "Hello, how can I help you?");
    const [backgroundSound, setBackgroundSound] = useState(agent.backgroundSound || 'off');

    // Advanced Settings
    const [temperature, setTemperature] = useState<number>(agent.temperature ?? 0.7);
    const [speed, setSpeed] = useState<number>(agent.speed ?? 1.0);
    const [emotion, setEmotion] = useState<number>(agent.emotion ?? 0.667);
    const [stability, setStability] = useState<number>(agent.stability ?? 0.8);
    const [clarity, setClarity] = useState<number>(agent.clarity ?? 0.75);
    const [reasoningMode, setReasoningMode] = useState<boolean>(agent.reasoningMode ?? false);
    const [longTermMemory, setLongTermMemory] = useState<boolean>(agent.longTermMemory ?? false);
    const [fillerInjectionEnabled, setFillerInjectionEnabled] = useState<boolean>(agent.fillerInjectionEnabled ?? true);
    const [backchannelingEnabled, setBackchannelingEnabled] = useState<boolean>(agent.backchannelingEnabled ?? true);
    const [interruptionThreshold, setInterruptionThreshold] = useState<number>(agent.interruptionThreshold ?? 0.1);
    const [silenceTimeout, setSilenceTimeout] = useState<number>(agent.silenceTimeout ?? 0.4);
    const [transcriberEnabled, setTranscriberEnabled] = useState<boolean>(agent.transcriberEnabled ?? true);
    const [isBilingual, setIsBilingual] = useState<boolean>(agent.isBilingual ?? false);

    // Protocol Injections
    const [enableTimeContext, setEnableTimeContext] = useState<boolean>(agent.enableTimeContext ?? true);
    const [enableSchedulingProtocol, setEnableSchedulingProtocol] = useState<boolean>(agent.enableSchedulingProtocol ?? true);
    const [enableComplianceProtocol, setEnableComplianceProtocol] = useState<boolean>(agent.enableComplianceProtocol ?? true);
    const [enableCallerId, setEnableCallerId] = useState<boolean>(agent.enableCallerId ?? true);
    const [enableSilenceReengagement, setEnableSilenceReengagement] = useState<boolean>(agent.enableSilenceReengagement ?? true);
    const [silenceMessage, setSilenceMessage] = useState<string>(agent.silenceMessage ?? "Are you still there?");
    const [maxDurationSeconds, setMaxDurationSeconds] = useState<number>(agent.maxDurationSeconds ?? 600);
    const [maxMessages, setMaxMessages] = useState<number>(agent.maxMessages ?? 20);
    const [silenceTimeoutSeconds, setSilenceTimeoutSeconds] = useState<number>(agent.silenceTimeoutSeconds ?? 30);
    const [endCallOnSilenceTimeoutEnabled, setEndCallOnSilenceTimeoutEnabled] = useState<boolean>(agent.endCallOnSilenceTimeoutEnabled ?? true);

    // Tools
    let initialTools = [];
    try { initialTools = agent.tools ? JSON.parse(agent.tools) : []; } catch (e) { initialTools = []; }
    const [selectedTools, setSelectedTools] = useState<string[]>(initialTools);

    // Transfer Targets
    // Robustly parse the transferTargets from the agent prop
    let initialTargets = [];
    try {
        // If it's already an object/array, use it. If string, parse it.
        if (typeof agent.transferTargets === 'string') {
            initialTargets = JSON.parse(agent.transferTargets);
        } else if (Array.isArray(agent.transferTargets)) {
            initialTargets = agent.transferTargets;
        }
    } catch (e) {
        console.error("Failed to parse transferTargets", e);
        initialTargets = [];
    }
    const [targets, setTargets] = useState<{ label: string, number: string }[]>(initialTargets);
    const [newTargetLabel, setNewTargetLabel] = useState('');
    const [newTargetNumber, setNewTargetNumber] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [catalog, setCatalog] = useState<{ models: any[], voices: any[] }>({ models: [], voices: [] });
  const [customTools, setCustomTools] = useState<any[]>([]);

    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    // Cost Estimation State
    const [estCallsPerDay, setEstCallsPerDay] = useState(50);
    const [estDurationMin, setEstDurationMin] = useState(3);

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

        if (agent.tenantId) {
            fetch(`/api/tools?tenantId=${agent.tenantId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.tools) {
                        setCustomTools(data.tools);
                    }
                })
                .catch(err => console.error("Failed to fetch custom tools", err));
        }
    }, [agent.tenantId]);

    // Cost Calculation
    const calculateCost = () => {
        // 1. Find Cost Factors
        const selectedModel = catalog.models.find(m => m.value === model);
        const selectedVoice = catalog.voices.find(v => v.value === voiceId);

        const vapiBaseCost = 0.05;
        const phoneNumberCost = 2.00 / 30; // ~$2/mo amortized daily (~$0.07/day)

        let baseCostPerMinute = 0;
        let modelCost = 0;
        let voiceCost = 0;

        if (billingMode === 'FALLBACK') {
            modelCost = selectedModel?.costPerUnit ?? (model.includes('gpt-4') && !model.includes('mini') ? 0.06 : 0.01);
            voiceCost = selectedVoice?.costPerUnit ?? (voiceId.includes('11labs') ? 0.12 : 0.04);
            baseCostPerMinute = vapiBaseCost + modelCost + voiceCost;
        } else {
            // REAL mode: highly accurate estimated token averages for 1 min
            const modelName = (selectedModel ? `${selectedModel.name} ${selectedModel.provider}` : model || '').toLowerCase();
            const voiceProvider = (selectedVoice ? `${selectedVoice.provider} ${selectedVoice.name}` : voiceId || '').toLowerCase();

            // modelCost estimation (based on ~250 tokens/min)
            if (modelName.includes('mini') || modelName.includes('llama') || modelName.includes('haiku')) {
                modelCost = 0.0001;
            } else if (modelName.includes('gpt-4')) {
                modelCost = 0.01;
            } else if (modelName.includes('claude-3-opus')) {
                modelCost = 0.015;
            } else if (modelName.includes('sonnet')) {
                modelCost = 0.003;
            } else {
                modelCost = 0.001;
            }

            // voiceCost estimation (based on ~500 chars/min)
            if (selectedVoice?.provider === 'custom-render' || selectedVoice?.provider === 'staff-twin') {
                voiceCost = selectedVoice.costPerUnit ?? 0.0;
            } else if (voiceProvider.includes('11labs') || voiceProvider.includes('elevenlabs')) {
                voiceCost = 0.045;
            } else if (voiceProvider.includes('openai') || voiceProvider.includes('alloy') || voiceProvider.includes('fable')) {
                voiceCost = 0.008;
            } else if (voiceProvider.includes('playht')) {
                voiceCost = 0.025;
            } else if (voiceProvider.includes('cartesia') || voiceProvider.includes('rime')) {
                voiceCost = 0.035;
            } else {
                voiceCost = 0.04; // Fallback (Vapi/Deepgram)
            }

            baseCostPerMinute = vapiBaseCost + modelCost + voiceCost;
        }
        const markedUpCostPerMinute = baseCostPerMinute * markup;

        const dailyUsageMinutes = estCallsPerDay * estDurationMin;

        const dailyCost = (dailyUsageMinutes * markedUpCostPerMinute) + phoneNumberCost;
        const monthlyCost = dailyCost * 30;

        return {
            perMinute: markedUpCostPerMinute.toFixed(3),
            daily: dailyCost.toFixed(2),
            monthly: monthlyCost.toFixed(2),
            breakdown: { model: modelCost, voice: voiceCost, base: vapiBaseCost, markup: markup }
        };
    };

    const cost = calculateCost();

    const toggleTool = (toolName: string) => {
        let nextTools = [...selectedTools];
        const isBookingTool = toolName === 'check_availability' || toolName === 'book_appointment';

        if (nextTools.includes(toolName)) {
            // Deselecting
            if (isBookingTool) {
                // Remove both if either is deselected
                nextTools = nextTools.filter(t => t !== 'check_availability' && t !== 'book_appointment');
            } else {
                nextTools = nextTools.filter(t => t !== toolName);
            }
        } else {
            // Selecting
            if (isBookingTool) {
                // Add both if either is selected
                if (!nextTools.includes('check_availability')) nextTools.push('check_availability');
                if (!nextTools.includes('book_appointment')) nextTools.push('book_appointment');
            } else {
                nextTools.push(toolName);
            }
        }
        setSelectedTools(nextTools);
    };

    const addTarget = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTargetLabel && newTargetNumber) {
            setTargets([...targets, { label: newTargetLabel, number: newTargetNumber }]);
            setNewTargetLabel('');
            setNewTargetNumber('');
        }
    };

    const removeTarget = (index: number) => {
        setTargets(targets.filter((_, i) => i !== index));
    };

    const copyToPrompt = (text: string) => {
        setSystemPrompt((prev: string) => prev + "\n" + text);
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch(`/api/agents/${agent.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemPrompt,
                    voiceId,
                    model,
                    type,
                    tools: selectedTools,
                    transferTargets: targets,
                    // Voice Controls
                    firstMessage: speaksFirst ? firstMessage : null, // Send null if disabled
                    backgroundSound,
                    temperature,
                    speed,
                    emotion,
                    stability,
                    clarity,
                    reasoningMode,
                    longTermMemory,
                    fillerInjectionEnabled,
                    backchannelingEnabled,
                    interruptionThreshold,
                    silenceTimeout,
                    transcriberEnabled,
                    isBilingual,
                    voicemailHandling,
                    enableTimeContext,
                    enableSchedulingProtocol,
                    enableComplianceProtocol,
                    enableCallerId,
                    enableSilenceReengagement,
                    silenceMessage,
                    maxDurationSeconds,
                    maxMessages,
                    silenceTimeoutSeconds,
                    endCallOnSilenceTimeoutEnabled
                }),
            });

            if (res.ok) {
                setMessage('Agent updated & synced with VAPI!');
                router.refresh();
            } else {
                setMessage('Failed to update agent.');
            }
        } catch (error) {
            setMessage('Error updating agent.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main Form */}
            <div className="lg:col-span-2 premium-card p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Configuration</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">{agent.name}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                ID: {agent.id.slice(0, 8)}...
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                ${cost.perMinute}/min
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-10">

                    {/* Core Settings */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Core Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-slate-900 focus:border-slate-900 shadow-sm">
                                    <option value="INBOUND">Inbound</option>
                                    <option value="OUTBOUND">Outbound</option>
                                    <option value="HYBRID">Hybrid</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Model</label>
                                <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-slate-900 focus:border-slate-900 shadow-sm">
                                    {/* Group by Provider */}
                                    {Object.entries(catalog.models.reduce((acc: any, item: any) => {
                                        (acc[item.provider] = acc[item.provider] || []).push(item);
                                        return acc;
                                    }, {})).map(([provider, items]: [string, any]) => (
                                        <optgroup key={provider} label={provider === 'staff-twin' ? 'STAFF TWINS ✨' : provider.toUpperCase()} className="font-semibold text-slate-500">
                                            {items.map((item: any) => (
                                                <option key={item.id} value={item.value} className="font-medium text-slate-900">
                                                    {item.name} {item.provider === 'staff-twin' ? '(Personalized)' : ''}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                    {/* Fallback if empty */}
                                    {catalog.models.length === 0 && <option value="gpt-4o">GPT-4o (Default)</option>}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Voice</label>
                                <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-slate-900 focus:border-slate-900 shadow-sm">
                                    {/* Group by Provider */}
                                    {Object.entries(catalog.voices.reduce((acc: any, item: any) => {
                                        (acc[item.provider] = acc[item.provider] || []).push(item);
                                        return acc;
                                    }, {})).map(([provider, items]: [string, any]) => (
                                        <optgroup key={provider} label={provider.toUpperCase()} className="font-semibold text-slate-500">
                                            {items.map((item: any) => (
                                                <option key={item.id} value={item.value} className="font-medium text-slate-900">{item.name}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                    {catalog.voices.length === 0 && <option value="sarah">Sarah (Default)</option>}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Voice Behavior */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                            <Volume2 className="w-4 h-4 mr-2" /> Voice Behavior
                        </h3>
                        <div className="space-y-6">
                            {/* Speak First */}
                            <div className="flex items-start justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900">Agent Speaks First</label>
                                    <p className="text-xs font-medium text-slate-500 mt-1">Should the agent greet the caller immediately?</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={speaksFirst} onChange={() => setSpeaksFirst(!speaksFirst)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                                </label>
                            </div>

                            {speaksFirst && (
                                <div className="ml-2 pl-4 border-l-2 border-slate-300">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">First Message</label>
                                    <input
                                        type="text"
                                        value={firstMessage}
                                        onChange={e => setFirstMessage(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:border-slate-900 focus:ring-slate-900"
                                    />
                                </div>
                            )}

                            {/* Background Sound */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Background Ambience</label>
                                <select value={backgroundSound} onChange={(e) => setBackgroundSound(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-slate-900 focus:border-slate-900 shadow-sm">
                                    <option value="off">None (Silence)</option>
                                    <option value="office">Office Environment</option>
                                </select>
                            </div>

                            {/* Temperature and Speed */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 md:col-span-2 lg:col-span-1">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <label className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                                        <span>Agent Temperature</span>
                                        <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{temperature}</span>
                                    </label>
                                    <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                                    <p className="text-xs text-slate-500 mt-2">Controls creativity (0 = strict, 1 = creative).</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <label className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                                        <span>Talking Speed</span>
                                        <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{speed}x</span>
                                    </label>
                                    <input type="range" min="0.5" max="5" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                                    <p className="text-xs text-slate-500 mt-2">Pacing of the AI's voice.</p>
                                </div>
                            </div>

                            {/* Expressiveness (Emotion) and Stability */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <label className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                                        <span>Expressiveness (Emotion)</span>
                                        <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{emotion}</span>
                                    </label>
                                    <input type="range" min="0" max="2" step="0.1" value={emotion} onChange={e => setEmotion(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                                    <p className="text-xs text-slate-500 mt-2">How much emotion and energy is in the voice.</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <label className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                                        <span>Stability (Variability)</span>
                                        <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{stability}</span>
                                    </label>
                                    <input type="range" min="0" max="2" step="0.1" value={stability} onChange={e => setStability(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                                    <p className="text-xs text-slate-500 mt-2">Higher values make the voice more consistent.</p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <label className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                                    <span>Clarity (Similarity Boost)</span>
                                    <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{clarity}</span>
                                </label>
                                <input type="range" min="0" max="1" step="0.05" value={clarity} onChange={e => setClarity(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                                <p className="text-xs text-slate-500 mt-2">Determines how closely the AI should adhere to the original voice. High values boost overall clarity.</p>
                            </div>

                            {/* Reasoning Mode Toggle */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Sparkles className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 italic">Cognitive Reasoning Mode (Deep Thought)</label>
                                            <p className="text-xs font-medium text-slate-500 mt-1">Enable for complex problem solving and better tool-calling precision.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={reasoningMode} onChange={() => setReasoningMode(!reasoningMode)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Long-term Memory Toggle */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                                            <HelpCircle className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 italic">Contextual Long-term Memory</label>
                                            <p className="text-xs font-medium text-slate-500 mt-1">Agent will remember previous calls and appointments for returning customers.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={longTermMemory} onChange={() => setLongTermMemory(!longTermMemory)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Orchestration Section */}
                            <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Orchestration & Fluidity</h4>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 italic flex items-center">
                                            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                                            Human Filler Injection
                                        </label>
                                        <p className="text-xs font-medium text-slate-500 mt-1">Adds "um", "like", "so" to make responses feel less robotic.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={fillerInjectionEnabled} onChange={() => setFillerInjectionEnabled(!fillerInjectionEnabled)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 italic flex items-center">
                                            <Volume2 className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                                            Active Backchanneling
                                        </label>
                                        <p className="text-xs font-medium text-slate-500 mt-1">Agent says "yeah", "got it" while the user is talking.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={backchannelingEnabled} onChange={() => setBackchannelingEnabled(!backchannelingEnabled)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <label className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                                        <span>Interruption Sensitivity</span>
                                        <span className="text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">{interruptionThreshold}s</span>
                                    </label>
                                    <input type="range" min="0.05" max="1" step="0.05" value={interruptionThreshold} onChange={e => setInterruptionThreshold(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                                    <p className="text-[10px] text-slate-500 mt-2 font-medium">Lower = faster reaction to being interrupted. 0.1s is standard for human-like flow.</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <label className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                                        <span>Response Wait Time (Silence Timeout)</span>
                                        <span className="text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">{silenceTimeout}s</span>
                                    </label>
                                    <input type="range" min="0.1" max="2.0" step="0.1" value={silenceTimeout} onChange={e => setSilenceTimeout(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                                    <p className="text-[10px] text-slate-500 mt-2 font-medium">How long the AI waits in silence after you stop talking before replying.</p>
                                </div>
                            </div>

                            {/* Transcriber Toggle */}
                            <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900">Enable Live Transcription</label>
                                    <p className="text-xs text-slate-500 mt-0.5">Captures and logs the full transcript of the conversation.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={transcriberEnabled} onChange={(e) => setTranscriberEnabled(e.target.checked)} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* Bilingual Mode Toggle */}
                            <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900">Bilingual Mode (English & Spanish)</label>
                                    <p className="text-xs text-slate-500 mt-0.5">Agent will greet in both languages and pivot based on user choice.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={isBilingual} onChange={(e) => setIsBilingual(e.target.checked)} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* System Protocols & Background Injections */}
                    <section className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl"></div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center tracking-tight">
                                    <Sparkles className="w-5 h-5 mr-2.5 text-blue-400" /> 
                                    System Protocols & Background Injections
                                </h3>
                                <p className="text-xs font-medium text-slate-400 mt-1">Standardized behavioral logic automatically applied to your agent.</p>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setIsPreviewModalOpen(true)}
                                className="flex items-center justify-center space-x-2 text-xs font-bold bg-white text-slate-900 px-5 py-2.5 rounded-xl transition-all hover:bg-slate-100 shadow-lg active:scale-95"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview Final Prompt</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
                            {/* Silence Re-engagement */}
                            <div className={`p-4 rounded-2xl border transition-all duration-300 ${enableSilenceReengagement ? 'bg-white/5 border-white/10 ring-1 ring-white/5' : 'bg-slate-800/20 border-slate-700/30 opacity-60 grayscale'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-1.5 rounded-lg ${enableSilenceReengagement ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-500'}`}>
                                        <Zap className="w-3.5 h-3.5" />
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={enableSilenceReengagement} onChange={() => setEnableSilenceReengagement(!enableSilenceReengagement)} className="sr-only peer" />
                                        <div className="w-8 h-4.5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-orange-500"></div>
                                    </label>
                                </div>
                                <h4 className="text-[11px] font-bold text-white mb-1">Silence Re-engagement</h4>
                                <p className="text-[9px] text-slate-400 leading-tight mb-3">Triggers an automated 'Are you there?' message via Vapi Hooks after 10s of silence.</p>
                                <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                                    <p className="text-[8px] text-emerald-300 leading-tight">
                                        <Check className="w-2 h-2 inline mr-1" />
                                        Native Vapi Hook Active
                                    </p>
                                </div>
                            </div>

                            {/* Caller ID Awareness */}
                            <div className={`p-5 rounded-2xl border transition-all duration-300 ${enableCallerId ? 'bg-white/5 border-white/10 ring-1 ring-white/5' : 'bg-slate-800/20 border-slate-700/30 opacity-60 grayscale'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg ${enableCallerId ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'}`}>
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={enableCallerId} onChange={() => setEnableCallerId(!enableCallerId)} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">Caller ID Awareness</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Injects the customer's phone number into the prompt so the agent can refer to it.</p>
                                <div className="bg-black/40 p-3 rounded-xl border border-white/5 h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                                    <code className="text-[9px] text-green-300/80 block whitespace-pre-wrap leading-relaxed font-mono">
                                        {CALLER_ID_INSTRUCTION}
                                    </code>
                                </div>
                            </div>

                            {/* Time Context */}
                            <div className={`p-5 rounded-2xl border transition-all duration-300 ${enableTimeContext ? 'bg-white/5 border-white/10 ring-1 ring-white/5' : 'bg-slate-800/20 border-slate-700/30 opacity-60 grayscale'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg ${enableTimeContext ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'}`}>
                                        <Volume2 className="w-4 h-4" />
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={enableTimeContext} onChange={() => setEnableTimeContext(!enableTimeContext)} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                                    </label>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">Time Context</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Injects real-time date/time and timezone into the prompt for perfect scheduling.</p>
                                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                    <code className="text-[9px] text-blue-300/80 block whitespace-pre-wrap leading-relaxed font-mono">
                                        {TIME_CONTEXT_INSTRUCTION(agent.tenant.timezone || 'UTC')}
                                    </code>
                                </div>
                            </div>

                            {/* Scheduling Protocol */}
                            <div className={`p-5 rounded-2xl border transition-all duration-300 ${enableSchedulingProtocol ? 'bg-white/5 border-white/10 ring-1 ring-white/5' : 'bg-slate-800/20 border-slate-700/30 opacity-60 grayscale'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg ${enableSchedulingProtocol ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-500'}`}>
                                        <Wrench className="w-4 h-4" />
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={enableSchedulingProtocol} onChange={() => setEnableSchedulingProtocol(!enableSchedulingProtocol)} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                                    </label>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">Scheduling Protocol</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Enforces strict calendar verification and long-term memory retrieval.</p>
                                <div className="bg-black/40 p-3 rounded-xl border border-white/5 h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                                    <code className="text-[9px] text-indigo-300/80 block whitespace-pre-wrap leading-relaxed font-mono">
                                        {SCHEDULING_PROTOCOL_INSTRUCTION}
                                    </code>
                                </div>
                            </div>

                            {/* Compliance Protocol */}
                            <div className={`p-5 rounded-2xl border transition-all duration-300 ${enableComplianceProtocol ? 'bg-white/5 border-white/10 ring-1 ring-white/5' : 'bg-slate-800/20 border-slate-700/30 opacity-60 grayscale'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg ${enableComplianceProtocol ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-500'}`}>
                                        <DollarSign className="w-4 h-4" />
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={enableComplianceProtocol} onChange={() => setEnableComplianceProtocol(!enableComplianceProtocol)} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                                    </label>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">Compliance Protocol</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Automates SMS consent collection and Do-Not-Call (DNC) handling.</p>
                                <div className="bg-black/40 p-3 rounded-xl border border-white/5 h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                                    <code className="text-[9px] text-purple-300/80 block whitespace-pre-wrap leading-relaxed font-mono">
                                        {COMPLIANCE_PROTOCOL_INSTRUCTION}
                                    </code>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Call Limits & Inactivity Safety */}
                    <section className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl"></div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center tracking-tight">
                                    <Clock className="w-5 h-5 mr-2.5 text-emerald-400" /> 
                                    Call Safety & Context
                                </h3>
                                <p className="text-xs font-medium text-slate-400 mt-1">Control maximum call length, context memory, and silence handling.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            {/* Max Duration */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-bold text-white">Max Call Duration</label>
                                        <p className="text-[10px] text-slate-400 mt-0.5">The call will automatically disconnect after this time.</p>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700">
                                        <input 
                                            type="number" 
                                            value={maxDurationSeconds} 
                                            onChange={(e) => setMaxDurationSeconds(parseInt(e.target.value))}
                                            className="bg-transparent text-sm font-bold text-white w-16 outline-none text-center"
                                        />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Sec</span>
                                    </div>
                                </div>
                                <input 
                                    type="range" 
                                    min="60" 
                                    max="3600" 
                                    step="60"
                                    value={maxDurationSeconds}
                                    onChange={(e) => setMaxDurationSeconds(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                    <span>1 Min</span>
                                    <span>{Math.floor(maxDurationSeconds / 60)} Mins</span>
                                    <span>60 Mins</span>
                                </div>
                            </div>

                            {/* Max Messages */}
                            <div className="space-y-4 border-l border-slate-800/50 pl-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-bold text-white">Context Memory (Max Messages)</label>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Limits the history sent to the AI to prevent confusion.</p>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700">
                                        <input 
                                            type="number" 
                                            value={maxMessages} 
                                            onChange={(e) => setMaxMessages(parseInt(e.target.value))}
                                            className="bg-transparent text-sm font-bold text-white w-12 outline-none text-center"
                                        />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Msg</span>
                                    </div>
                                </div>
                                <input 
                                    type="range" 
                                    min="5" 
                                    max="100" 
                                    step="5"
                                    value={maxMessages}
                                    onChange={(e) => setMaxMessages(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                    <span>5 Msg</span>
                                    <span>{maxMessages} Messages</span>
                                    <span>100 Msg</span>
                                </div>
                            </div>

                            {/* Silence Timeout */}
                            <div className="space-y-4 border-l border-slate-800/50 pl-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-bold text-white">Inactivity Timeout</label>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Wait time before triggering the inactivity action.</p>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700">
                                        <input 
                                            type="number" 
                                            value={silenceTimeoutSeconds} 
                                            onChange={(e) => setSilenceTimeoutSeconds(parseInt(e.target.value))}
                                            className="bg-transparent text-sm font-bold text-white w-12 outline-none text-center"
                                        />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Sec</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div>
                                        <h4 className="text-xs font-bold text-white">End Call on Timeout</h4>
                                        <p className="text-[10px] text-slate-500">Disconnects the call if silence limit is reached.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={endCallOnSilenceTimeoutEnabled} 
                                            onChange={() => setEndCallOnSilenceTimeoutEnabled(!endCallOnSilenceTimeoutEnabled)} 
                                            className="sr-only peer" 
                                        />
                                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>
                                <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-bold text-white">Re-engagement Message</h4>
                                        <Zap className="w-3.5 h-3.5 text-orange-400" />
                                    </div>
                                    <input 
                                        type="text"
                                        value={silenceMessage}
                                        onChange={(e) => setSilenceMessage(e.target.value)}
                                        placeholder="e.g. Are you still there?"
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-2 italic">The agent will say this automatically if the user is silent for 10 seconds.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tools */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                            <Wrench className="w-4 h-4 mr-2" /> Tools
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            {AVAILABLE_TOOLS.filter(tool => !(type === 'INBOUND' && tool.name === 'capture_lead')).map((tool) => (
                                <label key={tool.name} className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${selectedTools.includes(tool.name) ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                                    <input type="checkbox" checked={selectedTools.includes(tool.name)} onChange={() => toggleTool(tool.name)} className={`h-4 w-4 rounded border-slate-300 ${selectedTools.includes(tool.name) ? 'text-slate-700 focus:ring-white bg-white' : 'text-slate-900 focus:ring-slate-900'}`} />
                                    <span className="text-sm font-bold">{tool.label}</span>
                                </label>
                            ))}
                        </div>

                        {customTools.length > 0 && (
                            <>
                                <h4 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3 mt-6 border-t pt-4">Tenant Custom Tools</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {customTools.map(tool => (
                                        <label key={tool.name} className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${selectedTools.includes(tool.name) ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'bg-white border-slate-200 hover:border-purple-300 text-slate-700 hover:bg-slate-50'}`}>
                                            <input type="checkbox" checked={selectedTools.includes(tool.name)} onChange={() => toggleTool(tool.name)} className={`h-4 w-4 rounded border-slate-300 ${selectedTools.includes(tool.name) ? 'text-purple-600 focus:ring-white bg-white' : 'text-slate-900 focus:ring-slate-900'}`} />
                                            <div>
                                                <span className="text-sm font-bold block">{tool.name}</span>
                                                <span className={`text-xs block ${selectedTools.includes(tool.name) ? 'text-purple-200' : 'text-slate-500'}`}>{tool.actionType}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </>
                        )}
                    </section>

                    {/* Transfer Targets */}
                    {selectedTools.includes('transferCall') && (
                        <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <label className="block text-sm font-bold text-slate-700 mb-4">Transfer Destinations</label>
                            <div className="space-y-3 mb-4">
                                {targets.map((t, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                        <span className="text-sm font-bold text-slate-900">{t.label}</span>
                                        <span className="text-sm font-medium text-slate-500 font-mono">{t.number}</span>
                                        <button type="button" onClick={() => removeTarget(idx)} className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    placeholder="Label (e.g. Sales)"
                                    value={newTargetLabel}
                                    onChange={e => setNewTargetLabel(e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:border-slate-900 focus:ring-slate-900"
                                />
                                <input
                                    placeholder="Phone (+1...)"
                                    value={newTargetNumber}
                                    onChange={e => setNewTargetNumber(e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:border-slate-900 focus:ring-slate-900"
                                />
                                <button type="button" onClick={addTarget} className="btn-secondary px-4 py-2.5">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Prompt */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                <MessageSquare className="w-4 h-4 mr-2" /> System Prompt
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsAiModalOpen(true)}
                                className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors shadow-sm border border-slate-200"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                <span>Generate with AI</span>
                            </button>
                        </div>
                        <textarea rows={24} value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm leading-relaxed text-slate-900 focus:bg-white focus:ring-slate-900 focus:border-slate-900 shadow-inner" />

                {type !== 'INBOUND' && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start">
                        <p className="text-xs text-blue-800 font-medium">
                            <strong className="font-bold text-blue-900 block mb-1">Outbound Campaign Tip:</strong>
                            You can personalize greetings by using <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-900 font-mono font-bold">{`{{customer.name}}`}</code> in your system prompt or first message. When initiating a campaign, the agent will automatically replace this with the customer's actual name.
                        </p>
                    </div>
                )}

                {/* Voicemail Handling */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                    <label className="block text-sm font-bold text-slate-900 mb-1">Voicemail Instructions (Optional)</label>
                    <p className="text-xs text-slate-500 mb-3">If the agent encounters an answering machine, what should it do? (e.g. "Leave a message saying 'Hi, this is CC calling, please call us back.' and then use the end_call tool.")</p>
                    <textarea rows={3} value={voicemailHandling} onChange={(e) => setVoicemailHandling(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl font-mono text-sm leading-relaxed text-slate-800 bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 shadow-inner transition-shadow" placeholder="Leave blank to let the AI decide or ignore." />
                </div>
                    </section>

                    {/* Cost Estimator */}
                    {isAdmin && (
                        <section className="bg-slate-900 p-4 sm:p-8 rounded-2xl border border-slate-800 text-white relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-slate-800 rounded-full opacity-50 blur-3xl"></div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center relative z-10">
                                <DollarSign className="w-4 h-4 mr-1.5" /> Estimated Costs
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                <div className="space-y-6">
                                    <div>
                                        <label className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                                            <span>Avg Calls / Day</span>
                                            <span className="text-white bg-slate-800 px-2 py-0.5 rounded">{estCallsPerDay}</span>
                                        </label>
                                        <input type="range" min="1" max="500" value={estCallsPerDay} onChange={e => setEstCallsPerDay(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white" />
                                    </div>
                                    <div>
                                        <label className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                                            <span>Avg Duration</span>
                                            <span className="text-white bg-slate-800 px-2 py-0.5 rounded">{estDurationMin} min</span>
                                        </label>
                                        <input type="range" min="1" max="30" value={estDurationMin} onChange={e => setEstDurationMin(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white" />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center space-y-4">
                                    <div className="flex justify-between items-end border-b border-slate-700 pb-3">
                                        <span className="text-sm font-medium text-slate-400">Cost per Minute</span>
                                        <span className="text-xl font-bold text-white tracking-tight">${cost.perMinute}</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-slate-700 pb-3">
                                        <span className="text-sm font-medium text-slate-400">Daily Estimate</span>
                                        <span className="text-xl font-bold text-white tracking-tight">${cost.daily}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2">
                                        <span className="text-sm font-bold text-slate-300">Monthly Estimate</span>
                                        <span className="text-4xl font-black text-white tracking-tighter">${cost.monthly}</span>
                                    </div>
                                    <div className="text-[10px] font-medium text-slate-500 mt-3 text-right uppercase tracking-wider">
                                        Includes your platform access plan
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}


                </form>
            </div>

            {/* Sidebar (Prompt Guide & Actions) */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 sticky top-0 flex flex-col max-h-[calc(100vh-9rem)]">
                {/* Fixed Header & Actions */}
                <div className="p-6 border-b border-slate-200 shrink-0">
                    <button type="button" onClick={handleSave} disabled={loading} className="w-full btn-primary py-3.5 text-sm font-bold tracking-wide shadow-md">
                        {loading ? 'Saving...' : 'Save Configuration'}
                    </button>

                    {message && (
                        <div className={`mt-4 p-3 rounded-lg flex items-center text-xs font-medium shadow-sm border ${message.includes('Failed') || message.includes('Error') || message.includes('VAPI Error') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-800 border-green-200'}`}>
                            {message}
                        </div>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                    <div className="flex items-center mb-5 border-b border-slate-200 pb-3">
                        <HelpCircle className="w-4 h-4 text-slate-600 mr-2" />
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Prompt Variables</h3>
                    </div>

                    <div className="space-y-3 mb-8">
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-slate-800 font-mono bg-slate-100 px-2 py-1 rounded">{"{{customer.name}}"}</span>
                                <button type="button" onClick={() => copyToPrompt("{{customer.name}}")} className="text-slate-400 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 p-1.5 rounded-md hover:bg-slate-100" title="Copy to Prompt">
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">If initiating an outbound campaign, use this placeholder to let the AI greet the customer by name.</p>
                        </div>

                        {isBilingual && (
                            <div className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-200 shadow-sm group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Bilingual Protocol</span>
                                    <button type="button" onClick={() => copyToPrompt("LANGUAGE PROTOCOL: You are a fully bilingual agent. You MUST open the call with this exact bilingual greeting: 'Hello! Thank you for calling. Would you prefer to continue in English, or (enter your preferred language/languages)? Wait for the user's response. Based on their choice, pivot completely to that language for the remainder of the conversation. Translate all of your knowledge base, tool requests, and responses into the user's chosen language dynamically. Never mix languages after the choice is made.")} className="text-indigo-400 hover:text-indigo-900 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1.5 rounded-md shadow-sm border border-indigo-100" title="Copy to Prompt">
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">Injection active: Adds bilingual switching logic to your prompt.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center mb-5 border-b border-slate-200 pb-3">
                        <Wrench className="w-4 h-4 text-slate-600 mr-2" />
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Tool Guides</h3>
                    </div>

                    <div className="space-y-4 pb-4">
                    {/* Standard Tools */}
                    {AVAILABLE_TOOLS.filter(t => selectedTools.includes(t.name)).map(tool => (
                        <div key={tool.name} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-slate-800 font-mono bg-slate-100 px-2 py-1 rounded">{tool.name}</span>
                                <button type="button" onClick={() => copyToPrompt(tool.tip)} className="text-slate-400 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 p-1.5 rounded-md hover:bg-slate-100" title="Copy to Prompt">
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">"{tool.tip}"</p>
                        </div>
                    ))}

                    {/* Custom Tools Helpers */}
                    {customTools.filter(t => selectedTools.includes(t.name)).map(tool => {
                        let params: any = {};
                        try { params = typeof tool.parameters === 'string' ? JSON.parse(tool.parameters) : tool.parameters; } catch(e) {}
                        const requiredFields = params.required || [];
                        
                        const helperText = `### TOOL: ${tool.name}\n- **Description**: ${tool.description}\n- **Required Fields**: ${requiredFields.join(', ') || 'None'}\n- **Protocol**: Before calling this tool, gather all required fields. DO NOT ask for information already provided earlier in the call or available in the customer context.`;

                        return (
                            <div key={tool.name} className="bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-sm group">
                                <div className="flex justify-between items-start mb-2 gap-2">
                                    <div className="flex items-center space-x-2 min-w-0">
                                        <span className="text-xs font-bold text-purple-800 font-mono bg-white px-2 py-1 rounded border border-purple-100 truncate" title={tool.name}>{tool.name}</span>
                                        <Sparkles className="w-3 h-3 text-purple-600 animate-pulse shrink-0" />
                                    </div>
                                    <button type="button" onClick={() => copyToPrompt(helperText)} className="text-purple-400 hover:text-purple-900 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1.5 rounded-md shadow-sm border border-purple-100 shrink-0" title="Copy to Prompt">
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <p className="text-xs text-purple-900 font-bold mb-1">Custom Tool Instruction:</p>
                                <p className="text-xs text-purple-700 font-medium leading-relaxed line-clamp-3">"{tool.description}"</p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {requiredFields.map((f: string) => (
                                        <span key={f} className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold uppercase">{f}</span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {AVAILABLE_TOOLS.filter(t => selectedTools.includes(t.name)).length === 0 && customTools.filter(t => selectedTools.includes(t.name)).length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-sm text-slate-500 font-medium">Enable tools to see prompt tips.</p>
                        </div>
                    )}
                    </div>
                </div>
            </div>
            <AIPromptModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                onApprove={(generatedPrompt) => setSystemPrompt(generatedPrompt)}
                context={{
                    type,
                    model,
                    voiceId,
                    speaksFirst,
                    firstMessage: speaksFirst ? firstMessage : null,
                    voicemailHandling,
                    tools: selectedTools,
                    transferTargets: targets,
                    availableToolsContext: AVAILABLE_TOOLS.filter(t => selectedTools.includes(t.name))
                }}
            />

            {/* Final Prompt Preview Modal */}
            {isPreviewModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Final Prompt Preview</h2>
                                <p className="text-xs font-medium text-slate-500 mt-1">This is exactly what the AI will see during the call.</p>
                            </div>
                            <button onClick={() => setIsPreviewModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
                                <Trash2 className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-black/20">
                            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner">
                                <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed selection:bg-blue-500/30">
                                    {buildFullSystemPrompt(systemPrompt, {
                                        tenantTimezone: agent.tenant.timezone || 'UTC',
                                        voicemailHandling,
                                        longTermMemory,
                                        reasoningMode,
                                        enableTimeContext,
                                        enableSchedulingProtocol,
                                        enableComplianceProtocol,
                                        enableCallerId,
                                        enableSilenceReengagement
                                    })}
                                </pre>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-900/50">
                            <button onClick={() => setIsPreviewModalOpen(false)} className="px-8 py-2.5 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
