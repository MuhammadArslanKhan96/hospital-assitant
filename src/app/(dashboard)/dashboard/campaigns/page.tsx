import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CampaignClient from '@/components/CampaignClient';

export default async function CampaignsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [agents, tenant] = await Promise.all([
    prisma.agent.findMany({
      where: { tenantId: session.tenantId },
      include: { phoneNumber: true }
    }),
    prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { timezone: true }
    })
  ]);

  return <CampaignClient agents={agents} tenantTimezone={tenant?.timezone || 'UTC'} />;
}
