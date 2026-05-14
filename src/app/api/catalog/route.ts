import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// LIST ALL ENABLED (Tenant Accessible)
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const catalog = await prisma.providerModel.findMany({
        where: { isEnabled: true },
        orderBy: [{ type: 'asc' }, { name: 'asc' }]
    });

    return NextResponse.json({ catalog });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
