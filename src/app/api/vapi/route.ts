import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import axios from 'axios';

const VAPI_BASE_URL = 'https://api.vapi.ai';

// Type definitions for VAPI payloads
interface VapiToolCall {
  id: string;
  function: {
    name: string;
    arguments: any; // Arguments come as an object from VAPI SDK
  };
}

interface VapiMessage {
  type: string;
  toolCalls?: VapiToolCall[];
  call?: any;
  duration?: number;
  cost?: number;
  recordingUrl?: string;
  transcript?: string;
  summary?: string;
}

interface VapiPayload {
  message: VapiMessage;
}

export async function POST(req: Request) {
  try {
    const payload: VapiPayload = await req.json();
    const { type } = payload.message;

    console.log(`[VAPI Webhook] Received Event: ${type}`);

    if (type === 'assistant-request') {
      const call = payload.message.call;
      let systemPromptToUse = "You are a helpful assistant.";
      let tenantTimezone = "UTC"; // Default fallback

      // Try to fetch the original prompt and timezone from the DB using the VAPI Assistant ID
      if (call?.assistantId) {
        const agent = await prisma.agent.findUnique({
          where: { vapiAssistantId: call.assistantId },
          include: { tenant: true }
        });
        if (agent) {
          if (agent.systemPrompt) {
            systemPromptToUse = agent.systemPrompt;
          }
          if (agent.tenant?.timezone) {
            tenantTimezone = agent.tenant.timezone;
          }
          if (agent.isBilingual) {
            systemPromptToUse += `\n\nLANGUAGE PROTOCOL: You are a fully bilingual agent. You MUST open the call with this exact bilingual greeting: 'Hello! Thank you for calling. Would you prefer to continue in English, or (enter your preferred language/languages)? Wait for the user's response. Based on their choice, pivot completely to that language for the remainder of the conversation. Translate all of your knowledge base, tool requests, and responses into the user's chosen language dynamically. Never mix languages after the choice is made.`;
          }
        }
      }

      // Generate the dynamic calendar and append it
      const calendarInjection = generateCalendarContext(tenantTimezone);
      const dynamicPrompt = systemPromptToUse + calendarInjection;

      // Return the overrides to VAPI
      return NextResponse.json({
        assistant: {
          model: {
            messages: [
              {
                role: "system",
                content: dynamicPrompt
              }
            ]
          }
        }
      });
    }

    if (type === 'tool-calls') {
      return await handleToolCalls(payload, req);
    }

    if (type === 'end-of-call-report') {
      return await handleEndOfCall(payload);
    }

    // Acknowledge other events
    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handleToolCalls(payload: VapiPayload, req: Request) {
  const toolCalls = payload.message.toolCalls || [];
  const results = [];
  const call = payload.message.call;

  // 1. Resolve Tenant/Agent
  // We try to find the Agent by VAPI Assistant ID first
  let tenantId = null;
  let agentId = null;

  let tenantTimezone = 'UTC';

  if (call?.assistantId) {
    const agent = await prisma.agent.findUnique({
      where: { vapiAssistantId: call.assistantId },
      include: { tenant: true }
    });
    if (agent) {
      tenantId = agent.tenantId;
      agentId = agent.id;
      tenantTimezone = agent.tenant.timezone || 'UTC';
    }
  }

  // Fallback: Check if it matches the "Demo" setup (optional, can remove later)
  if (!tenantId) {
    const demoTenant = await prisma.user.findUnique({
      where: { email: 'user@demo.com' },
      include: { tenant: true }
    });
    if (demoTenant?.tenant) tenantId = demoTenant.tenant.id;
  }

  if (!tenantId) {
    console.error("❌ Tenant not found for call:", call);
    // We still return results to avoid breaking the call, but log errors
  }

  for (const toolCall of toolCalls) {
    const { name, arguments: args } = toolCall.function;
    let result = "Error: Unknown function";

    console.log(`[Tool] ${name} triggered for Tenant ${tenantId}`);

    if (name === 'check_availability') {
      const isBusy = Math.random() > 0.8;
      result = isBusy ? "Busy. That time is taken." : "Available. That time is free.";
    }
    else if (name === 'book_appointment' && tenantId) {
      try {
        if (!args.startTime || !args.endTime || isNaN(new Date(args.startTime).getTime()) || isNaN(new Date(args.endTime).getTime())) {
            result = "Error: Missing or invalid startTime/endTime. Please explicitly ask the user for a valid date and time and try again.";
            results.push({ toolCallId: toolCall.id, result });
            continue;
        }

        // Extract standard fields
        const standardFields = ['name', 'phone', 'customerPhone', 'customerNumber', 'email', 'startTime', 'endTime', 'timezone', 'purpose'];
        const extraDetailsObj: Record<string, any> = {};

        for (const key of Object.keys(args)) {
            if (!standardFields.includes(key)) {
                extraDetailsObj[key] = args[key];
            }
        }

        // Log as a pending request initially
        const customerPhone = args.phone || args.customerPhone || args.customerNumber || call?.customer?.number || call?.customerNumber || call?.from || (payload.message as any).customer?.number || 'N/A';
        await prisma.appointment.create({
          data: {
            tenantId: tenantId,
            customerName: args.name || 'Unknown Caller',
            customerPhone: customerPhone,
            customerEmail: args.email || null,
            startTime: new Date(args.startTime),
            endTime: new Date(args.endTime),
            timezone: args.timezone || tenantTimezone, // Capture Timezone with Tenant Fallback
            status: 'pending',
            purpose: args.purpose || 'Appointment Request',
            extraDetails: Object.keys(extraDetailsObj).length > 0 ? JSON.stringify(extraDetailsObj) : null
          }
        });

        // Trigger Notification to Tenant
        const tenant = await prisma.tenant.findUnique({
             where: { id: tenantId },
             include: { user: true }
        });
        
        if (tenant?.user?.email && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
              const { transporter, EMAIL_FROM } = await import('@/lib/mail');
              const { render } = await import('@react-email/render');
              const AppointmentEmail = (await import('@/emails/AppointmentEmail')).default;

              const protocol = req.headers.get('x-forwarded-proto') || 'https';
              const host = req.headers.get('host') || 'virtualcall.ai';
              const baseUrl = `${protocol}://${host}`;

              const html = await render(AppointmentEmail({
                  customerName: args.name || 'Unknown Caller',
                  customerPhone: customerPhone,
                  customerEmail: args.email || undefined,
                  date: new Date(args.startTime).toLocaleDateString('en-US', { timeZone: args.timezone || tenantTimezone }),
                  time: new Date(args.startTime).toLocaleTimeString('en-US', { timeZone: args.timezone || tenantTimezone, hour: '2-digit', minute: '2-digit' }),
                  timezone: args.timezone || tenantTimezone,
                  purpose: args.purpose || 'Appointment Request',
                  isRequest: true,
                  baseUrl: baseUrl
              }));

              transporter.sendMail({
                  from: `"VirtualCall.AI" <${EMAIL_FROM}>`,
                  to: tenant.user.email,
                  subject: `New Appointment Request: ${args.name || 'Unknown Caller'}`,
                  html: html,
              }).catch(err => console.error("Failed to send request email:", err));
        }

        result = "Success. Your appointment request has been submitted and is awaiting approval.";
      } catch (e) {
        console.error("Booking Request Error", e);
        result = "Error submitting appointment request.";
      }
    }
    else if (name === 'cancel_appointment' && tenantId) {
      try {
        const customerPhone = args.phone || args.customerPhone || 'N/A';
        const searchDate = new Date(args.date);

        // Find the closest appointment matching phone and approximate date
        const appointments = await prisma.appointment.findMany({
          where: {
            tenantId: tenantId,
            customerPhone: customerPhone,
            status: { not: 'cancelled' }
          }
        });

        // Basic matching logic: find an appointment on the same day
        const appointmentToCancel = appointments.find(appt =>
          appt.startTime.toISOString().split('T')[0] === searchDate.toISOString().split('T')[0]
        );

        if (appointmentToCancel) {
          await prisma.appointment.update({
            where: { id: appointmentToCancel.id },
            data: { status: 'cancelled' }
          });
          result = "Success. The appointment has been cancelled successfully.";
        } else {
          result = "Error: Could not find a matching appointment to cancel on that date.";
        }
      } catch (e) {
        console.error("Cancellation Error", e);
        result = "Error cancelling the appointment.";
      }
    }
    else if (name === 'reschedule_appointment' && tenantId) {
      try {
        const customerPhone = args.phone || args.customerPhone || 'N/A';
        const oldDate = new Date(args.oldDate);
        const newStartTime = new Date(args.newStartTime);
        const newEndTime = new Date(args.newEndTime);

        const appointments = await prisma.appointment.findMany({
          where: {
            tenantId: tenantId,
            customerPhone: customerPhone,
            status: { not: 'cancelled' }
          }
        });

        const appointmentToReschedule = appointments.find(appt =>
          appt.startTime.toISOString().split('T')[0] === oldDate.toISOString().split('T')[0]
        );

        if (appointmentToReschedule) {
          await prisma.appointment.update({
            where: { id: appointmentToReschedule.id },
            data: {
              startTime: newStartTime,
              endTime: newEndTime,
              status: 'pending' // reset to pending on reschedule
            }
          });
          result = "Success. The appointment has been rescheduled successfully.";
        } else {
          result = "Error: Could not find the original appointment to reschedule.";
        }
      } catch (e) {
        console.error("Reschedule Error", e);
        result = "Error rescheduling the appointment.";
      }
    }
    else if (name === 'capture_lead' && tenantId) {
      // Log lead capture (we could add a Lead table later)
      console.log("📝 Lead Captured:", args);
      result = "Success. Lead details saved.";
    }
    else if (name === 'log_call') {
      // Just acknowledging the log
      result = "Success. Call logged.";
    }
    else if (name === 'transfer_call_tool') {
      // We log it, but VAPI executes the transfer natively now.
      const target = args.number || args.destination || 'Unknown';
      console.log(`🔀 Transferring call ${call?.id} to ${target}`);

      // Add to call metadata to be picked up by findFirst/update or shared state if possible
      // For now, we'll rely on the end-of-call report or a separate update if needed.
      // But since we want to see "how many calls transferred to which department", 
      // we can store this in a temporary way or update the call log if it exists.

      result = "Transfer initiated.";
    }
    else if (name === 'record_contact_preferences' && tenantId) {
      try {
        const phoneNumber = args.preferred_number || call?.customer?.number || call?.phoneNumber?.number;

        if (!phoneNumber) {
            result = "Error: Could not determine phone number.";
        } else {
            await prisma.contact.upsert({
                where: {
                    tenantId_phoneNumber: {
                        tenantId: tenantId,
                        phoneNumber: phoneNumber
                    }
                },
                update: {
                    smsConsent: args.sms_consent,
                    doNotCall: args.dnc_requested,
                    lastCallContext: args.call_context,
                    agentId: agentId
                },
                create: {
                    tenantId: tenantId,
                    agentId: agentId,
                    phoneNumber: phoneNumber,
                    smsConsent: args.sms_consent,
                    doNotCall: args.dnc_requested,
                    lastCallContext: args.call_context
                }
            });
            result = "Success. Contact preferences saved.";
        }
      } catch (e) {
          console.error("Contact Preferences Error", e);
          result = "Error saving contact preferences.";
      }
    }
    else if (name === 'get_customer_context' && tenantId) {
      try {
        const phoneNumber = args.customerNumber || call?.customer?.number || call?.phoneNumber?.number;

        if (!phoneNumber) {
            result = "Error: Could not determine phone number.";
        } else {
            // Fetch last 3 call logs and appointments
            const [pastCalls, appointments] = await Promise.all([
                prisma.callLog.findMany({
                    where: { tenantId, customerNumber: phoneNumber },
                    orderBy: { createdAt: 'desc' },
                    take: 3,
                    select: { summary: true, createdAt: true, outcome: true }
                }),
                prisma.appointment.findMany({
                    where: { tenantId, customerPhone: phoneNumber },
                    orderBy: { startTime: 'desc' },
                    take: 3
                })
            ]);

            const calendarContext = generateCalendarContext(tenantTimezone);
            
            if (pastCalls.length === 0 && appointments.length === 0) {
                result = JSON.stringify({
                    message: "This is a new customer. No previous history found.",
                    current_utc_time: new Date().toISOString(),
                    calendar_reference: calendarContext
                });
            } else {
                result = JSON.stringify({
                    current_utc_time: new Date().toISOString(),
                    calendar_reference: calendarContext,
                    past_interactions: pastCalls.map(c => ({
                        date: c.createdAt.toISOString(),
                        summary: c.summary,
                        outcome: c.outcome ? JSON.parse(c.outcome) : 'N/A'
                    })),
                    appointments: appointments.map(a => ({
                        startTime: a.startTime.toISOString(),
                        endTime: a.endTime.toISOString(),
                        status: a.status,
                        purpose: a.purpose,
                        timezone: a.timezone
                    }))
                });
            }
        }
      } catch (e) {
          console.error("Customer Context Error", e);
          result = "Error retrieving customer history.";
      }
    }
    else if (tenantId) {
      // Fallback: Check if it's a dynamic custom tool
      try {
        const customTool = await prisma.tool.findFirst({
            where: { tenantId, name }
        });

        if (customTool) {
            console.log(`[Custom Tool Execution] ${name} -> ${customTool.actionType} to ${customTool.actionTarget}`);

            if (customTool.actionType === 'EMAIL') {
                if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
                    const { transporter, EMAIL_FROM } = await import('@/lib/mail');

                    const { render } = await import('@react-email/render');
                    const CustomToolEmail = (await import('@/emails/CustomToolEmail')).default;

                    const protocol = req.headers.get('x-forwarded-proto') || 'https';
                    const host = req.headers.get('host') || 'virtualcall.ai';
                    const baseUrl = `${protocol}://${host}`;

                    const html = await render(CustomToolEmail({
                        toolName: name,
                        args: args,
                        baseUrl: baseUrl
                    }));

                    await transporter.sendMail({
                        from: `"VirtualCall.AI" <${EMAIL_FROM}>`,
                        to: customTool.actionTarget,
                        subject: `New Request: ${name.replace(/_/g, ' ')}`,
                        html: html,
                    });

                    // Log the tool call in the database (safely wrapped)
                    try {
                        await prisma.toolCall.create({
                            data: {
                                tenantId,
                                toolId: customTool.id,
                                customerNumber: call?.customer?.number || call?.customerNumber || call?.from || null,
                                data: JSON.stringify(args)
                            }
                        });
                    } catch (dbErr) {
                        console.error("Failed to log tool call to database:", dbErr);
                    }

                    result = "Success. The request has been emailed to the staff successfully.";
                } else {
                    result = "Error: Email system not configured.";
                }
            } else if (customTool.actionType === 'WEBHOOK') {
                // Post directly to the webhook
                try {
                    await axios.post(customTool.actionTarget, {
                        toolName: name,
                        agentId,
                        tenantId,
                        timestamp: new Date().toISOString(),
                        data: args,
                        callerNumber: call?.customer?.number || call?.customerNumber || call?.from
                    });

                    // Log the tool call in the database (safely wrapped)
                    try {
                        await prisma.toolCall.create({
                            data: {
                                tenantId,
                                toolId: customTool.id,
                                customerNumber: call?.customer?.number || call?.customerNumber || call?.from || null,
                                data: JSON.stringify(args)
                            }
                        });
                    } catch (dbErr) {
                        console.error("Failed to log tool call to database:", dbErr);
                    }

                    result = "Success. The request has been submitted to the external system.";
                } catch (err: any) {
                    console.error("Webhook Execution Error", err.response?.data || err.message);
                    result = "Error submitting request to external system.";
                }
            }
        }
      } catch (err) {
          console.error("Custom Tool Execution Error", err);
          result = "Error executing custom tool logic.";
      }
    }

    results.push({
      toolCallId: toolCall.id,
      result: result
    });
  }

  // Construct Response
  const response: any = { results };

  return NextResponse.json(response);
}

async function handleEndOfCall(payload: VapiPayload) {
  const report = payload.message as any;
  const rawDuration = report.durationSeconds || report.duration || 0;
  const duration = Math.round(rawDuration);

  let { call, cost, recordingUrl, transcript, summary } = payload.message;

  // 1. Resolve Tenant/Agent
  let tenantId = null;
  let agentId = null;
  let markup = 1.2;
  let billingMode = "FALLBACK";
  let transcriberEnabled = true;
  let agentModel = "gpt-4o";
  let agentVoiceId = "sarah";

  if (call?.assistantId) {
    const agent = await prisma.agent.findUnique({
      where: { vapiAssistantId: call.assistantId },
      include: { tenant: true }
    });
    if (agent) {
      tenantId = agent.tenantId;
      agentId = agent.id;
      markup = agent.tenant.markup;
      billingMode = agent.tenant.billingMode;
      transcriberEnabled = agent.transcriberEnabled;
      agentModel = agent.model;
      agentVoiceId = agent.voiceId;
    }
  }

  // Enforce privacy: drop transcript if transcriber was disabled (but keep recording as requested)
  if (!transcriberEnabled) {
      transcript = undefined;
  }

  // Fallback to Demo
  if (!tenantId) {
    const demoTenant = await prisma.user.findUnique({
      where: { email: 'user@demo.com' },
      include: { tenant: true }
    });
    if (demoTenant?.tenant) {
      tenantId = demoTenant.tenant.id;
      markup = demoTenant.tenant.markup;
      billingMode = demoTenant.tenant.billingMode;
    }
  }

  if (tenantId) {
    // 1. Raw Platform Cost (Actual Vapi charge, including OpenAI)
    const rawCost = cost || 0;

    // 2. Determine Cost Basis for Tenant Billing
    let costBasis = rawCost;

    if (billingMode === 'FALLBACK') {
        const vapiBaseCost = 0.05;

        // Fetch specific costPerUnit from Catalog
        const [modelRecord, voiceRecord] = await Promise.all([
          prisma.providerModel.findUnique({ where: { type_value: { type: 'model', value: agentModel } } }),
          prisma.providerModel.findUnique({ where: { type_value: { type: 'voice', value: agentVoiceId } } })
        ]);

        const modelCost = modelRecord?.costPerUnit ?? (agentModel.includes('gpt-4') && !agentModel.includes('mini') ? 0.06 : 0.01);
        const voiceCost = voiceRecord?.costPerUnit ?? (agentVoiceId.includes('11labs') ? 0.12 : 0.04);

        const fallbackCostPerMinute = vapiBaseCost + modelCost + voiceCost;

        // Calculate proportional cost based on exact duration seconds
        costBasis = (duration / 60) * fallbackCostPerMinute;
    }

    // 3. Apply Markup
    const billedCost = costBasis * markup;

    // Extract Disconnection Reason and Caller Number
    const endedReason = report.endedReason || 'unknown';
    const customerNumber = call?.customer?.number || call?.customerNumber || call?.from || (payload.message as any).customer?.number || null;

    // Attempt to extract transfer target from artifacts if available
    let transferTarget = null;
    let outcomeObj = null;

    if (report.artifact?.messages) {
      const messages = report.artifact.messages;

      // Look for transfer
      const transferTool = messages.find((m: any) =>
        m.toolCalls?.some((tc: any) => tc.function.name === 'transfer_call_tool')
      );
      if (transferTool) {
        try {
          const tc = transferTool.toolCalls.find((tc: any) => tc.function.name === 'transfer_call_tool');
          if (tc) {
            const args = typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments;
            transferTarget = args.number || args.destination || 'Unknown';
          }
        } catch (e) {
          console.error("Failed to parse transfer args", e);
        }
      }

      // Look for book_appointment
      const bookTool = messages.find((m: any) =>
        m.toolCalls?.some((tc: any) => tc.function.name === 'book_appointment')
      );
      // Look for capture_lead
      const leadTool = messages.find((m: any) =>
        m.toolCalls?.some((tc: any) => tc.function.name === 'capture_lead')
      );

      if (bookTool) {
        try {
          const tc = bookTool.toolCalls.find((tc: any) => tc.function.name === 'book_appointment');
          if (tc) {
            const args = typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments;
            outcomeObj = { type: 'BOOKED', data: args };
          }
        } catch (e) {}
      } else if (leadTool) {
        try {
          const tc = leadTool.toolCalls.find((tc: any) => tc.function.name === 'capture_lead');
          if (tc) {
            const args = typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments;
            outcomeObj = { type: 'LEAD', data: args };
          }
        } catch (e) {}
      }
    }

    await prisma.callLog.create({
      data: {
        tenantId: tenantId,
        agentId: agentId,
        vapiCallId: call?.id || 'unknown',
        status: 'completed',
        duration: duration || 0,
        cost: rawCost,
        billedCost: billedCost,
        recordingUrl: recordingUrl,
        transcript: transcript,
        summary: summary,
        customerNumber: customerNumber,
        disconnectionReason: endedReason,
        transferTarget: transferTarget,
        outcome: outcomeObj ? JSON.stringify(outcomeObj) : null
      }
    });
    console.log(`💾 Saved Call Log | Caller: ${customerNumber} | Reason: ${endedReason} | Cost: $${rawCost}`);
  } else {
    console.warn("⚠️ Could not log call: Tenant not found.");
  }

  return NextResponse.json({ status: 'logged' });
}

function generateCalendarContext(timezone: string): string {
  let context = `\n\n## CURRENT CALENDAR CONTEXT\n`;

  // Fallback to UTC if timezone is invalid
  let safeTimezone = timezone;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: safeTimezone });
  } catch (e) {
    console.warn(`Invalid timezone provided: ${timezone}. Falling back to UTC.`);
    safeTimezone = 'UTC';
  }

  // 1. Get the current Year, Month, Day in the target timezone
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTimezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).formatToParts(new Date());

  const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1; // JS months are 0-indexed
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');

  // 2. Format a safe UTC Date object that represents noon on each subsequent day
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', // We explicitly use UTC formatting to avoid local offset shifts
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  for (let i = 0; i < 14; i++) {
    // Create date at UTC Noon to prevent DST shift errors across midnight
    const d = new Date(Date.UTC(year, month, day + i, 12, 0, 0));
    const dateStr = formatter.format(d);
    
    if (i === 0) context += `Today is: ${dateStr}\n`;
    else if (i === 1) context += `Tomorrow is: ${dateStr}\n\nUpcoming Dates for reference:\n`;
    else context += `- ${dateStr}\n`;
  }
  
  context += `\nCRITICAL CALENDAR RULE: Do not guess days of the week. Rely strictly on the calendar context provided above.`;
  return context;
}
