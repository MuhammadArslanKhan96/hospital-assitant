import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { markup } = body;

    if (!markup || typeof markup !== 'number' || markup < 1.0) {
      return NextResponse.json({ error: 'Invalid markup value' }, { status: 400 });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: params.id },
      data: { markup }
    });

    return NextResponse.json({ success: true, tenant: updatedTenant });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
