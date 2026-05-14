import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import axios from 'axios';
import { VAPI_TOOLS, generateTransferTool } from '@/lib/vapi-tools';
import { generateCustomToolInstructions, buildFullSystemPrompt } from '@/lib/agent-instructions';

const VAPI_BASE_URL = 'https://api.vapi.ai';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { tenantId, name, systemPrompt, voiceId, model, type, tools, transferTargets, firstMessage, backgroundSound, temperature, speed, emotion, stability, clarity, reasoningMode, longTermMemory, fillerInjectionEnabled, backchannelingEnabled, interruptionThreshold, silenceTimeout, transcriberEnabled, isBilingual, voicemailHandling, enableTimeContext, enableSchedulingProtocol, enableComplianceProtocol, enableCallerId, enableSilenceReengagement, silenceMessage, maxDurationSeconds, maxMessages, silenceTimeoutSeconds, endCallOnSilenceTimeoutEnabled } = body;

    if (!tenantId) return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });

    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { timezone: true }
    });

    // 1. Create Agent in DB
    const newAgent = await prisma.agent.create({
      data: {
        tenantId,
        name,
        systemPrompt,
        voiceId,
        model,
        type: type || 'INBOUND',
        firstMessage,
        backgroundSound,
        temperature: temperature !== undefined ? parseFloat(temperature) : 0.7,
        speed: speed !== undefined ? parseFloat(speed) : 1.0,
        emotion: emotion !== undefined ? parseFloat(emotion) : 0.667,
        stability: stability !== undefined ? parseFloat(stability) : 0.8,
        clarity: clarity !== undefined ? parseFloat(clarity) : 0.75,
        reasoningMode: !!reasoningMode,
        longTermMemory: !!longTermMemory,
        fillerInjectionEnabled: fillerInjectionEnabled !== undefined ? !!fillerInjectionEnabled : true,
        backchannelingEnabled: backchannelingEnabled !== undefined ? !!backchannelingEnabled : true,
        interruptionThreshold: interruptionThreshold !== undefined ? parseFloat(interruptionThreshold) : 0.1,
        silenceTimeout: silenceTimeout !== undefined ? parseFloat(silenceTimeout) : 0.4,
        transcriberEnabled: transcriberEnabled !== undefined ? transcriberEnabled : true,
        isBilingual: !!isBilingual,
        voicemailHandling: voicemailHandling || null,
        tools: tools ? JSON.stringify(tools) : undefined,
        transferTargets: transferTargets ? JSON.stringify(transferTargets) : undefined,
        enableTimeContext: enableTimeContext !== undefined ? !!enableTimeContext : true,
        enableSchedulingProtocol: enableSchedulingProtocol !== undefined ? !!enableSchedulingProtocol : true,
        enableComplianceProtocol: enableComplianceProtocol !== undefined ? !!enableComplianceProtocol : true,
        enableCallerId: enableCallerId !== undefined ? !!enableCallerId : true,
        enableSilenceReengagement: enableSilenceReengagement !== undefined ? !!enableSilenceReengagement : true,
        silenceMessage: silenceMessage || "Are you still there?",
        maxDurationSeconds: maxDurationSeconds !== undefined ? parseInt(maxDurationSeconds) : 600,
        maxMessages: maxMessages !== undefined ? parseInt(maxMessages) : 20,
        silenceTimeoutSeconds: silenceTimeoutSeconds !== undefined ? parseInt(silenceTimeoutSeconds) : 30,
        endCallOnSilenceTimeoutEnabled: endCallOnSilenceTimeoutEnabled !== undefined ? !!endCallOnSilenceTimeoutEnabled : true
      }
    });

    // 2. Provision in VAPI
    if (process.env.VAPI_API_KEY) {
      try {
        // Filter & Generate Tools
        let finalTools: any[] = [];
        if (tools && Array.isArray(tools)) {
            // Inject Custom Tools from DB (including overrides for generic ones)
            const customToolsInDb = await prisma.tool.findMany({
                where: { tenantId }
            });

            // Filter standard tools
            finalTools = VAPI_TOOLS.filter(t => {
                // If requested tool is in VAPI_TOOLS, but a custom tool override exists for it, skip adding the generic one.
                const isOverridden = customToolsInDb.some(cTool => cTool.name === t.function.name);
                return tools.includes(t.function.name) && !isOverridden;
            }) as any[];

            // Add custom tools
            for (const cTool of customToolsInDb) {
                if (tools.includes(cTool.name)) {
                    try {
                        finalTools.push({
                            type: 'function',
                            function: {
                                name: cTool.name,
                                description: cTool.description,
                                parameters: JSON.parse(cTool.parameters)
                            }
                        });
                    } catch (e) {
                        console.error(`Failed to parse parameters for custom tool ${cTool.name}`);
                    }
                }
            }

            // Add Dynamic Transfer Tool if enabled
            if (tools.includes('transferCall') && transferTargets && transferTargets.length > 0) {
                const transferTool = generateTransferTool(transferTargets);
                if (transferTool) finalTools.push(transferTool);
            }

            // Always add customer context tool for appointment lookups
            if (!finalTools.find(t => t.function.name === 'get_customer_context')) {
                const contextTool = VAPI_TOOLS.find(t => t.function.name === 'get_customer_context');
                if (contextTool) finalTools.push(contextTool);
            }
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
            console.warn("Catalog lookup failed (DB migration pending?), using heuristics.");
            if (model.includes("llama")) modelProvider = "groq";
            if (model.includes("claude")) modelProvider = "anthropic";
            if (voiceId.includes("sonic")) voiceProvider = "cartesia";
            if (voiceId.includes("aura")) voiceProvider = "deepgram";
            if (voiceId === "alloy" || voiceId === "shimmer") voiceProvider = "openai";
        }

        // Use the centralized prompt builder for all dynamic instructions
        const adjustedPrompt = buildFullSystemPrompt(systemPrompt, {
            tenantTimezone: tenant?.timezone || 'UTC',
            voicemailHandling,
            longTermMemory,
            reasoningMode,
            enableTimeContext: enableTimeContext !== undefined ? !!enableTimeContext : true,
            enableSchedulingProtocol: enableSchedulingProtocol !== undefined ? !!enableSchedulingProtocol : true,
            enableComplianceProtocol: enableComplianceProtocol !== undefined ? !!enableComplianceProtocol : true,
            enableCallerId: enableCallerId !== undefined ? !!enableCallerId : true,
            enableSilenceReengagement: enableSilenceReengagement !== undefined ? !!enableSilenceReengagement : true
        });

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
                'burt': 'burt', // VAPI built-in aliases
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

        // Prepare Payload with all rich features
        const vapiPayload: any = {
            name: `${name} (VirtualCall.AI)`,
            maxDurationSeconds: maxDurationSeconds !== undefined ? parseInt(maxDurationSeconds) : 600,
            silenceTimeoutSeconds: silenceTimeoutSeconds !== undefined ? parseInt(silenceTimeoutSeconds) : 30,
            hooks: (enableSilenceReengagement !== undefined ? !!enableSilenceReengagement : true) ? [
                {
                    on: "customer.speech.timeout",
                    options: {
                        timeoutSeconds: 10,
                        triggerMaxCount: 3
                    },
                    do: [
                        {
                            type: "say",
                            exact: silenceMessage || "Are you still there?"
                        }
                    ]
                }
            ] : [],
            model: {
              provider: modelProvider,
              model: reasoningMode ? (modelProvider === 'openai' ? "o1-mini" : model) : (model || "gpt-4o"),
              messages: [{ role: "system", content: adjustedPrompt }],
              temperature: reasoningMode ? 1.0 : (temperature !== undefined ? parseFloat(temperature) : 0.7),
              tools: finalTools.length > 0 ? finalTools : undefined
            },
            voice: {
                provider: (voiceProvider === 'custom-render' || voiceProvider === 'staff-twin') ? 'custom-voice' : voiceProvider,
                voiceId: actualVoiceId,
                // VAPI: speed property is not supported for custom-voice (causes 400 Bad Request)
                speed: (voiceProvider === 'custom-render' || voiceProvider === 'staff-twin' || voiceProvider === 'deepgram') ? undefined : (speed !== undefined ? parseFloat(speed) : 1.0),
                // ElevenLabs specific settings
                stability: voiceProvider === '11labs' ? (stability !== undefined ? parseFloat(stability) : 0.8) : undefined,
                similarityBoost: voiceProvider === '11labs' ? (clarity !== undefined ? parseFloat(clarity) : 0.75) : undefined,
                // VAPI: custom-voice requires a server object pointing directly to Render
                server: (voiceProvider === 'custom-render' || voiceProvider === 'staff-twin') ? {
                    url: `${process.env.RENDER_TTS_URL}/generate?voice_id=${actualVoiceId}&speed=${speed || 1.0}&emotion=${emotion || 0.667}&stability=${stability || 0.8}`,
                    secret: process.env.RENDER_TTS_SECRET
                } : undefined
            },
            stopSpeakingPlan: {
                voiceSeconds: interruptionThreshold !== undefined ? parseFloat(interruptionThreshold) : 0.1,
            },
            transcriber: {
                provider: 'deepgram',
                model: 'nova-2',
                language: isBilingual ? 'multi' : 'en-US',
                endpointing: Math.round((silenceTimeout !== undefined ? parseFloat(silenceTimeout) : 0.4) * 1000)
            },
            startSpeakingPlan: {
                smartEndpointingPlan: {
                    provider: 'vapi'
                }
            },
            serverUrl: process.env.WEBHOOK_URL || `https://${req.headers.get('host')}/api/vapi`
        };

        if (firstMessage) vapiPayload.firstMessage = firstMessage;
        if (backgroundSound && backgroundSound !== 'off') vapiPayload.backgroundSound = backgroundSound;

        // Disable transcriber/recording features if explicitly turned off by user
        if (transcriberEnabled === false) {
            // Drop transcript from server messages to reduce log noise
            vapiPayload.serverMessages = ["end-of-call-report", "status-update", "tool-calls"];
            vapiPayload.artifactPlan = { recordingEnabled: true }; // Keep recording as requested
        } else {
            vapiPayload.serverMessages = ["transcript", "end-of-call-report", "status-update", "tool-calls"];
            vapiPayload.artifactPlan = { recordingEnabled: true };
        }

        const vapiRes = await axios.post(
          `${VAPI_BASE_URL}/assistant`,
          vapiPayload,
          { headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` } }
        );

        // Update DB with VAPI ID
        await prisma.agent.update({
          where: { id: newAgent.id },
          data: { vapiAssistantId: vapiRes.data.id }
        });

      } catch (err: any) {
        console.error("VAPI Provision Error", err.response?.data || err.message);

        // Delete the orphaned agent from DB if Vapi creation failed
        await prisma.agent.delete({ where: { id: newAgent.id } });

        return NextResponse.json(
            { error: `VAPI Error: ${err.response?.data?.message || err.message}` },
            { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: true, agent: newAgent });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const agents = await prisma.agent.findMany({
        where: { tenantId: session.tenantId },
        include: { phoneNumber: true },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ agents });
}
