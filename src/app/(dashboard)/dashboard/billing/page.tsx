import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import BillingOverview from '@/components/billing/BillingOverview';

export default async function BillingPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Fetch Current Usage (This Month)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);

  const logs = await prisma.callLog.findMany({
    where: {
        tenantId: session.tenantId,
        createdAt: { gte: startOfMonth }
    }
  });

  const currentUsage = logs.reduce((sum, log) => sum + log.billedCost, 0);

  // We are removing mock invoices and just showing the live balance.
  // In a real app, this would query Stripe API.
  const allTimeLogs = await prisma.callLog.aggregate({
      where: { tenantId: session.tenantId },
      _sum: { billedCost: true }
  });

  const totalAccrued = allTimeLogs._sum.billedCost || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
      <BillingOverview
        currentUsage={currentUsage}
        totalAccrued={totalAccrued}
      />
    </div>
  );
}
