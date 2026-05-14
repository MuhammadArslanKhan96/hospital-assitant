import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { transporter, EMAIL_FROM } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success even if user doesn't exist to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate token
    const token = crypto.randomUUID();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // 1 hour expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
    
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl && host) {
        baseUrl = `${protocol}://${host}`;
    } else if (!baseUrl) {
        baseUrl = 'http://localhost:3000';
    }

    const resetUrl = `${baseUrl}/login/reset-password?token=${token}`;

    try {
        await transporter.sendMail({
          from: `"VirtualCall.AI" <${EMAIL_FROM}>`,
          to: user.email,
          subject: 'Reset your VirtualCall.AI password',
          html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p>Hello,</p>
              <p>We received a request to reset the password for your VirtualCall.AI account.</p>
              <p>Click the button below to set a new password:</p>
              <div style="margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
              </div>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="color: #666; font-size: 14px; word-break: break-all;">${resetUrl}</p>
              <p style="margin-top: 40px; color: #999; font-size: 12px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
          `,
        });
    } catch (e) {
        console.error("Failed to send reset email, but token generated.", e);
        // If smtp fails (like on local), print to console so we can test
        console.log(`\n\n[DEV] PASSWORD RESET LINK FOR ${user.email}:\n${resetUrl}\n\n`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
