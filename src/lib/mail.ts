import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASSWORD, // Your Gmail App Password
  },
  // Add a small timeout so it doesn't hang forever if network is blocked
  connectionTimeout: 10000,
});

export const EMAIL_FROM = process.env.EMAIL_USER || 'noreply@crossconnect.ai';
