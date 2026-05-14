import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CatalogTable from '@/components/admin/CatalogTable';
import SyncCatalogButton from '@/components/admin/SyncCatalogButton';
import UploadCustomVoiceModal from '@/components/admin/UploadCustomVoiceModal';

export default async function AdminCatalogPage() {
  const session = await getSession();

  if (!session || session.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const catalog = await prisma.providerModel.findMany({
    orderBy: [{ type: 'asc' }, { name: 'asc' }]
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Provider Catalog</h1>
            <p className="text-gray-500 mt-2">Enable/Disable Models, Voices, and Transcribers available to tenants.</p>
        </div>
        <div className="flex items-center space-x-3">
          <UploadCustomVoiceModal />
          <SyncCatalogButton />
        </div>
      </div>

      {/* Main Table */}
      <CatalogTable initialData={catalog} />
    </div>
  );
}
