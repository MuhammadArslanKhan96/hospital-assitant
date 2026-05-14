import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import axios from 'axios';

const VAPI_BASE_URL = 'https://api.vapi.ai';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { agentId, contacts } = body; // contacts is array of { name, number }

    if (!agentId || !contacts || !Array.isArray(contacts) || contacts.length === 0) {
        return NextResponse.json({ error: 'Invalid Input' }, { status: 400 });
    }

    const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        include: { phoneNumber: true }
    });

    if (!agent || agent.tenantId !== session.tenantId) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (!agent.vapiAssistantId) {
        return NextResponse.json({ error: 'Agent not provisioned on VAPI' }, { status: 400 });
    }

    if (!agent.phoneNumber || !agent.phoneNumber.vapiId) {
        return NextResponse.json({ error: 'Agent must have a phone number to make outbound calls.' }, { status: 400 });
    }

    // DNC Filtering
    const dncRecords = await prisma.contact.findMany({
        where: {
            tenantId: session.tenantId,
            doNotCall: true
        },
        select: { phoneNumber: true }
    });

    const dncNumbers = new Set(dncRecords.map(record => record.phoneNumber));

    const targetContacts = [];
    let skippedCount = 0;

    for (const contact of contacts) {
        if (dncNumbers.has(contact.number)) {
            skippedCount++;
        } else {
            targetContacts.push(contact);
        }
    }

    console.log(`[Campaign] Skipped ${skippedCount} numbers due to DNC list.`);

    // Fire Calls (Batch)
    const results = [];
    if (process.env.VAPI_API_KEY) {
        for (const contact of targetContacts) {
            try {
                const res = await axios.post(
                    `${VAPI_BASE_URL}/call/phone`,
                    {
                        phoneNumberId: agent.phoneNumber.vapiId,
                        assistantId: agent.vapiAssistantId,
                        customer: {
                            number: contact.number,
                            name: contact.name || 'Customer'
                        }
                    },
                    { headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` } }
                );
                results.push({ number: contact.number, name: contact.name, status: 'initiated', id: res.data.id });
            } catch (e: any) {
                console.error(`Failed to call ${contact.number}`, e.response?.data || e.message);
                results.push({ number: contact.number, name: contact.name, status: 'failed', error: e.response?.data?.message || 'Error' });
            }
        }
    }

    return NextResponse.json({ success: true, results });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
