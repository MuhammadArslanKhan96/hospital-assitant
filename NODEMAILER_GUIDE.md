# Setting up Automated Emails with Nodemailer (100% Free)

To enable the automated, beautifully branded emails for new tenant registration, appointment bookings, and appointment reminders, we have integrated **Nodemailer**.

Because you want a 100% free solution without dealing with domain verification right now, the best method is to use a standard Gmail account (e.g., `yourcompany@gmail.com`) via **Google App Passwords**.

## Step 1: Prepare a Gmail Account
1. You can use your personal Gmail, but it is highly recommended to create a dedicated free Gmail account for your system (e.g., `crossconnect.system@gmail.com`).
2. Log into this Google account.

## Step 2: Enable 2-Step Verification (Required)
Google requires 2-Step Verification to be turned on before they let you generate an "App Password".
1. Go to your Google Account management page: [https://myaccount.google.com/](https://myaccount.google.com/)
2. Click on **Security** on the left sidebar.
3. Scroll down to "How you sign in to Google" and click **2-Step Verification**.
4. Follow the prompts to turn it on (you will need a phone number).

## Step 3: Generate an App Password
An App Password is a secure, 16-character passcode that gives your Cross Connect codebase permission to send emails from this Gmail account without needing your actual login password.

1. Once 2-Step Verification is on, go back to the **Security** page.
2. In the search bar at the top of the Google Account page, search for **"App passwords"** and select it.
3. Under "Select app", choose **Other (Custom name)**.
4. Type in "Cross Connect Dashboard" and click **Generate**.
5. A yellow box will appear with a 16-letter password (e.g., `abcd efgh ijkl mnop`). **Copy this password. You will only see it once.**

## Step 4: Add to Render Environment Variables
Now you just give these credentials to your Render server.

1. Go to your Render Dashboard.
2. Go to your Web Service -> **Environment**.
3. Add the following keys:

```env
# The Gmail address you just set up
EMAIL_USER="crossconnect.system@gmail.com"

# The 16-character App Password (NO SPACES)
EMAIL_PASSWORD="abcdefghijklmnop"

# A secret password you invent right now to protect your cron job from hackers
CRON_SECRET="your-super-secret-password-123"
```
4. Save and redeploy. Your web app will now instantly send Welcome Emails to new tenants and Booking Confirmation emails.

---

## Step 5: Setting up Automated Reminders (Render Cron)
The codebase now has a hidden endpoint at `https://<YOUR_RENDER_URL>/api/cron/reminders`. If hit, it checks the database and sends the 24-hour, 1-hour, and "Now" appointment reminders. You need to tell Render to hit this URL every hour.

1. In your Render Dashboard, click **New +** in the top right.
2. Select **Cron Job**.
3. Connect it to your existing GitHub repo just like your web service.
4. Name: `Cross Connect Reminders`
5. Environment: `Node`
6. Build Command: `npm install`
7. Schedule: `0 * * * *`  *(This cron expression means "run at minute 0 past every hour")*
8. **CRITICAL STEP - The Run Command:** We want this cron job to simply ping your main web server. Set the run command to:
   ```bash
   curl -H "Authorization: Bearer your-super-secret-password-123" https://<YOUR_RENDER_URL>/api/cron/reminders
   ```
   *(Make sure to replace `<YOUR_RENDER_URL>` with your actual live URL, and match the `CRON_SECRET` you set in Step 4).*

You are now fully set up with a 100% free, automated, beautifully branded email infrastructure!