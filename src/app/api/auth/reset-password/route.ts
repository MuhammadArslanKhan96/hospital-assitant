import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
    }

    // Find user by valid token
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Check expiry
    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
       return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
    }

    // Update password and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPassword, // In MVP plaintext, usually hashed
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}