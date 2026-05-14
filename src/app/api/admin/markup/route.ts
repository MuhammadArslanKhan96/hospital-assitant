import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { markup } = body;

    if (!markup || typeof markup !== 'number' || markup < 1.0) {
      return NextResponse.json({ error: 'Invalid markup value (must be >= 1.0)' }, { status: 400 });
    }

    // Bulk Update All Tenants
    await prisma.tenant.updateMany({
      data: {
        markup: markup
      }
    });

    console.log(`✅ Admin updated global markup to ${markup}x`);

    return NextResponse.json({ success: true, message: `Updated all tenants to ${markup}x markup` });

  } catch (error) {
    console.error('Markup Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
