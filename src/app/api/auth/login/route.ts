import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true }
  });

  if (!user || user.password !== password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Create a simple session object
  const session = {
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenant?.id
  };

  // Set a cookie
  const response = NextResponse.json({ success: true, user: session });
  response.cookies.set('session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  return response;
}
