import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminCallListClient from '@/components/admin/AdminCallListClient';
import AdminCostSimulator from '@/components/admin/AdminCostSimulator';

export default async function AdminCallsPage() {
  const session = await getSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const calls = await prisma.callLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tenant: true,
      agent: true
    }
  });

  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true, billingMode: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Platform Call Log & Profitability</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        View the absolute raw base cost of every call compared to what the tenant was billed based on their markup.
      </p>

      <AdminCostSimulator />

      <AdminCallListClient initialCalls={calls} tenants={tenants} />
    </div>
  );
}