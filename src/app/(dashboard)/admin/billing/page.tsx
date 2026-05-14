import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminMarkupForm from '@/components/AdminMarkupForm';
import TenantBillingTable from '@/components/TenantBillingTable';

export default async function AdminBillingPage() {
  const session = await getSession();

  if (!session || session.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  // Calculate Platform Stats
  const allLogs = await prisma.callLog.findMany();
  let totalRawCost = 0;
  let totalBilledRevenue = 0;

  allLogs.forEach(log => {
    totalRawCost += log.cost;
    totalBilledRevenue += log.billedCost;
  });

  const totalProfit = totalBilledRevenue - totalRawCost;

  // Fetch Tenants with Call Data for detailed table
  const tenants = await prisma.tenant.findMany({
      include: {
          calls: true
      },
      orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Billing Overview</h1>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">${totalBilledRevenue.toFixed(2)}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">VAPI Cost</p>
          <p className="text-3xl font-bold text-gray-900">${totalRawCost.toFixed(2)}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Net Profit</p>
          <p className="text-3xl font-bold text-blue-600">+${totalProfit.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Tenant Breakdown</h2>
            <TenantBillingTable tenants={tenants} />
        </div>

        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Global Settings</h2>
            <AdminMarkupForm />
        </div>
      </div>
    </div>
  );
}
