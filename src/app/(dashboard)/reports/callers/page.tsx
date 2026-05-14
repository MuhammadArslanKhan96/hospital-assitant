import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CallerReportsClient from '@/components/CallerReportsClient';

export default async function CallerReportsPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const isSuperAdmin = session.role === 'SUPER_ADMIN';

    const [allCalls, tenant] = await Promise.all([
        prisma.callLog.findMany({
            where: {
                ...(isSuperAdmin ? {} : { tenantId: session.tenantId }),
                customerNumber: { not: null }
            },
            orderBy: { createdAt: 'desc' }
        }),
        !isSuperAdmin ? prisma.tenant.findUnique({
            where: { id: session.tenantId },
            select: { timezone: true }
        }) : Promise.resolve(null)
    ]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Callers & Frequency</h1>
                <p className="text-slate-500 font-medium mt-1">Identify repeated callers and track their interaction history.</p>
            </div>

            <CallerReportsClient allCalls={allCalls} tenantTimezone={tenant?.timezone || 'UTC'} />
        </div>
    );
}
