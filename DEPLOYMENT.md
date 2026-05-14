# Cross Connect: Render Deployment Guide 🚀

This guide explains how to deploy the **Cross Connect** MVP to **Render** in 10 minutes or less.

## Prerequisites
*   A **GitHub Account** (with this repo pushed).
*   A **Render Account** (https://render.com).
*   A **VAPI Account** (https://vapi.ai) with your OpenAI key configured.

---

## Step 1: Create the Database (PostgreSQL)
1.  Log in to Render.
2.  Click **New +** -> **PostgreSQL**.
3.  **Name:** `cross-connect-db`
4.  **Database:** `cross_connect`
5.  **User:** `cross_connect_user`
6.  **Region:** Choose closest to you (e.g., Ohio).
7.  **Plan:** Free (or Starter for production).
8.  **Create Database.**
9.  **Wait:** Once created, copy the **Internal Database URL** (it starts with `postgres://...`). You will need this later.

---

## Step 2: Create the Web Service (The App)
1.  Click **New +** -> **Web Service**.
2.  **Connect GitHub:** Select this repository (`cross-connect-mvp`).
3.  **Name:** `cross-connect-app`
4.  **Region:** Same as your Database.
5.  **Branch:** `main` (or your working branch).
6.  **Runtime:** **Node**
7.  **Build Command:**
    ```bash
    npm install --include=dev && npx prisma generate && npm run build
    ```
    *Note: The `--include=dev` is critical to ensure Prisma CLI v5.11.0 is installed, preventing a fallback to v7 which breaks the build.*
8.  **Start Command:** `npm start`

---

## Step 3: Environment Variables
Scroll down to the **Environment Variables** section and add the following keys:

| Key | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgres://...` | Paste the **Internal Database URL** from Step 1. |
| `VAPI_API_KEY` | `sk-...` | Your private VAPI API Key (Secret). |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | `pub-...` | Your VAPI Public Key (Found in VAPI Dashboard). **Required for "Test AI" button.** |
| `ADMIN_KEY` | `supersecretkey123` | A secret password for Admin API access. |
| `NODE_ENV` | `production` | Tells Next.js to run in production mode. |

**Important:** Render will automatically assign a `PORT` variable. You do not need to set it manually.

---

## Step 4: Deploy & Migrate
1.  Click **Create Web Service**.
2.  Render will start building your app.
3.  **Wait:** It might take 2-3 minutes.
4.  **Migration:** Once the build finishes, the app might crash initially because the database tables don't exist yet.
5.  **Fix:** Go to the **Shell** tab in your Web Service dashboard.
6.  Run this command to create the tables (including the new `Agent` tables):
    ```bash
    npx prisma migrate deploy
    ```
7.  Run this command to seed the Admin user:
    ```bash
    npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts
    ```
    *(Note: If the seed fails, you can manually insert the admin user via SQL or just rely on the Signup flow).*

---

## Step 5: Connect VAPI Webhook (Multi-Tenant)
This is the **Core** of the system.
1.  Copy your new Render URL (e.g., `https://cross-connect-app.onrender.com`).
2.  Log in to your **VAPI Dashboard**.
3.  Go to your **Account Settings** (Default Server URL).
4.  Set the URL to:
    ```
    https://cross-connect-app.onrender.com/api/vapi
    ```
5.  **Test:** Create a new Tenant via the Admin Dashboard.
    *   Our app (`/api/tenants/create`) will create a *New* VAPI Assistant for that tenant.
    *   It will *automatically* set its Server URL to your Render URL.
    *   **Result:** You will have **Many Assistants** (one per tenant), but they all "call home" to your **Single Render App** (`/api/vapi`). Our backend handles the traffic and routes it to the correct tenant's calendar/logs.

---

## Troubleshooting
*   **"Config Error: Missing VAPI Public Key"?** You forgot to add `NEXT_PUBLIC_VAPI_PUBLIC_KEY` to Render's Environment Variables.
*   **Database Connection Error?** ensure your Web Service and Database are in the same region.
*   **Build Failed (Prisma)?** ensure you are using the build command with `--include=dev` to force installation of the pinned Prisma CLI.
