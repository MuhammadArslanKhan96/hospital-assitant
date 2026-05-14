import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { status, startTime, purpose } = body;

    const appointment = await prisma.appointment.findUnique({ where: { id: params.id } });
    if (!appointment || appointment.tenantId !== session.tenantId) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const updated = await prisma.appointment.update({
        where: { id: params.id },
        data: {
            status: status || undefined,
            startTime: startTime ? new Date(startTime) : undefined,
            // If startTime changes, assume 1 hour duration or keep original end?
            // For simplicity, let's just shift end time if start changes.
            endTime: startTime ? new Date(new Date(startTime).getTime() + 60*60*1000) : undefined,
            purpose: purpose || undefined
        }
    });

    // If status changed to confirmed, send emails
    if (status === 'confirmed' && appointment.status === 'pending') {
        try {
            const tenant = await prisma.tenant.findUnique({
                where: { id: appointment.tenantId },
                include: { user: true }
            });

            const customerEmail = updated.customerEmail;

            if (tenant?.user.email && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
                const { transporter, EMAIL_FROM } = await import('@/lib/mail');
                const { render } = await import('@react-email/render');
                const AppointmentEmail = (await import('@/emails/AppointmentEmail')).default;

                const protocol = req.headers.get('x-forwarded-proto') || 'http';
                const host = req.headers.get('host') || 'localhost:3000';
                const baseUrl = `${protocol}://${host}`;

                const tz = updated.timezone || tenant.timezone || 'UTC';
                const html = await render(AppointmentEmail({
                    customerName: updated.customerName,
                    customerPhone: updated.customerPhone || 'N/A',
                    customerEmail: customerEmail || 'N/A',
                    date: updated.startTime.toLocaleDateString('en-US', { timeZone: tz }),
                    time: updated.startTime.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' }),
                    timezone: tz,
                    purpose: updated.purpose || 'General',
                    isReminder: false,
                    baseUrl: baseUrl
                }));

                const recipients = [tenant.user.email];
                if (customerEmail) recipients.push(customerEmail);

                transporter.sendMail({
                    from: `"VirtualCall.AI" <${EMAIL_FROM}>`,
                    to: recipients,
                    subject: `Appointment Confirmed: ${updated.customerName}`,
                    html: html,
                }).catch(err => console.error("Failed to send confirmation email:", err));
            }
        } catch (e) {
            console.error("Failed to process confirmation emails", e);
        }
    }

    return NextResponse.json({ success: true, appointment: updated });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
