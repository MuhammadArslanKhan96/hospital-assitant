import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CallList from '@/components/CallList';

export default async function CallsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const logs = await prisma.callLog.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: 'desc' },
    include: { agent: { select: { name: true } } }
  });

  const [agents, tenant] = await Promise.all([
    prisma.agent.findMany({
      where: { tenantId: session.tenantId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { timezone: true }
    })
  ]);

  const initialSearch = typeof searchParams.search === 'string' ? searchParams.search : '';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Call History</h1>
      <CallList logs={logs} agents={agents} initialSearch={initialSearch} tenantTimezone={tenant?.timezone || 'UTC'} />
    </div>
  );
}
