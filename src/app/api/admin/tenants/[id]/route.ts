import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import axios from 'axios';

const VAPI_BASE_URL = 'https://api.vapi.ai';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = params.id;

    // 1. Fetch Resources to Clean Up from VAPI
    const agents = await prisma.agent.findMany({ where: { tenantId } });
    const numbers = await prisma.phoneNumber.findMany({ where: { tenantId } });

    if (process.env.VAPI_API_KEY) {
        // Delete Agents from VAPI
        for (const agent of agents) {
            if (agent.vapiAssistantId) {
                try {
                    await axios.delete(
                        `${VAPI_BASE_URL}/assistant/${agent.vapiAssistantId}`,
                        { headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` } }
                    );
                    console.log(`🗑️ Deleted VAPI Assistant: ${agent.vapiAssistantId}`);
                } catch (e) {
                    console.error(`Failed to delete VAPI Agent ${agent.id}`, e);
                }
            }
        }

        // Release Numbers from VAPI
        for (const num of numbers) {
            if (num.vapiId) {
                try {
                    await axios.delete(
                        `${VAPI_BASE_URL}/phone-number/${num.vapiId}`,
                        { headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` } }
                    );
                    console.log(`🗑️ Released VAPI Number: ${num.number}`);
                } catch (e) {
                    console.error(`Failed to release VAPI Number ${num.number}`, e);
                }
            }
        }
    }

    // 2. Delete from DB (Cascade Delete via Prisma)
    // Note: We need to delete the Tenant, but since 'User' is the parent of 'Tenant' in our schema
    // (User has one Tenant), we might need to delete the User to clean everything up properly
    // if we want to remove login access.

    // Check schema relation: Tenant has `userId`.
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

    if (tenant) {
        // Delete the User (this should cascade to Tenant if configured, but let's be explicit)
        // Prisma Schema: User -> Tenant.
        // We delete the User to ensure they can't login anymore.
        // But first, we must delete the Tenant's children manually if cascade isn't set in DB.

        await prisma.phoneNumber.deleteMany({ where: { tenantId } });
        await prisma.agent.deleteMany({ where: { tenantId } });
        await prisma.callLog.deleteMany({ where: { tenantId } });
        await prisma.appointment.deleteMany({ where: { tenantId } });

        await prisma.tenant.delete({ where: { id: tenantId } });
        await prisma.user.delete({ where: { id: tenant.userId } });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete Tenant Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
