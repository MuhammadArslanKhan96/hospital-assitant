import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// LIST ALL (Super Admin Only)
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const catalog = await prisma.providerModel.findMany({
        orderBy: [{ type: 'asc' }, { name: 'asc' }]
    });

    return NextResponse.json({ catalog });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE (Super Admin Only)
export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await req.json();

        // 1. Fetch item to check provider
        const item = await prisma.providerModel.findUnique({ where: { id } });
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        // 2. If it's a custom-render voice, delete from Render server too
        if (item.provider === 'custom-render') {
            const renderUrl = process.env.RENDER_TTS_URL;
            const renderSecret = process.env.RENDER_TTS_SECRET;

            if (renderUrl && renderSecret) {
                try {
                    await fetch(`${renderUrl}/admin/delete-model/${item.value}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${renderSecret}` }
                    });
                } catch (e) {
                    console.error('Failed to delete model from Render:', e);
                    // Continue anyway to clean up DB
                }
            }
        }

        // 3. Delete from DB
        await prisma.providerModel.delete({ where: { id } });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// UPDATE (Super Admin Only)
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, isEnabled, costPerUnit } = await req.json();

    const updatedItem = await prisma.providerModel.update({
        where: { id },
        data: {
            isEnabled: isEnabled, // Might be undefined, which Prisma ignores if passed directly? No, update requires values or checks
            costPerUnit: costPerUnit // Might be undefined
        }
    });

    return NextResponse.json({ success: true, item: updatedItem });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
