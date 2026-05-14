import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();

    // Only SUPER_ADMIN can create tenants
    if (!session || session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized: Only Super Admin can create tenants.' }, { status: 403 });
    }

    const { name, email, password } = await req.json();

    if (!name || !email) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Generate a secure reset token
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 1. Create User first (as Tenant has FK to User)
    const user = await prisma.user.create({
        data: {
            email: email,
            password: password || "PENDING_SETUP", // Placeholder or initial password
            role: 'TENANT',
            resetToken: resetToken,
            resetTokenExpiry: resetTokenExpiry
        }
    });

    // 2. Create Tenant linked to User
    const tenant = await prisma.tenant.create({
        data: {
            name: name,
            markup: 1.2,
            userId: user.id
        }
    });

    // 3. Send Welcome Email via Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        try {
            const { transporter, EMAIL_FROM } = await import('@/lib/mail');
            const { render } = await import('@react-email/render');
            const WelcomeEmail = (await import('@/emails/WelcomeEmail')).default;

            // Auto-fetch base URL
            const protocol = req.headers.get('x-forwarded-proto') || 'http';
            const host = req.headers.get('host') || 'localhost:3000';
            const baseUrl = `${protocol}://${host}`;
            const loginUrl = `${baseUrl}/login/reset-password?token=${resetToken}`;

            const html = await render(WelcomeEmail({
                tenantName: name,
                email: email,
                loginUrl: loginUrl,
                baseUrl: baseUrl
            }));

            await transporter.sendMail({
                from: `"VirtualCall.AI" <${EMAIL_FROM}>`,
                to: email,
                subject: 'Welcome to VirtualCall.AI',
                html: html,
            });
            console.log(`Welcome email sent to ${email}`);
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
            // Do not fail the request if email fails, just log it
        }
    } else {
        console.log("Skipping welcome email: EMAIL_USER or EMAIL_PASSWORD not set in environment.");
    }

    return NextResponse.json({ success: true, tenant, user });

  } catch (error) {
    console.error("Create Tenant Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
