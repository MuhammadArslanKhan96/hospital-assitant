import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AgentSettingsForm from '@/components/AgentSettingsForm';
import AgentTestButton from '@/components/AgentTestButton';
import ConnectExternalNumber from '@/components/agents/ConnectExternalNumber';

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'SUPER_ADMIN') redirect(`/dashboard/agents/${params.id}/analytics`);

  const agent = await prisma.agent.findUnique({
    where: { id: params.id },
    include: {
      phoneNumber: true,
      tenant: { select: { id: true, markup: true, billingMode: true } }
    }
  });

  if (!agent) {
    return <div>Agent not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage: {agent.name}</h1>
            <div className="flex space-x-2 mt-1">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 uppercase font-bold">{agent.type}</span>
                <span className="text-xs bg-blue-50 px-2 py-1 rounded text-blue-600">{agent.model}</span>
                <span className="text-xs bg-purple-50 px-2 py-1 rounded text-purple-600">Voice: {agent.voiceId}</span>
            </div>
        </div>
        {agent.vapiAssistantId && (
            <AgentTestButton assistantId={agent.vapiAssistantId} agentName={agent.name} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Live Status</h3>
            <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${agent.phoneNumber ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span className="text-lg font-semibold text-gray-900">
                    {agent.phoneNumber ? 'Live on Phone' : 'Web Only (Ready)'}
                </span>
            </div>
            {agent.phoneNumber && (
                <p className="mt-2 text-sm text-gray-600">{agent.phoneNumber.number}</p>
            )}
        </div>

        {/* VAPI ID Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">VAPI Assistant ID</h3>
            <code className="text-xs bg-gray-100 p-2 rounded block truncate">
                {agent.vapiAssistantId || 'Not Provisioned'}
            </code>
        </div>
      </div>

      <AgentSettingsForm agent={agent} markup={agent.tenant.markup} billingMode={agent.tenant.billingMode} isAdmin={session.role === 'SUPER_ADMIN'} />


      <ConnectExternalNumber agent={agent} />
    </div>
  );
}
