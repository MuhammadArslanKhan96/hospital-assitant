import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Phone, Activity } from 'lucide-react';
import AgentListClient from '@/components/AgentListClient'; // New client component for interactivity

export default async function AgentsPage() {
  const session = await getSession();
  if (!session) return null;

  const agentsRaw = await prisma.agent.findMany({
    where: { tenantId: session.tenantId },
    include: { phoneNumber: true },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch metrics for each agent
  const agents = await Promise.all(
    agentsRaw.map(async (agent) => {
      const callAggregates = await prisma.callLog.aggregate({
        where: { agentId: agent.id },
        _count: { id: true },
        _sum: { duration: true, billedCost: true }
      });
      return {
        ...agent,
        metrics: {
          totalCalls: callAggregates._count.id || 0,
          totalMinutes: Math.round((callAggregates._sum.duration || 0) / 60),
          totalSpend: callAggregates._sum.billedCost || 0,
        }
      };
    })
  );

  // Fetch Inventory (Unassigned Numbers — tenant-owned + globally available)
  const inventory = await prisma.phoneNumber.findMany({
    where: {
      agentId: null,
      status: 'AVAILABLE',
      OR: [
        { tenantId: session.tenantId },
        { tenantId: null }
      ]
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
        {session.role === 'SUPER_ADMIN' && (
          <Link href="/dashboard/agents/new" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create New Agent
          </Link>
        )}
      </div>

      <AgentListClient initialAgents={agents} inventory={inventory} userRole={session.role} />
    </div>
  );
}
