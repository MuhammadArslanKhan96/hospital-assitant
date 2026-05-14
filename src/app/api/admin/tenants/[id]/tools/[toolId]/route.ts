import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// DELETE CUSTOM TOOL FOR TENANT
export async function DELETE(req: Request, { params }: { params: { id: string, toolId: string } }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const tool = await prisma.tool.findUnique({
            where: { id: params.toolId }
        });

        if (!tool || tool.tenantId !== params.id) {
            return NextResponse.json({ error: 'Tool not found or unauthorized' }, { status: 404 });
        }

        await prisma.tool.delete({
            where: { id: params.toolId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// UPDATE CUSTOM TOOL FOR TENANT
export async function PATCH(req: Request, { params }: { params: { id: string, toolId: string } }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { name, description, parameters, actionType, actionTarget } = body;

        const tool = await prisma.tool.findUnique({
            where: { id: params.toolId }
        });

        if (!tool || tool.tenantId !== params.id) {
            return NextResponse.json({ error: 'Tool not found or unauthorized' }, { status: 404 });
        }

        // Validate JSON
        if (parameters) {
            try {
                JSON.parse(parameters);
            } catch(e) {
                return NextResponse.json({ error: 'Invalid JSON parameters' }, { status: 400 });
            }
        }

        const updatedTool = await prisma.tool.update({
            where: { id: params.toolId },
            data: {
                name,
                description,
                parameters,
                actionType,
                actionTarget
            }
        });

        return NextResponse.json({ success: true, tool: updatedTool });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
