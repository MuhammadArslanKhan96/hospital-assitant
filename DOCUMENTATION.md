# VirtualCall.AI Platform Documentation

Welcome to **VirtualCall.AI**, a multi-tenant Next.js web application designed to act as an intelligent infrastructure wrapper around the VAPI AI voice platform. VirtualCall.AI enables entrepreneurs, agencies, and businesses to deploy, manage, and monetize state-of-the-art inbound and outbound AI voice agents.

This document outlines the core capabilities, features, architectures, and value propositions of the platform.

---

## 🏗 Core Architecture & Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL managed via Prisma ORM
- **Styling:** Tailwind CSS (Custom "Premium Card" UI)
- **Authentication:** Custom session-based cookie authentication with role-based access control (Super Admin vs. Tenant).
- **Core Integrations:**
  - [VAPI](https://vapi.ai) (Core Telephony & AI Compute infrastructure)
  - Nodemailer / React Email (System notifications)

---

## 🌟 Key Features & Capabilities

### 1. Multi-Tenant Wholesale/Retail Billing System
The defining capability of VirtualCall.AI is its ability to act as a white-label AI agency platform.
- **The Concept:** As the platform owner (Super Admin), you connect your VAPI, OpenAI, and ElevenLabs wholesale API keys to the backend. You then create "Tenants" (your customers).
- **Markup Engine:** You can assign a specific pricing `markup` multiplier to each tenant (e.g., 1.5x, 2.0x).
- **Real-Time Billing:** When an AI call ends, the VAPI webhook fires to your backend, providing the exact wholesale cost of the call. VirtualCall.AI multiplies this by the Tenant's markup and saves it as `billedCost`.
- **UI Transparency:** Tenants view an "Estimated Costs" breakdown in their UI that is strictly calculated using their retail, post-markup pricing, ensuring they never see your wholesale costs.

### 2. Intelligent AI Agent Configuration
Tenants can build custom AI agents via an intuitive, no-code graphical interface that automatically synchronizes with the VAPI backend.
- **Provider & Model Agnostic:** Select between premium providers (GPT-4o, Claude 3.5 Sonnet) or cost-effective/ultra-low-latency models (GPT-4o-mini, Groq Llama 3 8B).
- **Voice Cloning & Selection:** Access a robust catalog of voices (ElevenLabs, Deepgram, OpenAI) seamlessly mapped to their respective API IDs.
- **Advanced Voice Controls:** Modify agent temperature (creativity), speaking speed, ambient background noise (e.g., Office environment), and control whether the AI or the user speaks first.
- **Voicemail Handling:** Provide explicit fallback instructions on how the agent should behave if an answering machine is detected on outbound calls.
- **AI Prompt Assistant (GPT-4o):** An integrated, modal-based prompt engineering assistant. Tenants can choose between a "Quick Chat" or a "Guided Questionnaire" where the AI asks them step-by-step questions about their business. The assistant is fully context-aware, meaning it knows exactly what tools the user has enabled (e.g., `book_appointment`, `transferCall`) and automatically weaves the correct operational instructions into the final, optimized System Prompt.

### 3. Dynamic Tool Calling
Agents can be equipped with logical tools using simple checkboxes. When enabled, the UI provides automatic "Prompt Guides" to help the tenant successfully command the AI to use the tool.
- **Book Appointment:** AI collects name, time, and email. The backend creates a database record and dispatches an automated React Email confirmation.
- **Check Availability:** AI checks the database to confirm if a specific time slot is free.
- **Capture Lead:** Collects basic customer CRM data if the user isn't ready to book yet.
- **Call Transfer:** Equip the AI with SIP or E.164 phone targets. The AI can natively transfer the caller to specific human departments ("Sales", "Billing") based on intent.
- **Log Call Outcome:** Forces the AI to generate a strict, formatted JSON summary of the intent and result of the call before hanging up.

### 4. Audience & Consent Management (DNC)
A robust CRM specifically built for outbound dialing safety and compliance.
- **Record Contact Preferences:** The AI is instructed via System Prompts to ask for SMS Consent before ending calls. It executes a tool that upserts the caller's preferences into the `Contact` database.
- **Do Not Call (DNC) Enforcement:** If an angry user tells the AI to stop calling them, the AI immediately flags them as DNC and ends the call.
- **Outbound Dialer Filtering:** When a tenant initiates an outbound campaign, the backend queries the DNC list. Any target number present on the list is silently skipped, protecting the tenant from compliance breaches.
- **Audience Dashboard:** A beautifully designed interface for tenants to view and filter their contacts by Agent, SMS Consent status, and DNC status.

### 5. Outbound Campaigns & Batch Dialing
Tenants can initiate mass outbound calling campaigns directly from the dashboard.
- Upload a list of contacts with specific names and numbers.
- The system validates the numbers, scrubs them against the tenant's DNC list, and dispatches the batch to VAPI.
- **Dynamic Prompt Variables:** The system supports variables like `{{customer.name}}` in the System Prompt, allowing the AI to dynamically greet each person on the list by name.

### 6. Analytics & Transcripts Dashboard
- **Real-Time KPIs:** The tenant dashboard visualizes total calls, minutes used, total accrued spend, appointment conversions, and average cost per call.
- **Geographic Data:** Tracks and maps area codes to physical US cities to show tenants where their calls are coming from.
- **Call Logs:** Provides a unified table of every call, displaying the disconnection reason, call summary, duration, financial cost, and a clickable link to listen to the exact audio recording of the conversation.

### 7. Super Admin "AI Catalog"
The platform dynamically manages what AI models and voices are available to tenants.
- Super Admins have a dedicated dashboard to fetch the latest available voices from VAPI.
- The `Sync Catalog` feature maintains a robust fallback array of known AI Models (Groq, OpenAI, Anthropic) and Voices (ElevenLabs, Deepgram) and assigns wholesale `costPerUnit` estimates to them.

### 8. Super Admin Profitability & Cost Simulator
A dedicated `/admin/calls` dashboard provides absolute transparency into platform margins and billing strategies.
- **Billing Modes (REAL vs. FALLBACK):** The Super Admin can toggle individual tenants between two billing paradigms.
  - `REAL`: Bills the tenant based on the exact, real-time fraction-of-a-cent token and character usage tracked by Vapi (highly accurate).
  - `FALLBACK`: Bills the tenant based on a flat, predictable per-minute rate defined in the `ProviderModel` catalog (highly profitable/stable margins).
- **Cost Simulator:** An interactive calculator that lets the Super Admin select a Model, Voice, Duration, and Markup multiplier to instantly compare what the tenant would be billed (and the resulting profit) under both the REAL and FALLBACK billing logics.
- **Platform Call Log:** A global view of every call across all tenants, explicitly detailing the raw wholesale cost, the final billed cost, and the exact profit generated per call.

---

## 📈 Positives & Value Proposition

1. **High Margin Potential:** By utilizing VAPI's infrastructure, platform operators don't have to build complex WebRTC infrastructure. The platform easily supports applying 20% to 100%+ markups on compute, generating hands-free MRR.
2. **Reduced Churn:** Unlike pure horizontal AI platforms, features like native Email Booking, SMS Consent tracking, and DNC enforcement provide vertical-specific value that makes the software "sticky" for small businesses (like medical clinics, real estate agencies, etc.).
3. **Consumer Grade UX:** The application hides the complexity of JSON schemas, tool definitions, and API keys. A tenant simply types a prompt, selects a voice, checks a few boxes, and deploys an enterprise-grade AI agent in 60 seconds.
4. **Safety & Compliance:** The hardcoded DNC filtering ensures that rogue AI agents or careless tenants don't spam angry customers, reducing the risk of Twilio/telephony bans.