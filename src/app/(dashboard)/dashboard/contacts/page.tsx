import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ContactsClient from './ContactsClient';

export default async function ContactsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const tenantId = session.tenantId;

  // Fetch all Contacts and their associated Agents
  const [contacts, tenant] = await Promise.all([
    prisma.contact.findMany({
      where: { tenantId },
      include: {
          agent: {
              select: { name: true }
          }
      },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { timezone: true }
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audience & Consent Management</h1>
        <p className="text-gray-500 mt-1">Manage contact preferences, SMS consent, and DNC lists.</p>
      </div>

      <div className="premium-card">
         <ContactsClient initialContacts={contacts} tenantTimezone={tenant?.timezone || 'UTC'} />
      </div>
    </div>
  );
}
