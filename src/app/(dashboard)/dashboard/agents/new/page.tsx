import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import NewAgentForm from '@/components/agents/NewAgentForm';

export default async function NewAgentPage({ searchParams }: { searchParams: { tenantId?: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'SUPER_ADMIN') redirect('/dashboard/agents');

  // If admin is creating for a specific tenant via query param
  const targetTenantId = searchParams.tenantId || session.tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: targetTenantId },
    select: { id: true, markup: true, billingMode: true }
  });

  return <NewAgentForm
    tenantId={tenant?.id || session.tenantId}
    markup={tenant?.markup || 1.2}
    billingMode={tenant?.billingMode || 'FALLBACK'}
    isAdmin={session.role === 'SUPER_ADMIN'}
  />;
}

