import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CallList from '@/components/CallList';

export default async function OutboundResultsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const logs = await prisma.callLog.findMany({
    where: {
      tenantId: session.tenantId,
      agent: { type: { not: 'INBOUND' } }
    },
    orderBy: { createdAt: 'desc' },
    include: { agent: { select: { name: true } } }
  });

  const agents = await prisma.agent.findMany({
    where: { tenantId: session.tenantId, type: { not: 'INBOUND' } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Outbound Campaign Results</h1>
        <p className="text-slate-500 font-medium mt-1">Review call logs, appointments booked, and leads captured by your outbound and hybrid agents.</p>
      </div>
      <CallList logs={logs} agents={agents} />
    </div>
  );
}
