import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import axios from 'axios';

const VAPI_BASE_URL = 'https://api.vapi.ai';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, systemPrompt, firstMessage, voiceId, model, isActive } = body;

    let demoAgent = await prisma.demoAgentConfig.findUnique({
      where: { id: 'global' },
    });

    if (!demoAgent) {
      demoAgent = await prisma.demoAgentConfig.create({
        data: { id: 'global' }
      });
    }

    // Determine Provider (Try Catalog first, Fallback to Heuristics)
    let modelProvider = "openai";
    let voiceProvider = "11labs";

    try {
        const modelInfo = await prisma.providerModel.findFirst({ where: { type: 'model', value: model } });
        if (modelInfo) modelProvider = modelInfo.provider;

        const voiceInfo = await prisma.providerModel.findFirst({ where: { type: 'voice', value: voiceId } });
        if (voiceInfo) voiceProvider = voiceInfo.provider;
    } catch (e) {
        console.warn("Catalog lookup failed, using heuristics.");
        if (model && model.includes("llama")) modelProvider = "groq";
        if (model && model.includes("claude")) modelProvider = "anthropic";
        if (voiceId && voiceId.includes("sonic")) voiceProvider = "cartesia";
        if (voiceId && voiceId.includes("aura")) voiceProvider = "deepgram";
        if (voiceId === "alloy" || voiceId === "shimmer") voiceProvider = "openai";
    }

    // Map standard voice names to true ElevenLabs IDs
    let actualVoiceId = voiceId || "EXAVITQu4vr4xnSDxMaL"; // Default Sarah ID
    if (voiceProvider === '11labs') {
        const ELEVENLABS_VOICE_MAP: Record<string, string> = {
            'rachel': '21m00Tcm4TlvDq8ikWAM',
            'sarah': 'EXAVITQu4vr4xnSDxMaL',
            'jessica': 'cgSgspJ2msm6clMCkdW9',
            'charlie': 'IKne3meq5aSn9XLyUdCD',
            'george': 'JBFqnCBsd6RMkjVDRZzb',
            'callum': 'N2lVS1w4EtoT3dr4eOWO',
            'liam': 'TX3OmfQAxAagI2Dpy2rC',
            'charlotte': 'XB0fDUnXU5pow077YWq5',
            'alice': 'Xb7hH8MSALEjdAeoW6zZ',
            'matilda': 'XrExE9yKIg1WjnnlVkGX',
            'will': 'bIHbv24MWmeRgasZH58o',
            'eric': 'cjVigY5qzO86HufA2pT0',
            'chris': 'iP95p4xoKVk53GoZ742B',
            'brian': 'nPczCjzI2devNBz1zQsc',
            'daniel': 'onwK4e9ZLuTAKqWW03F9',
            'lily': 'pFZP5JQG7iQjIQuC4Bku',
            'bill': 'pqHfZKP75CvOlQylNhV4',
            'burt': 'burt',
            'marissa': 'marissa',
            'andrea': 'andrea',
            'phillip': 'phillip',
            'steve': 'steve',
            'joseph': 'joseph',
            'myra': 'myra',
            'paula': 'paula',
            'ryan': 'ryan',
            'drew': 'drew',
            'paul': 'paul',
            'mrb': 'mrb',
            'mark': 'mark'
        };
        const lowerVoiceId = (voiceId || '').toLowerCase();
        actualVoiceId = ELEVENLABS_VOICE_MAP[lowerVoiceId] || voiceId;
    }

    const payload: any = {
      name: name || 'Marketing Demo Agent',
      model: {
        provider: modelProvider,
        model: model || 'gpt-4o',
        messages: [{ role: 'system', content: systemPrompt || "You are a helpful assistant." }],
      },
      voice: {
        provider: voiceProvider,
        voiceId: actualVoiceId,
      },
    };

    if (firstMessage) payload.firstMessage = firstMessage;

    let vapiAssistantId = demoAgent.vapiAssistantId;

    if (vapiAssistantId) {
      // Update existing
      try {
        await axios.patch(`${VAPI_BASE_URL}/assistant/${vapiAssistantId}`, payload, {
          headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` }
        });
      } catch (e: any) {
        console.error("VAPI Update Error:", e.response?.data || e.message);
        return NextResponse.json({ error: 'Failed to sync with VAPI', details: e.response?.data }, { status: 500 });
      }
    } else {
      // Create new
      try {
        const response = await axios.post(`${VAPI_BASE_URL}/assistant`, payload, {
          headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` }
        });
        vapiAssistantId = response.data.id;
      } catch (e: any) {
        console.error("VAPI Create Error:", e.response?.data || e.message);
        return NextResponse.json({ error: 'Failed to create VAPI agent', details: e.response?.data }, { status: 500 });
      }
    }

    const updated = await prisma.demoAgentConfig.update({
      where: { id: 'global' },
      data: {
        name,
        systemPrompt,
        firstMessage,
        voiceId,
        model,
        isActive,
        vapiAssistantId,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Save Demo Agent Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
