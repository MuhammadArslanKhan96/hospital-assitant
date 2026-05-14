import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AppointmentBoard from '@/components/AppointmentBoard';

export default async function AppointmentsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [appointments, tenant] = await Promise.all([
    prisma.appointment.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { timezone: true }
    })
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
      <AppointmentBoard initialAppointments={appointments} tenantTimezone={tenant?.timezone || 'UTC'} />
    </div>
  );
}
