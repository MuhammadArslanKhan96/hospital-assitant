import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  tenantName: string;
  email: string;
  loginUrl: string;
  baseUrl: string;
}

export const WelcomeEmail = ({
  tenantName,
  email,
  loginUrl,
  baseUrl,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to VirtualCall.AI!</Preview>
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


          <Heading className="text-[#0f172a] text-[20px] font-normal text-center p-0 my-[30px] mx-0">
            Welcome, <strong>{tenantName}</strong>!
          </Heading>

          <Text className="text-[#475569] text-[15px] leading-[24px] mb-6">
            Your administrator has provisioned a new intelligent voice infrastructure account for you. You are one step away from deploying your own AI agents.
          </Text>

          <Section className="bg-[#f1f5f9] rounded-xl p-5 my-6 border border-[#e2e8f0] text-center">
             <Text className="text-[#475569] text-[14px] leading-[24px] m-0 mb-3">
              To complete your setup and access your dashboard, you need to create a secure password for your account: <strong>{email}</strong>
            </Text>

            <Link
              href={loginUrl}
              className="bg-[#0f172a] rounded-lg text-white text-[14px] font-bold no-underline text-center px-6 py-3.5 inline-block w-full max-w-[250px] shadow-md"
            >
              Set Your Password
            </Link>

            <Text className="text-[#64748b] text-[11px] leading-[18px] mt-4 mb-0">
              This secure link will expire in 24 hours.
            </Text>
          </Section>

          <Text className="text-[#94a3b8] text-[12px] leading-[20px] mt-[48px] text-center">
            This invitation was intended for {tenantName}. If you were not expecting this, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default WelcomeEmail;
