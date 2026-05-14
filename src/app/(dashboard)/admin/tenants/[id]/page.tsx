import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminTenantDetail from '@/components/admin/AdminTenantDetail';

export default async function TenantDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'SUPER_ADMIN') redirect('/dashboard');

  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: { user: true, agents: { include: { phoneNumber: true } } }
  });

  if (!tenant) return <div>Tenant not found</div>;

  // Fetch Usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);

  const logs = await prisma.callLog.findMany({
    where: {
        tenantId: tenant.id,
        createdAt: { gte: startOfMonth }
    }
  });

  const currentUsage = logs.reduce((sum, log) => sum + log.billedCost, 0);

  // Mock Invoices
  const mockInvoices = [
      { id: 'inv_001', date: 'Feb 01, 2024', amount: 45.20, status: 'Paid' },
      { id: 'inv_002', date: 'Jan 01, 2024', amount: 32.50, status: 'Paid' },
  ];

  // Fetch Inventory (Globally available numbers)
  const inventory = await prisma.phoneNumber.findMany({
    where: {
      agentId: null,
      status: 'AVAILABLE'
    }
  });

  return (
    <AdminTenantDetail tenant={tenant} usage={currentUsage} invoices={mockInvoices} inventory={inventory} />
  );
}
