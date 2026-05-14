import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { billingMode } = await request.json();

    if (!['REAL', 'FALLBACK'].includes(billingMode)) {
      return NextResponse.json({ error: 'Invalid billing mode' }, { status: 400 });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: params.id },
      data: { billingMode: billingMode },
    });

    return NextResponse.json(updatedTenant);
  } catch (error) {
    console.error('Error updating billing mode:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
