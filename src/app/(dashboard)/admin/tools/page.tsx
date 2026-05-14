import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Wrench } from 'lucide-react';

export default async function GlobalToolsPage() {
  const session = await getSession();
  if (!session || session.role !== 'SUPER_ADMIN') redirect('/dashboard');

  const tools = await prisma.tool.findMany({
    include: { tenant: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Custom Tools</h1>
          <p className="text-gray-500">View and manage all custom tools created across all tenants.</p>
        </div>
      </div>

      <div className="space-y-4">
        {tools.length === 0 && (
          <div className="text-center py-12 bg-white border rounded-xl text-gray-500">
            No custom tools defined yet. Manage a tenant to add custom tools.
          </div>
        )}

        {tools.map(tool => (
          <div key={tool.id} className="bg-white p-5 border rounded-xl flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-gray-900">{tool.name}</h3>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                  {tool.actionType}
                </span>
                <span className="text-xs bg-purple-100 px-2 py-0.5 rounded text-purple-600 font-medium ml-2">
                  Tenant: {tool.tenant.name}
                </span>
              </div>
              <p className="text-sm text-gray-600">{tool.description}</p>
              <p className="text-xs text-gray-500 font-mono mt-2">Target: {tool.actionTarget}</p>
            </div>
            <Link
              href={`/admin/tenants/${tool.tenantId}/tools`}
              className="text-blue-500 hover:text-blue-700 p-2 text-sm font-medium flex items-center"
            >
              <Wrench className="w-4 h-4 mr-1" /> Manage
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}