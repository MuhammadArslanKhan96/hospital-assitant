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
    const { agentId, areaCode } = body;

    if (!agentId) return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });

    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

    // 1. Check Recycle Pool First
    const availableNumber = await prisma.phoneNumber.findFirst({
        where: { status: 'AVAILABLE' }
    });

    if (availableNumber) {
        // Recycle this number via VAPI
        if (process.env.VAPI_API_KEY && availableNumber.vapiId && agent.vapiAssistantId) {
            try {
                await axios.patch(
                    `${VAPI_BASE_URL}/phone-number/${availableNumber.vapiId}`,
                    { assistantId: agent.vapiAssistantId },
                    { headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` } }
                );
            } catch (e: any) {
                console.error("VAPI Attach Error (Recycle):", e.response?.data || e.message);
                return NextResponse.json({ error: "VAPI attachment failed. Try requesting a number again." }, { status: 500 });
            }
        }

        // Update DB
        const recycledNumber = await prisma.phoneNumber.update({
            where: { id: availableNumber.id },
            data: {
                tenantId: agent.tenantId,
                agentId: agent.id,
                status: 'ASSIGNED',
                activatedAt: new Date() // Activated immediately since it's recycled
            }
        });

        return NextResponse.json({ success: true, phoneNumber: recycledNumber, recycled: true });
    }

    // 2. No recycled number found. Buy Number via VAPI
    let phoneNumber = `+1${areaCode || '555'}${Math.floor(1000000 + Math.random() * 9000000)}`;
    let vapiPhoneId = `vapi-phone-${Date.now()}`;

    if (process.env.VAPI_API_KEY) {
        try {
            const buyRes = await axios.post(
                `${VAPI_BASE_URL}/phone-number`,
                {
                    provider: "vapi", // Specifically request VAPI native number
                    numberDesiredAreaCode: areaCode || "415",
                    assistantId: agent.vapiAssistantId
                },
                { headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` } }
            );
            phoneNumber = buyRes.data.number;
            vapiPhoneId = buyRes.data.id;
        } catch (e: any) {
            console.error("VAPI Buy Number Error:", e.response?.data || e.message);

            // Handle common VAPI errors
            if (e.response?.status === 402 || e.response?.data?.message?.includes("payment")) {
                return NextResponse.json({
                    error: "Payment Required on VAPI Account. Please add a card to VAPI to buy numbers."
                }, { status: 402 });
            }
            if (e.response?.status === 409 || e.response?.data?.message?.includes("limit")) {
                 if (process.env.NODE_ENV !== 'production') {
                     console.warn("Falling back to Mock Number for Development (Limit Reached)");
                 } else {
                     return NextResponse.json({
                         error: "No numbers available in the pool. Please wait for a number to be released or upgrade VAPI billing."
                     }, { status: 409 });
                 }
            } else {
                if (process.env.NODE_ENV !== 'production') {
                     console.warn("Falling back to Mock Number for Development");
                } else {
                     return NextResponse.json({ error: "Failed to provision number from VAPI." }, { status: 500 });
                }
            }
        }
    }

    // 3. Save to DB
    const newNumber = await prisma.phoneNumber.create({
        data: {
            number: phoneNumber,
            vapiId: vapiPhoneId,
            agentId: agent.id,
            tenantId: agent.tenantId,
            status: 'PENDING', // Start as Pending for 120s timer
            activatedAt: new Date(Date.now() + 120000) // Active in 2 mins
        }
    });

    return NextResponse.json({ success: true, phoneNumber: newNumber });

  } catch (error) {
    console.error('Buy Number Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
