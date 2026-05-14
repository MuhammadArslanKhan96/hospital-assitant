import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import TenantProfileForm from '@/components/settings/TenantProfileForm';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { tenant: true }
  });

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h1>
      <TenantProfileForm user={user} />
    </div>
  );
}
