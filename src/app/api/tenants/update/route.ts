import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import axios from 'axios';

const VAPI_BASE_URL = 'https://api.vapi.ai';

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { systemPrompt, voiceId, model, apiKey, timezone } = body;

    // 1. Update Database
    const updatedTenant = await prisma.tenant.update({
      where: { id: session.tenantId },
      data: {
        systemPrompt,
        voiceId,
        model,
        apiKey,
        timezone
      }
    });

    // 2. Sync with VAPI (If Assistant ID exists)
    if (updatedTenant.vapiAssistantId && process.env.VAPI_API_KEY) {
      try {
        await axios.patch(
          `${VAPI_BASE_URL}/assistant/${updatedTenant.vapiAssistantId}`,
          {
            // If user provided a custom API Key, we override the provider config
            transcriber: apiKey ? {
                provider: "deepgram",
                model: "nova-2",
                language: "en"
            } : undefined,
            model: {
              provider: "openai",
              model: model || "gpt-4o",
              // If apiKey is present, we send it. Otherwise VAPI uses the account default.
              apiKey: apiKey || undefined,
              messages: [
                { role: "system", content: systemPrompt || "You are a helpful assistant." }
              ]
            },
            voice: {
              provider: "11labs", // Default provider
              voiceId: voiceId || "sarah"
            }
          },
          { headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` } }
        );
        console.log(`✅ Synced Tenant ${session.tenantId} config to VAPI Assistant ${updatedTenant.vapiAssistantId}`);
      } catch (vapiError) {
        console.error("Failed to sync with VAPI:", vapiError);
        // We allow the DB update to succeed even if VAPI fails (offline/key issue)
        return NextResponse.json({
            success: true,
            tenant: updatedTenant,
            warning: "Saved locally, but failed to sync with VAPI (Check API Key)."
        });
      }
    }

    return NextResponse.json({ success: true, tenant: updatedTenant });

  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
