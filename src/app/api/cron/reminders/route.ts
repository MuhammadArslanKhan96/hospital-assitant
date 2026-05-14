import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // Basic security to ensure only authorized pingers (like Render Cron) can trigger this
    // It is best practice to pass an auth header from your cron job
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        return NextResponse.json({ error: 'Email provider not configured.' }, { status: 500 });
    }

    try {
        const { transporter, EMAIL_FROM } = await import('@/lib/mail');
        const { render } = await import('@react-email/render');
        const AppointmentEmail = (await import('@/emails/AppointmentEmail')).default;

        const now = new Date();

        // Target windows
        // 24h window: Appointments starting between 23.5 and 24.5 hours from now
        const tomorrowStart = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
        const tomorrowEnd = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

        // 1h window: Appointments starting between 30 mins and 90 mins from now
        const hourStart = new Date(now.getTime() + 30 * 60 * 1000);
        const hourEnd = new Date(now.getTime() + 90 * 60 * 1000);

        // Now window: Appointments starting in the next 15 mins
        const exactStart = new Date(now.getTime() - 5 * 60 * 1000);
        const exactEnd = new Date(now.getTime() + 15 * 60 * 1000);

        const activeAppointments = await prisma.appointment.findMany({
            where: {
                status: 'confirmed',
                startTime: { gte: exactStart, lte: tomorrowEnd }
            },
            include: { tenant: { include: { user: true } } }
        });

        let emailsSent = 0;

        for (const apt of activeAppointments) {
            const timeDiff = apt.startTime.getTime() - now.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            let reminderType: '24h' | '1h' | 'now' | null = null;

            // Simple logic to prevent sending the same reminder twice would require a new DB column (e.g. `reminder24hSent: boolean`),
            // but for this MVP, we will rely on the window matching. If the cron runs every 1 hour, these windows might send twice.
            // Ideally, cron runs every 10 mins, and we narrow the windows to 10 mins.
            // For robust production: Add boolean flags to the Appointment model.

            // To make it robust without DB changes instantly, we check exact hour matches assuming a 1-hour cron.
            if (hoursDiff > 23 && hoursDiff <= 24) reminderType = '24h';
            else if (hoursDiff > 0 && hoursDiff <= 1) reminderType = '1h';
            else if (hoursDiff > -0.25 && hoursDiff <= 0) reminderType = 'now';

            if (reminderType && apt.tenant.user.email) {
                 const protocol = req.headers.get('x-forwarded-proto') || 'http';
                 const host = req.headers.get('host') || 'localhost:3000';
                 const baseUrl = `${protocol}://${host}`;

                 const tz = apt.timezone || apt.tenant.timezone || 'UTC';
                 const html = await render(AppointmentEmail({
                    customerName: apt.customerName,
                    customerPhone: apt.customerPhone || 'N/A',
                    customerEmail: apt.customerEmail || 'N/A',
                    date: apt.startTime.toLocaleDateString('en-US', { timeZone: tz }),
                    time: apt.startTime.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' }),
                    timezone: tz,
                    purpose: apt.purpose || 'General',
                    isReminder: true,
                    reminderType: reminderType,
                    baseUrl: baseUrl
                }));

                const recipients = [apt.tenant.user.email];
                if (apt.customerEmail) recipients.push(apt.customerEmail);

                await transporter.sendMail({
                    from: `"VirtualCall.AI" <${EMAIL_FROM}>`,
                    to: recipients,
                    subject: `Reminder: Appointment with ${apt.customerName}`,
                    html: html,
                });
                emailsSent++;
            }
        }

        return NextResponse.json({ success: true, emailsSent });

    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}