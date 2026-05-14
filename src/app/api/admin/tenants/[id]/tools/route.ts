import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// CREATE CUSTOM TOOL FOR TENANT
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, description, parameters, actionType, actionTarget } = body;

    if (!name || !description || !parameters || !actionType || !actionTarget) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate JSON
    try {
        JSON.parse(parameters);
    } catch(e) {
        return NextResponse.json({ error: 'Invalid JSON parameters' }, { status: 400 });
    }

    const newTool = await prisma.tool.create({
      data: {
        tenantId: params.id,
        name,
        description,
        parameters,
        actionType,
        actionTarget
      }
    });

    return NextResponse.json({ success: true, tool: newTool });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
