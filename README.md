# VirtualCall.AI: MVP Setup Guide

This project is a multi-tenant AI Contact Center built with **Next.js**, **Prisma**, and **VAPI**.

## 🚀 Getting Started

### 1. Database Setup (SQLite for Local Dev)
By default, this project uses **SQLite** for rapid development.
1.  Run `npm install` to install dependencies.
2.  Run `npx prisma migrate dev` to create the database (`prisma/dev.db`).
3.  Run `npx prisma db seed` to seed a Super Admin (`admin@crossconnect.ai`) and Demo Tenant (`user@demo.com`).

### 2. Switching to PostgreSQL (Production)
When deploying to Render/Vercel with a real Postgres database (e.g., Supabase, Neon):

1.  Open `prisma/schema.prisma`.
2.  Change the datasource provider:
    ```prisma
    datasource db {
      provider = "postgresql" // WAS "sqlite"
      url      = env("DATABASE_URL")
    }
    ```
3.  Update your `.env` file with the Postgres connection string:
    ```bash
    DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
    ```
4.  Run `npx prisma migrate deploy` to apply migrations to production.

## 🔑 Environment Variables
Create a `.env` file in the root:
```bash
DATABASE_URL="file:./dev.db"
ADMIN_KEY="supersecretkey123"
VAPI_API_KEY="YOUR_VAPI_PRIVATE_KEY"
WEBHOOK_URL="https://your-domain.com/api/vapi"
```

## 📞 Call Handling
To make calls work:
1.  **VAPI Dashboard:** Go to your Assistant -> "Server URL".
2.  **Set Webhook:** Point it to `https://your-domain.com/api/vapi`.
3.  **Phone Number:** Buy a number in VAPI and assign it to the assistant.
4.  **Test:** Call the number. The logs will appear in your Dashboard under "Calls".

## 🤖 AI Configuration (New!)
Tenants can now configure their AI directly from the dashboard:
*   **System Prompt:** Customize how the AI behaves ("You are a dental receptionist...").
*   **Model:** Select `GPT-4o`, `GPT-3.5 Turbo`, or `Claude`.
*   **Voice:** Choose from standard 11Labs voices (`Sarah`, `Rachel`, etc.).
*   **API Key:** Provide a custom API Key (optional).

Updates are instantly synced to the live VAPI Assistant.

## 📊 Analytics & Reporting (New!)
The platform now includes comprehensive reporting tools:
*   **Per-Agent Analytics:** Click on an agent to view a detailed breakdown of their performance, including matched calls, total duration, and estimated spend.
*   **Area Code Analytics:** View all inbound/outbound calls grouped by US Area Code, complete with city mapping and date filters to track regional volume.
*   **Advanced Filtering:** Filter the global call log by specific agents, status, and date range to quickly identify trends.
