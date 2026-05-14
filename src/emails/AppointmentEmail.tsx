import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import { formatTimezoneWithStates } from '@/lib/timezone';

interface AppointmentEmailProps {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  time: string;
  timezone: string;
  purpose: string;
  isReminder?: boolean;
  isRequest?: boolean;
  reminderType?: '24h' | '1h' | 'now';
  baseUrl: string;
}

export const AppointmentEmail = ({
  customerName,
  customerPhone,
  customerEmail,
  date,
  time,
  timezone,
  purpose,
  isReminder = false,
  isRequest = false,
  reminderType,
  baseUrl
}: AppointmentEmailProps) => {

  let headerText = isRequest ? "New Appointment Request" : "New Appointment Booked";
  let previewText = isRequest ? `New appointment request from ${customerName}` : `New appointment with ${customerName} on ${date}`;

  if (isReminder) {
      if (reminderType === '24h') headerText = "Reminder: Appointment Tomorrow";
      if (reminderType === '1h') headerText = "Reminder: Appointment in 1 Hour";
      if (reminderType === 'now') headerText = "Your Appointment is Starting Now";
      previewText = headerText;
  }

  return (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Tailwind>
      <Body className="bg-[#f8fafc] my-auto mx-auto font-sans px-2">
        <Container className="border border-solid border-[#e2e8f0] rounded-2xl my-[40px] mx-auto p-[30px] max-w-[465px] bg-white shadow-lg relative overflow-hidden">
          {/* Top Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#94a3b8] via-[#334155] to-[#0f172a]"></div>

          <Section className="mt-[10px] mb-[30px] text-center w-full">
            <Img 
              src={`${baseUrl}/logo.jpeg`} 
              alt="VirtualCall.AI Logo Banner" 
              width="405" 
              className="mx-auto w-full max-w-[405px] h-auto object-contain rounded-xl border border-solid border-[#e2e8f0] shadow-sm" 
            />
          </Section>


          <Heading className="text-[#0f172a] text-[22px] font-bold text-center p-0 my-[20px] mx-0">
            {headerText}
          </Heading>

          <Text className="text-[#334155] text-[14px] leading-[24px]">
            {isReminder
                ? `This is a reminder for your scheduled appointment.`
                : isRequest 
                   ? `An AI Agent has logged a new appointment request. Please log in to your dashboard to approve or reschedule it.`
                   : `An AI Agent has successfully booked a new appointment.`}
          </Text>

          <Section className="bg-[#f8fafc] rounded-xl p-5 my-6 border border-[#e2e8f0]">
             <Text className="text-[#0f172a] text-[12px] font-bold uppercase tracking-widest m-0 mb-4 border-b border-[#e2e8f0] pb-2">
              {isRequest ? 'Requested Details' : 'Appointment Details'}
            </Text>

            <table className="w-full" cellPadding={0} cellSpacing={0}>
              <tr>
                <td className="py-2"><Text className="text-[#64748b] text-[14px] m-0 font-medium">When</Text></td>
                <td className="py-2 text-right"><Text className="text-[#0f172a] text-[14px] m-0 font-bold">{date} at {time}</Text></td>
              </tr>
              <tr>
                <td className="py-2"><Text className="text-[#64748b] text-[14px] m-0 font-medium">Timezone</Text></td>
                <td className="py-2 text-right"><Text className="text-[#0f172a] text-[14px] m-0 font-bold">{formatTimezoneWithStates(timezone)}</Text></td>
              </tr>
              <tr>
                <td className="py-2"><Text className="text-[#64748b] text-[14px] m-0 font-medium">Purpose</Text></td>
                <td className="py-2 text-right"><Text className="text-[#0f172a] text-[14px] m-0 font-bold">{purpose || 'General'}</Text></td>
              </tr>
            </table>
          </Section>

          <Section className="bg-[#f8fafc] rounded-xl p-5 my-6 border border-[#e2e8f0]">
             <Text className="text-[#0f172a] text-[12px] font-bold uppercase tracking-widest m-0 mb-4 border-b border-[#e2e8f0] pb-2">
              Attendee Details
            </Text>
            <table className="w-full" cellPadding={0} cellSpacing={0}>
              <tr>
                <td className="py-2"><Text className="text-[#64748b] text-[14px] m-0 font-medium">Name</Text></td>
                <td className="py-2 text-right"><Text className="text-[#0f172a] text-[14px] m-0 font-bold">{customerName}</Text></td>
              </tr>
              <tr>
                <td className="py-2"><Text className="text-[#64748b] text-[14px] m-0 font-medium">Phone</Text></td>
                <td className="py-2 text-right"><Text className="text-[#0f172a] text-[14px] m-0 font-bold">{customerPhone}</Text></td>
              </tr>
              {customerEmail && (
              <tr>
                <td className="py-2"><Text className="text-[#64748b] text-[14px] m-0 font-medium">Email</Text></td>
                <td className="py-2 text-right"><Text className="text-[#0f172a] text-[14px] m-0 font-bold">{customerEmail}</Text></td>
              </tr>
              )}
            </table>
          </Section>

          <Hr className="border border-solid border-[#e2e8f0] my-[26px] mx-0 w-full" />

          <Text className="text-[#64748b] text-[12px] leading-[24px] mt-[12px] text-center">
            Powered by VirtualCall.AI AI Voice Infrastructure.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
)};

export default AppointmentEmail;
