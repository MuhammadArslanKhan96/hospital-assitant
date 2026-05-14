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
    const { numberId } = body;

    const number = await prisma.phoneNumber.findUnique({ where: { id: numberId } });
    if (!number) {
        return NextResponse.json({ error: 'Number not found' }, { status: 404 });
    }

    // 1. Unlink from VAPI Assistant
    // We update the phone number on VAPI to have NO assistantId (use null)
    if (process.env.VAPI_API_KEY && number.vapiId) {
        try {
            await axios.patch(
                `${VAPI_BASE_URL}/phone-number/${number.vapiId}`,
                { assistantId: null }, // Detach explicitly using null
                { headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` } }
            );
        } catch (e) {
            console.error("VAPI Detach Error", e);
            // DO NOT update Prisma if VAPI fails
            return NextResponse.json({ error: 'Failed to release number on VAPI. Database unchanged.' }, { status: 500 });
        }
    }

    // 2. Unlink in DB (recycle to pool)
    await prisma.phoneNumber.update({
        where: { id: numberId },
        data: {
            agentId: null,
            tenantId: null,
            status: 'AVAILABLE'
        }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
