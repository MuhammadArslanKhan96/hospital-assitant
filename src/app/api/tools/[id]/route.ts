import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// DELETE TOOL
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const tool = await prisma.tool.findUnique({
            where: { id: params.id }
        });

        if (!tool || tool.tenantId !== session.tenantId) {
            return NextResponse.json({ error: 'Tool not found or unauthorized' }, { status: 404 });
        }

        await prisma.tool.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Tool Delete Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
