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

interface CustomToolEmailProps {
  toolName: string;
  args: Record<string, any>;
  baseUrl: string;
}

export const CustomToolEmail = ({
  toolName,
  args,
  baseUrl
}: CustomToolEmailProps) => {

  const headerText = `New Submission: ${toolName.replace(/_/g, ' ')}`;
  const previewText = `An AI agent has triggered a new request for ${toolName.replace(/_/g, ' ')}`;

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

          <Heading className="text-[#0f172a] text-[22px] font-bold text-center p-0 my-[20px] mx-0 capitalize">
            {headerText}
          </Heading>

          <Text className="text-[#334155] text-[14px] leading-[24px]">
            An AI Agent has successfully captured a request for <strong>{toolName.replace(/_/g, ' ')}</strong>. Please review the collected details below:
          </Text>

          <Section className="bg-[#f8fafc] rounded-xl p-5 my-6 border border-[#e2e8f0]">
             <Text className="text-[#0f172a] text-[12px] font-bold uppercase tracking-widest m-0 mb-4 border-b border-[#e2e8f0] pb-2">
              Captured Details
            </Text>

            <table className="w-full" cellPadding={0} cellSpacing={0}>
              {Object.entries(args).map(([key, value], idx) => (
                <tr key={idx}>
                  <td className="py-2 pr-4 border-b border-[#e2e8f0] border-opacity-50"><Text className="text-[#64748b] text-[14px] m-0 font-medium capitalize">{key.replace(/_/g, ' ')}</Text></td>
                  <td className="py-2 text-right border-b border-[#e2e8f0] border-opacity-50"><Text className="text-[#0f172a] text-[14px] m-0 font-bold">{String(value)}</Text></td>
                </tr>
              ))}
              {Object.keys(args).length === 0 && (
                <tr>
                  <td className="py-2"><Text className="text-[#64748b] text-[14px] m-0 font-medium">No parameters provided.</Text></td>
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

export default CustomToolEmail;
