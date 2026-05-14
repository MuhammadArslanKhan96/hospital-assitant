import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CallList from '@/components/CallList';
import Link from 'next/link';

export default async function AgentAnalyticsPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const agent = await prisma.agent.findUnique({
    where: { id: params.id },
    include: { tenant: { select: { timezone: true } } }
  });

  if (!agent || (session.role !== 'SUPER_ADMIN' && agent.tenantId !== session.tenantId)) {
    return <div>Agent not found.</div>;
  }

  const logs = await prisma.callLog.findMany({
    where: {
      tenantId: agent.tenantId,
      agentId: agent.id
    },
    orderBy: { createdAt: 'desc' },
    include: { agent: { select: { name: true } } }
  });

  // Parse transfer targets mapping
  let parsedTargets: { label: string, number: string }[] = [];
  try {
    if (agent.transferTargets) {
      parsedTargets = typeof agent.transferTargets === 'string' ? JSON.parse(agent.transferTargets) : agent.transferTargets;
    }
  } catch (e) { }

  // Aggregate transfers
  const transferMap = new Map<string, number>();
  logs.forEach(call => {
    if (call.transferTarget) {
      const tObj = parsedTargets.find(t => t.number === call.transferTarget || t.label === call.transferTarget);
      const displayTarget = tObj ? tObj.label : call.transferTarget;
      transferMap.set(displayTarget, (transferMap.get(displayTarget) || 0) + 1);
    }
  });

  const transfersList = Array.from(transferMap.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Link href="/dashboard/agents" className="text-sm font-medium text-blue-600 hover:underline">Agents</Link>
            <span className="text-sm text-slate-400">/</span>
            {session.role === 'SUPER_ADMIN' ? (
                <Link href={`/dashboard/agents/${agent.id}`} className="text-sm font-medium text-blue-600 hover:underline">{agent.name}</Link>
            ) : (
                <span className="text-sm font-medium text-slate-600">{agent.name}</span>
            )}
            <span className="text-sm text-slate-400">/</span>
            <span className="text-sm font-bold text-slate-700">Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics: {agent.name}</h1>
        </div>
        {session.role === 'SUPER_ADMIN' && (
            <Link href={`/dashboard/agents/${agent.id}`} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-bold transition-colors border border-slate-200">
                Configure Agent
            </Link>
        )}
      </div>

      {/* Transfers Overview Card */}
      {transfersList.length > 0 && (
        <div className="premium-card p-6 flex flex-col h-fit bg-white">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
              Call Transfers by Department
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {transfersList.map(([dept, count], idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{dept}</p>
                <p className="text-2xl font-black text-blue-600 mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <CallList logs={logs} tenantTimezone={agent.tenant?.timezone || 'UTC'} />
    </div>
  );
}
