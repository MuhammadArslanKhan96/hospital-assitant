'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VAPI_TOOLS_CLIENT } from '@/lib/vapi-tools-client';
import { HelpCircle, Copy, Plus, Trash2, Volume2, MessageSquare, Wrench, Sparkles } from 'lucide-react';
import AIPromptModal from './AIPromptModal';

const AVAILABLE_TOOLS = [
    { name: 'check_availability', label: 'Check Availability', tip: "To check availability, say: 'Let me check the schedule for you.' and call check_availability with the user's desired time." },
    { name: 'book_appointment', label: 'Book Appointment', tip: "To book, say: 'Great, I'm booking that now.' and call book_appointment with the name, time, and email." },
    { name: 'cancel_appointment', label: 'Cancel Appointment', tip: "Use this to cancel an existing appointment." },
    { name: 'reschedule_appointment', label: 'Reschedule Appointment', tip: "Use this to move an appointment to a new date and time." },
    { name: 'capture_lead', label: 'Capture Lead', tip: "If they aren't ready to book, say: 'I can have someone call you back.' and call capture_lead." },
    { name: 'log_call', label: 'Log Call Outcome', tip: "At the end of the call, always call log_call to save the summary and outcome." },
    { name: 'end_call', label: 'End Call', tip: "Use the end_call tool when the conversation is finished, or after leaving a voicemail." },
  { name: 'transferCall', label: 'Call Transfer', tip: "To transfer, say 'Transferring you to the appropriate department now.' and call the transfer_call_tool. Do NOT ask the user for a phone number. Use the pre-configured destinations." },
  {
      name: 'record_contact_preferences',
      label: 'Consent & DNC',
      tip: "At the end of the call, ask: 'Do you consent to receiving text messages from us?' and use record_contact_preferences to log their choice. If they ever get angry or ask not to be called, immediately use the tool to flag them as DNC and end the call."
  }
];

export default function NewAgentForm({ tenantId, markup = 1.2, billingMode = 'FALLBACK', isAdmin = false }: { tenantId: string, markup?: number, billingMode?: string, isAdmin?: boolean }) {

  const router = useRouter();

  // State
  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [voicemailHandling, setVoicemailHandling] = useState('');
  const [voiceId, setVoiceId] = useState('sarah');
  const [model, setModel] = useState('gpt-4o');
  const [type, setType] = useState('INBOUND');

  const [speaksFirst, setSpeaksFirst] = useState(true);
  const [firstMessage, setFirstMessage] = useState("Hello, how can I help you?");
  const [backgroundSound, setBackgroundSound] = useState('off');

  const [temperature, setTemperature] = useState<number>(0.7);
  const [speed, setSpeed] = useState<number>(1.0);
  const [emotion, setEmotion] = useState<number>(0.667);
  const [stability, setStability] = useState<number>(0.8);
  const [reasoningMode, setReasoningMode] = useState<boolean>(false);
  const [longTermMemory, setLongTermMemory] = useState<boolean>(false);
  const [fillerInjectionEnabled, setFillerInjectionEnabled] = useState<boolean>(true);
  const [backchannelingEnabled, setBackchannelingEnabled] = useState<boolean>(true);
  const [interruptionThreshold, setInterruptionThreshold] = useState<number>(0.1);
  const [transcriberEnabled, setTranscriberEnabled] = useState<boolean>(true);

  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [targets, setTargets] = useState<{label: string, number: string}[]>([]);
  const [newTargetLabel, setNewTargetLabel] = useState('');
  const [newTargetNumber, setNewTargetNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [catalog, setCatalog] = useState<{ models: any[], voices: any[] }>({ models: [], voices: [] });
  const [customTools, setCustomTools] = useState<any[]>([]);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

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

    if (tenantId) {
        fetch(`/api/tools?tenantId=${tenantId}`)
            .then(res => res.json())
            .then(data => {
                if (data.tools) {
                    setCustomTools(data.tools);
                }
            })
            .catch(err => console.error("Failed to fetch custom tools", err));
    }
  }, [tenantId]);

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
          modelCost = 0.001; // cheap generic
          if (model.includes('mini') || model.includes('llama')) modelCost = 0.0001;
          else if (model.includes('gpt-4') || model.includes('claude-3-opus')) modelCost = 0.03;
          else if (model.includes('claude-3-haiku')) modelCost = 0.001;

          voiceCost = 0.04; // Vapi deepgram
          if (voiceId.includes('11labs')) voiceCost = 0.12;
          else if (voiceId.includes('openai') || voiceId.includes('alloy') || voiceId.includes('fable')) voiceCost = 0.009;
          else if (voiceId.includes('playht')) voiceCost = 0.05;

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

  // Helpers
  const toggleTool = (toolName: string) => {
      if (selectedTools.includes(toolName)) {
          setSelectedTools(selectedTools.filter(t => t !== toolName));
      } else {
          setSelectedTools([...selectedTools, toolName]);
      }
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

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tenantId,
            name,
            systemPrompt,
            voiceId,
            model,
            type,
            tools: selectedTools,
            transferTargets: targets,
            firstMessage: speaksFirst ? firstMessage : null,
            backgroundSound: backgroundSound === 'off' ? null : backgroundSound,
            temperature,
            speed,
            emotion,
            stability,
            reasoningMode,
            longTermMemory,
            fillerInjectionEnabled,
            backchannelingEnabled,
            interruptionThreshold,
            transcriberEnabled,
            voicemailHandling
        }),
      });

      if (res.ok) {
        if (isAdmin && tenantId) {
            router.push(`/admin/tenants/${tenantId}`);
        } else {
            router.push('/dashboard/agents');
        }
        router.refresh();
      } else {
        setMessage('Failed to create agent.');
      }
    } catch (error) {
      setMessage('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Main Form */}
      <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Agent</h2>
        <form onSubmit={handleSubmit} className="space-y-8">

            {/* Core Settings */}
            <section>
                <div className="grid grid-cols-1 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Sales Bot 1" required />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-md">
                            <option value="INBOUND">Inbound</option>
                            <option value="OUTBOUND">Outbound</option>
                            <option value="HYBRID">Hybrid</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Model</label>
                        <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-md">
                            {/* Group by Provider */}
                            {Object.entries(catalog.models.reduce((acc: any, item: any) => {
                                (acc[item.provider] = acc[item.provider] || []).push(item);
                                return acc;
                            }, {})).map(([provider, items]: [string, any]) => (
                                <optgroup key={provider} label={provider === 'staff-twin' ? 'STAFF TWINS ✨' : provider.toUpperCase()}>
                                    {items.map((item: any) => (
                                        <option key={item.id} value={item.value}>
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
                        <label className="block text-sm font-medium text-gray-700">Voice</label>
                        <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-md">
                             {/* Group by Provider */}
                             {Object.entries(catalog.voices.reduce((acc: any, item: any) => {
                                (acc[item.provider] = acc[item.provider] || []).push(item);
                                return acc;
                            }, {})).map(([provider, items]: [string, any]) => (
                                <optgroup key={provider} label={provider.toUpperCase()}>
                                    {items.map((item: any) => (
                                        <option key={item.id} value={item.value}>{item.name}</option>
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
                <h3 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b pb-2 flex items-center">
                    <Volume2 className="w-4 h-4 mr-2" /> Voice Behavior
                </h3>
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Agent Speaks First</label>
                            <p className="text-xs text-gray-500">Should the agent greet the caller immediately?</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={speaksFirst} onChange={() => setSpeaksFirst(!speaksFirst)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {speaksFirst && (
                        <div className="ml-1 pl-4 border-l-2 border-blue-100">
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Message</label>
                            <input type="text" value={firstMessage} onChange={e => setFirstMessage(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Background Ambience</label>
                        <select value={backgroundSound} onChange={(e) => setBackgroundSound(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                            <option value="off">None (Silence)</option>
                            <option value="office">Office Environment</option>
                        </select>
                    </div>

                    {/* Temperature and Speed */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="flex justify-between text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                                <span>Agent Temperature</span>
                                <span className="text-gray-900 bg-gray-200 px-2 py-0.5 rounded">{temperature}</span>
                            </label>
                            <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-900" />
                            <p className="text-xs text-gray-500 mt-2">Controls creativity (0 = strict, 1 = creative).</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="flex justify-between text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                                <span>Talking Speed</span>
                                <span className="text-gray-900 bg-gray-200 px-2 py-0.5 rounded">{speed}x</span>
                            </label>
                            <input type="range" min="0.5" max="5" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-900" />
                            <p className="text-xs text-gray-500 mt-2">Pacing of the AI's voice.</p>
                        </div>
                    </div>

                    {/* Expressiveness (Emotion) and Stability */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="flex justify-between text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                                <span>Expressiveness (Emotion)</span>
                                <span className="text-gray-900 bg-gray-200 px-2 py-0.5 rounded">{emotion}</span>
                            </label>
                            <input type="range" min="0" max="2" step="0.1" value={emotion} onChange={e => setEmotion(parseFloat(e.target.value))} className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-900" />
                            <p className="text-xs text-gray-500 mt-2">How much emotion and energy is in the voice.</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="flex justify-between text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                                <span>Stability (Variability)</span>
                                <span className="text-gray-900 bg-gray-200 px-2 py-0.5 rounded">{stability}</span>
                            </label>
                            <input type="range" min="0" max="2" step="0.1" value={stability} onChange={e => setStability(parseFloat(e.target.value))} className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-900" />
                            <p className="text-xs text-gray-500 mt-2">Higher values make the voice more consistent.</p>
                        </div>
                    </div>

                    {/* Reasoning Mode Toggle */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 italic">Cognitive Reasoning Mode (Deep Thought)</label>
                                    <p className="text-xs font-medium text-gray-500 mt-1">Enable for complex problem solving and better tool-calling precision.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={reasoningMode} onChange={() => setReasoningMode(!reasoningMode)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Long-term Memory Toggle */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <HelpCircle className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 italic">Contextual Long-term Memory</label>
                                    <p className="text-xs font-medium text-gray-500 mt-1">Agent will remember previous calls and appointments for returning customers.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={longTermMemory} onChange={() => setLongTermMemory(!longTermMemory)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                            </label>
                        </div>
                    </div>

                    {/* Orchestration Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Orchestration & Fluidity</h4>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 italic flex items-center">
                                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                                    Human Filler Injection
                                </label>
                                <p className="text-xs text-gray-500">Adds "um", "like", "so" to responses.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={fillerInjectionEnabled} onChange={() => setFillerInjectionEnabled(!fillerInjectionEnabled)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 italic flex items-center">
                                    <Volume2 className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                                    Active Backchanneling
                                </label>
                                <p className="text-xs text-gray-500">Agent affirms "yeah", "got it".</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={backchannelingEnabled} onChange={() => setBackchannelingEnabled(!backchannelingEnabled)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <label className="flex justify-between text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                <span>Interruption Sensitivity</span>
                                <span className="text-gray-900 bg-white border px-2 py-0.5 rounded">{interruptionThreshold}s</span>
                            </label>
                            <input type="range" min="0.05" max="1" step="0.05" value={interruptionThreshold} onChange={e => setInterruptionThreshold(parseFloat(e.target.value))} className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-900" />
                            <p className="text-[10px] text-gray-500 mt-1">Lower = faster reaction to barge-ins.</p>
                        </div>
                    </div>

                    {/* Transcriber Toggle */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-bold text-gray-900">Enable Live Transcription</label>
                            <p className="text-xs text-gray-500 mt-0.5">Captures and logs the full transcript of the conversation.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={transcriberEnabled} onChange={(e) => setTranscriberEnabled(e.target.checked)} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </section>

            {/* Tools */}
            <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b pb-2 flex items-center">
                    <Wrench className="w-4 h-4 mr-2" /> Tools
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {AVAILABLE_TOOLS.filter(tool => !(type === 'INBOUND' && tool.name === 'capture_lead')).map((tool) => (
                        <label key={tool.name} className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-colors ${selectedTools.includes(tool.name) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                            <input type="checkbox" checked={selectedTools.includes(tool.name)} onChange={() => toggleTool(tool.name)} className="h-4 w-4 text-blue-600 rounded" />
                            <span className="text-sm text-gray-700">{tool.label}</span>
                        </label>
                    ))}
                </div>

                {customTools.length > 0 && (
                    <>
                        <h4 className="text-xs font-bold text-purple-600 uppercase mb-3 mt-6 border-t pt-4">Tenant Custom Tools</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {customTools.map(tool => (
                                <label key={tool.name} className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-colors ${selectedTools.includes(tool.name) ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'}`}>
                                    <input type="checkbox" checked={selectedTools.includes(tool.name)} onChange={() => toggleTool(tool.name)} className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500" />
                                    <div>
                                        <span className="text-sm text-gray-700 block font-medium">{tool.name}</span>
                                        <span className="text-xs text-gray-500 block">{tool.actionType}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </>
                )}
            </section>

            {/* Transfer Targets */}
            {selectedTools.includes('transferCall') && (
                <section className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Destinations</label>
                    <div className="space-y-2 mb-3">
                        {targets.map((t, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border">
                                <span className="text-sm font-medium">{t.label}</span>
                                <span className="text-sm text-gray-500 font-mono">{t.number}</span>
                                <button type="button" onClick={() => removeTarget(idx)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input placeholder="Label (e.g. Sales)" value={newTargetLabel} onChange={e => setNewTargetLabel(e.target.value)} className="flex-1 px-3 py-2 border rounded-md text-sm" />
                        <input placeholder="Phone (+1...)" value={newTargetNumber} onChange={e => setNewTargetNumber(e.target.value)} className="flex-1 px-3 py-2 border rounded-md text-sm" />
                        <button type="button" onClick={addTarget} className="bg-gray-200 hover:bg-gray-300 p-2 rounded-md"><Plus className="w-5 h-5 text-gray-700" /></button>
                    </div>
                </section>
            )}

            {/* Prompt */}
            <section>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-gray-900 uppercase flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" /> System Prompt
                    </h3>
                    <button
                        type="button"
                        onClick={() => setIsAiModalOpen(true)}
                        className="flex items-center space-x-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors shadow-sm border border-blue-200"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate with AI</span>
                    </button>
                </div>
                <textarea rows={12} value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-md font-mono text-sm leading-relaxed" />

                {type !== 'INBOUND' && (
                    <div className="mt-4 bg-blue-50 border border-blue-100 p-4 rounded-md flex items-start">
                        <p className="text-sm text-blue-800">
                            <strong>Outbound Campaign Tip:</strong> Use <code className="bg-white px-1 py-0.5 rounded text-blue-900 font-mono text-xs">{`{{customer.name}}`}</code> in your prompt or first message to dynamically use the customer's name when launching campaigns!
                        </p>
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="block text-sm font-bold text-gray-900 mb-1">Voicemail Instructions (Optional)</label>
                    <p className="text-xs text-gray-500 mb-3">If the agent encounters an answering machine, what should it do? (e.g. "Leave a message saying 'Hi, this is CC calling, please call us back.' and then use the end_call tool.")</p>
                    <textarea rows={3} value={voicemailHandling} onChange={(e) => setVoicemailHandling(e.target.value)} className="w-full px-3 py-2 border rounded-md font-mono text-sm leading-relaxed" placeholder="Leave blank to let the AI decide or ignore." />
                </div>
            </section>

            {/* Cost Estimator */}
            {isAdmin && (
              <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase mb-4 flex items-center">
                    💰 Estimated Costs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Avg Calls Per Day: {estCallsPerDay}</label>
                            <input type="range" min="1" max="500" value={estCallsPerDay} onChange={e => setEstCallsPerDay(parseInt(e.target.value))} className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Avg Duration: {estDurationMin} min</label>
                            <input type="range" min="1" max="30" value={estDurationMin} onChange={e => setEstDurationMin(parseInt(e.target.value))} className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>
                    <div className="flex flex-col justify-center space-y-2">
                        <div className="flex justify-between items-end border-b border-blue-200 pb-2">
                            <span className="text-sm text-gray-600">Cost per Minute</span>
                            <span className="text-lg font-bold text-gray-900">${cost.perMinute}</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-blue-200 pb-2">
                            <span className="text-sm text-gray-600">Daily Estimate</span>
                            <span className="text-lg font-bold text-gray-900">${cost.daily}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm text-gray-600 font-bold">Monthly Estimate</span>
                            <span className="text-2xl font-black text-blue-600">${cost.monthly}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-2 text-right">
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
            <button type="button" onClick={handleSubmit} disabled={loading} className="w-full btn-primary py-3.5 text-sm font-bold tracking-wide shadow-md">
                {loading ? 'Creating...' : 'Create Agent'}
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
            </div>

            <div className="flex items-center mb-5 border-b border-slate-200 pb-3">
                <Wrench className="w-4 h-4 text-slate-600 mr-2" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Tool Guides</h3>
            </div>

            <div className="space-y-4 pb-4">
            {AVAILABLE_TOOLS.filter(t => selectedTools.includes(t.name)).map(tool => (
                <div key={tool.name} className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-gray-700 font-mono">{tool.name}</span>
                        <button type="button" onClick={() => copyToPrompt(tool.tip)} className="text-blue-600 hover:text-blue-800" title="Add to Prompt">
                            <Copy className="w-3 h-3" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-600 italic">"{tool.tip}"</p>
                </div>
            ))}
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
    </div>
  );
}
