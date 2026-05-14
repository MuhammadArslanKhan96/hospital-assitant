import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DemoAgentClient from '@/components/admin/DemoAgentClient';

export default async function AdminDemoAgentPage() {
  const session = await getSession();

  if (!session || session.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  let demoAgent = await prisma.demoAgentConfig.findUnique({
    where: { id: 'global' },
  });

  if (!demoAgent) {
    demoAgent = await prisma.demoAgentConfig.create({
      data: {
        id: 'global',
      }
    });
  }

  const models = await prisma.providerModel.findMany({ where: { type: 'model', isEnabled: true } });
  const voices = await prisma.providerModel.findMany({ where: { type: 'voice', isEnabled: true } });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Marketing Demo Agent</h1>
          <p className="text-sm text-slate-500 mt-1">Configure the agent that users can interact with directly on the landing page.</p>
        </div>
      </div>

      <DemoAgentClient initialData={demoAgent} models={models} voices={voices} />
    </div>
  );
}
