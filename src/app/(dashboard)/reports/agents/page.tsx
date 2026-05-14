import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AgentReportsClient from '@/components/AgentReportsClient';

export default async function AgentReportsPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const isSuperAdmin = session.role === 'SUPER_ADMIN';

    const agents = await prisma.agent.findMany({
        where: isSuperAdmin ? {} : { tenantId: session.tenantId },
        orderBy: { name: 'asc' }
    });

    const allCalls = await prisma.callLog.findMany({
        where: isSuperAdmin ? {} : { tenantId: session.tenantId },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Per-Agent Analytics</h1>
                <p className="text-slate-500 font-medium mt-1">Review performance and tool usage for each AI agent.</p>
            </div>

            <AgentReportsClient agents={agents} allCalls={allCalls} />
        </div>
    );
}
