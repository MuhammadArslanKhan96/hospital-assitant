import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import axios from 'axios';

const VAPI_BASE_URL = 'https://api.vapi.ai';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { numberId, agentId } = body;

    const number = await prisma.phoneNumber.findUnique({ where: { id: numberId } });
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });

    if (!number) {
        return NextResponse.json({ error: 'Number not found' }, { status: 404 });
    }
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

    // 1. Link in VAPI
    if (process.env.VAPI_API_KEY && number.vapiId && agent.vapiAssistantId) {
        try {
            await axios.patch(
                `${VAPI_BASE_URL}/phone-number/${number.vapiId}`,
                { assistantId: agent.vapiAssistantId },
                { headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` } }
            );
        } catch (e) {
            console.error("VAPI Link Error", e);
            return NextResponse.json({ error: "Failed to link number on VAPI" }, { status: 500 });
        }
    }

    // 2. Link in DB (and explicitly assign it to this tenant)
    await prisma.phoneNumber.update({
        where: { id: numberId },
        data: {
            agentId: agentId,
            tenantId: agent.tenantId, // Claim ownership for the agent's tenant
            status: "ACTIVE"
        }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
