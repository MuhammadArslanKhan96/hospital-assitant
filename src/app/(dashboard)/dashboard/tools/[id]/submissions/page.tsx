import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import ToolSubmissionsClient from '@/components/tools/ToolSubmissionsClient';

export default async function ToolSubmissionsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const tenantId = session.tenantId;

  const tool = await prisma.tool.findUnique({
    where: { 
        id: params.id,
        tenantId // Ensure it belongs to this tenant
    }
  });

  if (!tool) notFound();

  const submissions = await prisma.toolCall.findMany({
    where: {
      toolId: tool.id,
      tenantId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <ToolSubmissionsClient 
        toolName={tool.name} 
        submissions={submissions} 
    />
  );
}
