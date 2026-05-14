import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import TenantManagementTable from '@/components/admin/TenantManagementTable';
import CreateTenantForm from '@/components/CreateTenantForm';
import GlobalSyncButton from '@/components/admin/GlobalSyncButton';

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const tenants = await prisma.tenant.findMany({
    include: {
        user: true,
        _count: {
            select: { agents: true, calls: true }
        }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
            <p className="text-gray-500 mt-2">Oversee all businesses, agents, and resources on the platform.</p>
        </div>
        <div className="flex flex-col items-end space-y-4">
            <div className="flex space-x-4">
                <a href="/admin/catalog" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium shadow-sm transition-colors">
                    Manage AI Catalog
                </a>
                <a href="/admin/billing" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm transition-colors">
                    Billing Overview
                </a>
            </div>
            <GlobalSyncButton />
        </div>
      </div>

      {/* Main Table */}
      <TenantManagementTable tenants={tenants} />

      {/* Onboarding Section */}
      <div className="pt-8 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Onboard New Tenant</h2>
        <CreateTenantForm />
      </div>
    </div>
  );
}
