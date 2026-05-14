import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import PhoneNumberManagement from '@/components/admin/PhoneNumberManagement';

export default async function AdminNumbersPage() {
    const session = await getSession();

    if (!session || session.role !== 'SUPER_ADMIN') {
        redirect('/dashboard');
    }

    const numbers = await prisma.phoneNumber.findMany({
        include: {
            agent: {
                include: {
                    tenant: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Compute summary stats
    const stats = {
        total: numbers.length,
        available: numbers.filter(n => n.status === 'AVAILABLE').length,
        assigned: numbers.filter(n => n.status === 'ASSIGNED' || n.status === 'ACTIVE').length,
        pending: numbers.filter(n => n.status === 'PENDING').length,
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Phone Number Management</h1>
                <p className="text-gray-500 mt-2">View and manage all phone numbers across the platform.</p>
            </div>

            <PhoneNumberManagement numbers={JSON.parse(JSON.stringify(numbers))} stats={stats} />
        </div>
    );
}
