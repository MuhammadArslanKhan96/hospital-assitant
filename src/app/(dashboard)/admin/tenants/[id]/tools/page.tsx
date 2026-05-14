import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CustomToolsClient from '@/components/admin/CustomToolsClient';

export default async function TenantToolsPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'SUPER_ADMIN') redirect('/dashboard');

  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id }
  });

  if (!tenant) return <div>Tenant not found</div>;

  const tools = await prisma.tool.findMany({
    where: { tenantId: params.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <CustomToolsClient tenantId={tenant.id} tenantName={tenant.name} initialTools={tools} />
  );
}