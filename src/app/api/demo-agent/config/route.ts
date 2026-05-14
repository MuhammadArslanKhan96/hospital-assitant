export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const demoAgent = await prisma.demoAgentConfig.findUnique({
      where: { id: 'global' },
    });

    if (!demoAgent || !demoAgent.isActive || !demoAgent.vapiAssistantId) {
      return NextResponse.json({ isActive: false });
    }

    return NextResponse.json({
      isActive: true,
      vapiAssistantId: demoAgent.vapiAssistantId,
      publicKey: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '',
    });
  } catch (error) {
    console.error('Failed to fetch demo agent config:', error);
    return NextResponse.json({ isActive: false }, { status: 500 });
  }
}
