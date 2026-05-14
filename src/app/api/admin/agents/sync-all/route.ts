import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import axios from "axios";
import { VAPI_TOOLS, generateTransferTool } from "@/lib/vapi-tools";
import { buildFullSystemPrompt } from "@/lib/agent-instructions";

const VAPI_BASE_URL = "https://api.vapi.ai";

/**
 * Super Admin Utility: Re-sync all agents across the platform with Vapi.
 * This applies the latest prompt engineering and tool protocols to all existing assistants.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    // Only Super Admins can trigger a global sync
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!process.env.VAPI_API_KEY) {
      return NextResponse.json(
        { error: "VAPI_API_KEY not configured" },
        { status: 500 }
      );
    }

    console.log(session, process.env.VAPI_API_KEY);

    // 1. Fetch all agents with their tenant and phone number data
    const agents = await prisma.agent.findMany({
      include: {
        tenant: true,
        phoneNumber: true,
      },
    });

    const results = {
      total: agents.length,
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    // 2. Iterate and Sync each agent
    for (const agent of agents) {
      console.log(agents, agent);
      if (!agent.vapiAssistantId) {
        console.log(`Skipping Agent ${agent.name} (${agent.id}) - No Vapi ID`);
        continue;
      }

      try {
        // Fetch tenant's custom tools
        const customToolsInDb = await prisma.tool.findMany({
          where: { tenantId: agent.tenantId },
        });

        const tools = agent.tools ? JSON.parse(agent.tools) : [];
        const transferTargets = agent.transferTargets
          ? JSON.parse(agent.transferTargets)
          : [];

        // Re-generate Tool list
        let finalTools: any[] = VAPI_TOOLS.filter((t) => {
          const isOverridden = customToolsInDb.some(
            (cTool) => cTool.name === t.function.name
          );
          return tools.includes(t.function.name) && !isOverridden;
        }) as any[];

        for (const cTool of customToolsInDb) {
          if (tools.includes(cTool.name)) {
            try {
              finalTools.push({
                type: "function",
                function: {
                  name: cTool.name,
                  description: cTool.description,
                  parameters: JSON.parse(cTool.parameters),
                },
              });
            } catch (e) {}
          }
        }

        if (tools.includes("transferCall") && transferTargets.length > 0) {
          const transferTool = generateTransferTool(transferTargets);
          if (transferTool) finalTools.push(transferTool);
        }

        if (
          !finalTools.find((t) => t.function.name === "get_customer_context")
        ) {
          const contextTool = VAPI_TOOLS.find(
            (t) => t.function.name === "get_customer_context"
          );
          if (contextTool) finalTools.push(contextTool);
        }

        // Determine Providers
        let modelProvider = "openai";
        let voiceProvider = "11labs";

        try {
          const modelInfo = await prisma.providerModel.findFirst({
            where: { type: "model", value: agent.model },
          });
          if (modelInfo) modelProvider = modelInfo.provider;

          const voiceInfo = await prisma.providerModel.findFirst({
            where: { type: "voice", value: agent.voiceId },
          });
          if (voiceInfo) voiceProvider = voiceInfo.provider;
        } catch (e) {
          if (agent.model.includes("llama")) modelProvider = "groq";
          if (agent.model.includes("claude")) modelProvider = "anthropic";
          if (agent.voiceId.includes("sonic")) voiceProvider = "cartesia";
          if (agent.voiceId.includes("aura")) voiceProvider = "deepgram";
          if (agent.voiceId === "alloy" || agent.voiceId === "shimmer")
            voiceProvider = "openai";
        }

        // Build Prompt
        const adjustedPrompt = buildFullSystemPrompt(agent.systemPrompt, {
          tenantTimezone: agent.tenant.timezone || "UTC",
          voicemailHandling: agent.voicemailHandling,
          longTermMemory: agent.longTermMemory,
          reasoningMode: agent.reasoningMode,
          enableTimeContext: agent.enableTimeContext,
          enableSchedulingProtocol: agent.enableSchedulingProtocol,
          enableComplianceProtocol: agent.enableComplianceProtocol,
          enableCallerId: agent.enableCallerId,
          enableSilenceReengagement: agent.enableSilenceReengagement,
        });

        // Voice Mapping
        let actualVoiceId = agent.voiceId;
        if (voiceProvider === "11labs") {
          const ELEVENLABS_VOICE_MAP: Record<string, string> = {
            rachel: "21m00Tcm4TlvDq8ikWAM",
            sarah: "EXAVITQu4vr4xnSDxMaL",
            jessica: "cgSgspJ2msm6clMCkdW9",
            charlie: "IKne3meq5aSn9XLyUdCD",
            george: "JBFqnCBsd6RMkjVDRZzb",
            callum: "N2lVS1w4EtoT3dr4eOWO",
            liam: "TX3OmfQAxAagI2Dpy2rC",
            charlotte: "XB0fDUnXU5pow077YWq5",
            alice: "Xb7hH8MSALEjdAeoW6zZ",
            matilda: "XrExE9yKIg1WjnnlVkGX",
            will: "bIHbv24MWmeRgasZH58o",
            eric: "cjVigY5qzO86HufA2pT0",
            chris: "iP95p4xoKVk53GoZ742B",
            brian: "nPczCjzI2devNBz1zQsc",
            daniel: "onwK4e9ZLuTAKqWW03F9",
            lily: "pFZP5JQG7iQjIQuC4Bku",
            bill: "pqHfZKP75CvOlQylNhV4",
          };
          actualVoiceId =
            ELEVENLABS_VOICE_MAP[(agent.voiceId || "").toLowerCase()] ||
            agent.voiceId;
        }

        console.log("Syncing ==============>");
        // Sync with Vapi
        await axios.patch(
          `${VAPI_BASE_URL}/assistant/${agent.vapiAssistantId}`,
          {
            maxDurationSeconds: agent.maxDurationSeconds,
            silenceTimeoutSeconds: agent.silenceTimeoutSeconds,
            hooks: agent.enableSilenceReengagement
              ? [
                  {
                    on: "customer.speech.timeout",
                    options: {
                      timeoutSeconds: 10,
                      triggerMaxCount: 3,
                    },
                    do: [
                      {
                        type: "say",
                        exact: agent.silenceMessage || "Are you still there?",
                      },
                    ],
                  },
                ]
              : [],
            model: {
              provider: modelProvider,
              model: agent.reasoningMode
                ? modelProvider === "openai"
                  ? "o1-mini"
                  : agent.model
                : agent.model,
              messages: [{ role: "system", content: adjustedPrompt }],
              temperature: agent.reasoningMode ? 1.0 : agent.temperature,
              tools: finalTools.length > 0 ? finalTools : undefined,
            },
            voice: {
              provider:
                voiceProvider === "custom-render" ||
                voiceProvider === "staff-twin"
                  ? "custom-voice"
                  : voiceProvider,
              voiceId: actualVoiceId,
              speed:
                voiceProvider === "custom-render" ||
                voiceProvider === "staff-twin" ||
                voiceProvider === "deepgram"
                  ? undefined
                  : agent.speed,
              stability:
                voiceProvider === "11labs" ? agent.stability : undefined,
              similarityBoost:
                voiceProvider === "11labs" ? agent.clarity : undefined,
            },
            transcriber: {
              provider: "deepgram",
              model: "nova-2",
              language: agent.isBilingual ? "multi" : "en-US",
              endpointing: Math.round((agent.silenceTimeout || 0.4) * 1000),
            },
          },
          { headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` } }
        );

        results.success++;
      } catch (err: any) {
        console.error(
          `Failed to sync agent ${agent.id}:`,
          err.response?.data || err.message
        );
        results.failed++;
        results.errors.push({
          agentId: agent.id,
          error: err.response?.data?.message || err.message,
        });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Global Sync Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
