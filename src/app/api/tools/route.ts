import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// CREATE TOOL
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, description, parameters, actionType, actionTarget } = body;

    // Validate Parameter JSON
    try {
        JSON.parse(parameters);
    } catch(e) {
        return NextResponse.json({ error: 'Invalid JSON parameters' }, { status: 400 });
    }

    const newTool = await prisma.tool.create({
      data: {
        tenantId: session.tenantId,
        name,
        description,
        parameters, // Stored as stringified JSON
        actionType: actionType || "EMAIL",
        actionTarget: actionTarget || "none@example.com"
      }
    });

    return NextResponse.json({ success: true, tool: newTool });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET TOOLS
export async function GET(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const queryTenantId = searchParams.get('tenantId');

    // Allow SUPER_ADMIN to query tools for a specific tenant
    let targetTenantId = session.tenantId;
    if (session.role === 'SUPER_ADMIN' && queryTenantId) {
        targetTenantId = queryTenantId;
    }

    const tools = await prisma.tool.findMany({
        where: { tenantId: targetTenantId },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ tools });
}
