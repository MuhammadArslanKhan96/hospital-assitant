import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import axios from 'axios';
import { VAPI_TOOLS, generateTransferTool } from '@/lib/vapi-tools';
import { generateCustomToolInstructions, buildFullSystemPrompt } from '@/lib/agent-instructions';

const VAPI_BASE_URL = 'https://api.vapi.ai';

// UPDATE AGENT
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { systemPrompt, voiceId, model, tools, type, transferTargets, firstMessage, backgroundSound, temperature, speed, emotion, stability, clarity, reasoningMode, longTermMemory, fillerInjectionEnabled, backchannelingEnabled, interruptionThreshold, silenceTimeout, transcriberEnabled, isBilingual, voicemailHandling, enableTimeContext, enableSchedulingProtocol, enableComplianceProtocol, enableCallerId, enableSilenceReengagement, silenceMessage, maxDurationSeconds, maxMessages, silenceTimeoutSeconds, endCallOnSilenceTimeoutEnabled } = body;

    // 1. Verify Ownership
    const agent = await prisma.agent.findUnique({
        where: { id: params.id },
        include: { tenant: true }
    });

    if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // 2. Filter & Generate Tools
    let finalTools: any[] | undefined = undefined;
    if (tools && Array.isArray(tools)) {
        // Inject Custom Tools from DB (including overrides)
        const customToolsInDb = await prisma.tool.findMany({
            where: { tenantId: agent.tenantId }
        });

        // Filter standard tools
        finalTools = VAPI_TOOLS.filter(t => {
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

    // 3. Update DB
    const updatedAgent = await prisma.agent.update({
        where: { id: params.id },
        data: {
            systemPrompt,
            voiceId,
            model,
            type,
            firstMessage: firstMessage || null,
            backgroundSound,
            temperature: temperature !== undefined ? parseFloat(temperature) : 0.7,
            speed: speed !== undefined ? parseFloat(speed) : 1.0,
            emotion: emotion !== undefined ? parseFloat(emotion) : 0.667,
            stability: stability !== undefined ? parseFloat(stability) : 0.8,
            clarity: clarity !== undefined ? parseFloat(clarity) : 0.75,
            reasoningMode: reasoningMode !== undefined ? !!reasoningMode : undefined,
            longTermMemory: longTermMemory !== undefined ? !!longTermMemory : undefined,
            fillerInjectionEnabled: fillerInjectionEnabled !== undefined ? !!fillerInjectionEnabled : undefined,
            backchannelingEnabled: backchannelingEnabled !== undefined ? !!backchannelingEnabled : undefined,
            interruptionThreshold: interruptionThreshold !== undefined ? parseFloat(interruptionThreshold) : undefined,
            silenceTimeout: silenceTimeout !== undefined ? parseFloat(silenceTimeout) : undefined,
            transcriberEnabled: transcriberEnabled !== undefined ? transcriberEnabled : true,
            isBilingual: isBilingual !== undefined ? !!isBilingual : undefined,
            voicemailHandling: voicemailHandling || null,
            tools: tools ? JSON.stringify(tools) : undefined,
            // Ensure we save an empty array '[]' string if cleared, rather than undefined, to persist the deletion
            transferTargets: transferTargets ? JSON.stringify(transferTargets) : JSON.stringify([]),
            enableTimeContext: enableTimeContext !== undefined ? !!enableTimeContext : undefined,
            enableSchedulingProtocol: enableSchedulingProtocol !== undefined ? !!enableSchedulingProtocol : undefined,
            enableComplianceProtocol: enableComplianceProtocol !== undefined ? !!enableComplianceProtocol : undefined,
            enableCallerId: enableCallerId !== undefined ? !!enableCallerId : undefined,
            enableSilenceReengagement: enableSilenceReengagement !== undefined ? !!enableSilenceReengagement : undefined,
            silenceMessage: silenceMessage || undefined,
            maxDurationSeconds: maxDurationSeconds !== undefined ? parseInt(maxDurationSeconds) : undefined,
            maxMessages: maxMessages !== undefined ? parseInt(maxMessages) : undefined,
            silenceTimeoutSeconds: silenceTimeoutSeconds !== undefined ? parseInt(silenceTimeoutSeconds) : undefined,
            endCallOnSilenceTimeoutEnabled: endCallOnSilenceTimeoutEnabled !== undefined ? !!endCallOnSilenceTimeoutEnabled : undefined
        }
    });

    // 4. Sync with VAPI
    if (updatedAgent.vapiAssistantId && process.env.VAPI_API_KEY) {
        try {
            // Determine Providers (Catalog + Fallback)
            let modelProvider = "openai";
            let voiceProvider = "11labs";

            try {
                const modelInfo = await prisma.providerModel.findFirst({ where: { type: 'model', value: model } });
                if (modelInfo) modelProvider = modelInfo.provider;

                const voiceInfo = await prisma.providerModel.findFirst({ where: { type: 'voice', value: voiceId } });
                if (voiceInfo) voiceProvider = voiceInfo.provider;
            } catch (e) {
                // Heuristics Fallback
                if (model.includes("llama")) modelProvider = "groq";
                if (model.includes("claude")) modelProvider = "anthropic";
                if (voiceId.includes("sonic")) voiceProvider = "cartesia";
                if (voiceId.includes("aura")) voiceProvider = "deepgram";
                if (voiceId === "alloy" || voiceId === "shimmer") voiceProvider = "openai";
            }

            // Map standard voice names to true ElevenLabs IDs
            let actualVoiceId = voiceId;
            if (voiceProvider === '11labs') {
                const ELEVENLABS_VOICE_MAP: Record<string, string> = {
                    'rachel': '21m00Tcm4TlvDq8ikWAM', 'sarah': 'EXAVITQu4vr4xnSDxMaL', 'jessica': 'cgSgspJ2msm6clMCkdW9',
                    'charlie': 'IKne3meq5aSn9XLyUdCD', 'george': 'JBFqnCBsd6RMkjVDRZzb', 'callum': 'N2lVS1w4EtoT3dr4eOWO',
                    'liam': 'TX3OmfQAxAagI2Dpy2rC', 'charlotte': 'XB0fDUnXU5pow077YWq5', 'alice': 'Xb7hH8MSALEjdAeoW6zZ',
                    'matilda': 'XrExE9yKIg1WjnnlVkGX', 'will': 'bIHbv24MWmeRgasZH58o', 'eric': 'cjVigY5qzO86HufA2pT0',
                    'chris': 'iP95p4xoKVk53GoZ742B', 'brian': 'nPczCjzI2devNBz1zQsc', 'daniel': 'onwK4e9ZLuTAKqWW03F9',
                    'lily': 'pFZP5JQG7iQjIQuC4Bku', 'bill': 'pqHfZKP75CvOlQylNhV4', 'burt': 'burt',
                    'marissa': 'marissa', 'andrea': 'andrea', 'phillip': 'phillip', 'steve': 'steve',
                    'joseph': 'joseph', 'myra': 'myra', 'paula': 'paula', 'ryan': 'ryan',
                    'drew': 'drew', 'paul': 'paul', 'mrb': 'mrb', 'mark': 'mark'
                };
                actualVoiceId = ELEVENLABS_VOICE_MAP[(voiceId || '').toLowerCase()] || voiceId;
            }

            const isMemoryEnabled = longTermMemory || (longTermMemory === undefined && updatedAgent.longTermMemory);
            const isReasoning = reasoningMode !== undefined ? !!reasoningMode : updatedAgent.reasoningMode;

            // Use the centralized prompt builder for all dynamic instructions
            const adjustedPrompt = buildFullSystemPrompt(systemPrompt, {
                tenantTimezone: agent.tenant.timezone || 'UTC',
                voicemailHandling,
                longTermMemory: isMemoryEnabled,
                reasoningMode: isReasoning,
                enableTimeContext: enableTimeContext !== undefined ? !!enableTimeContext : updatedAgent.enableTimeContext,
                enableSchedulingProtocol: enableSchedulingProtocol !== undefined ? !!enableSchedulingProtocol : updatedAgent.enableSchedulingProtocol,
                enableComplianceProtocol: enableComplianceProtocol !== undefined ? !!enableComplianceProtocol : updatedAgent.enableComplianceProtocol,
                enableCallerId: enableCallerId !== undefined ? !!enableCallerId : updatedAgent.enableCallerId,
                enableSilenceReengagement: enableSilenceReengagement !== undefined ? !!enableSilenceReengagement : updatedAgent.enableSilenceReengagement
            });

            // Construct Payload carefully to avoid 400 Bad Request
            const vapiPayload: any = {
                maxDurationSeconds: maxDurationSeconds !== undefined ? parseInt(maxDurationSeconds) : updatedAgent.maxDurationSeconds,
                silenceTimeoutSeconds: silenceTimeoutSeconds !== undefined ? parseInt(silenceTimeoutSeconds) : updatedAgent.silenceTimeoutSeconds,
                hooks: (enableSilenceReengagement !== undefined ? !!enableSilenceReengagement : updatedAgent.enableSilenceReengagement) ? [
                    {
                        on: "customer.speech.timeout",
                        options: {
                            timeoutSeconds: 10,
                            triggerMaxCount: 3
                        },
                        do: [
                            {
                                type: "say",
                                exact: silenceMessage || updatedAgent.silenceMessage || "Are you still there?"
                            }
                        ]
                    }
                ] : [],
                model: {
                    provider: modelProvider,
                    model: isReasoning ? (modelProvider === 'openai' ? "o1-mini" : (model || updatedAgent.model)) : (model || updatedAgent.model),
                    messages: [{ role: "system", content: adjustedPrompt }],
                    temperature: isReasoning ? 1.0 : (temperature !== undefined ? parseFloat(temperature) : updatedAgent.temperature),
                    tools: finalTools && finalTools.length > 0 ? finalTools : undefined
                },
                voice: {
                    provider: (voiceProvider === 'custom-render' || voiceProvider === 'staff-twin' || voiceProvider === 'custom-voice') ? 'custom-voice' : voiceProvider,
                    voiceId: actualVoiceId,
                    // VAPI: speed property is not supported for custom-voice (causes 400 Bad Request)
                    speed: (voiceProvider === 'custom-render' || voiceProvider === 'staff-twin' || voiceProvider === 'deepgram') ? undefined : (speed !== undefined ? parseFloat(speed) : updatedAgent.speed),
                    // ElevenLabs specific settings
                    stability: voiceProvider === '11labs' ? (stability !== undefined ? parseFloat(stability) : updatedAgent.stability) : undefined,
                    similarityBoost: voiceProvider === '11labs' ? (clarity !== undefined ? parseFloat(clarity) : updatedAgent.clarity) : undefined,
                    // VAPI: custom-voice requires a server object
                    server: (voiceProvider === 'custom-render' || voiceProvider === 'staff-twin') ? {
                        url: `${process.env.RENDER_TTS_URL}/generate?voice_id=${actualVoiceId}&speed=${speed || updatedAgent.speed || 1.0}&emotion=${emotion || updatedAgent.emotion || 0.667}&stability=${stability || updatedAgent.stability || 0.8}`,
                        secret: process.env.RENDER_TTS_SECRET
                    } : undefined
                },
                stopSpeakingPlan: {
                    voiceSeconds: interruptionThreshold !== undefined ? parseFloat(interruptionThreshold) : (updatedAgent.interruptionThreshold ?? 0.1),
                },
                transcriber: {
                    provider: 'deepgram',
                    model: 'nova-2',
                    language: (isBilingual || (isBilingual === undefined && updatedAgent.isBilingual)) ? 'multi' : 'en-US',
                    endpointing: Math.round((silenceTimeout !== undefined ? parseFloat(silenceTimeout) : (updatedAgent.silenceTimeout ?? 0.4)) * 1000)
                },
                startSpeakingPlan: {
                    smartEndpointingPlan: {
                        provider: 'vapi'
                    }
                }
            };

            // Only add firstMessage if it has a value. sending "" might be valid, but let's be cleaner.
            // If user explicitly clears it, we send empty string.
            // But if it's undefined in body, we skip.
            if (firstMessage !== undefined) {
                vapiPayload.firstMessage = firstMessage || "";
            }

            // Handle Background Sound
            // VAPI API Update: To turn it OFF, we must explicitly send "off".
            // Omitting the key just keeps the previous value (merge patch).
            if (backgroundSound) {
                vapiPayload.backgroundSound = backgroundSound;
            }

            if (transcriberEnabled === false) {
                vapiPayload.serverMessages = ["end-of-call-report", "status-update", "tool-calls"];
                vapiPayload.artifactPlan = { recordingEnabled: true }; // Keep recording as requested
            } else {
                vapiPayload.serverMessages = ["transcript", "end-of-call-report", "status-update", "tool-calls"];
                vapiPayload.artifactPlan = { recordingEnabled: true };
            }

            // Log for debugging
            console.log("Syncing VAPI Agent:", JSON.stringify(vapiPayload, null, 2));

            await axios.patch(
                `${VAPI_BASE_URL}/assistant/${updatedAgent.vapiAssistantId}`,
                vapiPayload,
                { headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` } }
            );
        } catch (e: any) {
            console.error("VAPI Sync Error:", e.response?.data || e.message);

            // Revert DB update if Vapi sync failed to keep them in sync
            await prisma.agent.update({
                where: { id: params.id },
                data: {
                    systemPrompt: agent.systemPrompt,
                    voiceId: agent.voiceId,
                    model: agent.model,
                    type: agent.type,
                    firstMessage: agent.firstMessage,
                    backgroundSound: agent.backgroundSound,
                    temperature: agent.temperature,
                    speed: agent.speed,
                    transcriberEnabled: agent.transcriberEnabled,
                    voicemailHandling: agent.voicemailHandling,
                    tools: agent.tools,
                    transferTargets: agent.transferTargets
                }
            });

            return NextResponse.json(
                { error: `VAPI Sync Failed: ${e.response?.data?.message || e.message}` },
                { status: 400 }
            );
        }
    }

    return NextResponse.json({ success: true, agent: updatedAgent });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE AGENT
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const agent = await prisma.agent.findUnique({
            where: { id: params.id },
            include: { phoneNumber: true }
        });

        if (!agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        // 1. Release Number (if any)
        if (agent.phoneNumber) {
            // Update DB to unlink
            await prisma.phoneNumber.update({
                where: { id: agent.phoneNumber.id },
                data: { agentId: null }
            });
            // Update VAPI to unlink
            if (process.env.VAPI_API_KEY && agent.phoneNumber.vapiId) {
                try {
                    await axios.patch(
                        `${VAPI_BASE_URL}/phone-number/${agent.phoneNumber.vapiId}`,
                        { assistantId: null },
                        { headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` } }
                    );
                } catch(e) {}
            }
        }

        // 2. Delete VAPI Assistant
        if (process.env.VAPI_API_KEY && agent.vapiAssistantId) {
            try {
                await axios.delete(
                    `${VAPI_BASE_URL}/assistant/${agent.vapiAssistantId}`,
                    { headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` } }
                );
            } catch(e) { console.error("VAPI Delete Error", e); }
        }

        // 3. Delete Agent from DB
        await prisma.agent.delete({ where: { id: params.id } });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
