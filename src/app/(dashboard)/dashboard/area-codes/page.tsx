import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AreaCodesClient from '@/components/area-codes/AreaCodesClient';

export default async function AreaCodesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const logs = await prisma.callLog.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Area Code Analytics</h1>
      <p className="text-slate-500 font-medium">Analyze your call volume and spend grouped by US Area Codes.</p>

      <AreaCodesClient logs={logs} />
    </div>
  );
}
