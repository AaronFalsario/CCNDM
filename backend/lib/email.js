import nodemailer from 'nodemailer';
import { BrevoClient } from '@getbrevo/brevo';

function getBrevoClient() {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) return null;
  return new BrevoClient({ apiKey });
}

function getBrevoSenderEmail() {
  return process.env.BREVO_SENDER_EMAIL?.trim();
}

function getGmailUser() {
  return process.env.GMAIL_USER?.trim();
}

export function isEmailConfigured() {
  return Boolean(getBrevoClient() && getBrevoSenderEmail())
    || Boolean(getGmailUser() && process.env.GMAIL_APP_PASSWORD?.trim());
}

export async function sendEmail({ to, subject, html, text, fromName = 'CCNDM' }) {
  const normalizedTo = Array.isArray(to) ? to : [{ email: to }];
  const brevoClient = getBrevoClient();
  const brevoSenderEmail = getBrevoSenderEmail();

  if (brevoClient && brevoSenderEmail) {
    try {
      await brevoClient.transactionalEmails.sendTransacEmail({
        sender: {
          name: process.env.BREVO_SENDER_NAME?.trim() || fromName,
          email: brevoSenderEmail,
        },
        to: normalizedTo.map((recipient) => ({
          email: recipient.email,
          name: recipient.name || recipient.email,
        })),
        subject,
        htmlContent: html,
        textContent: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      });
      return { sent: true, provider: 'brevo' };
    } catch (error) {
      console.warn('[email] Brevo send failed, trying Gmail SMTP fallback:', error?.message || error);
    }
  }

  const gmailUser = getGmailUser();
  const gmailPassword = process.env.GMAIL_APP_PASSWORD?.trim();
  if (gmailUser && gmailPassword) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailPassword,
        },
      });

      await transporter.sendMail({
        from: `"${fromName}" <${gmailUser}>`,
        to: normalizedTo.map((recipient) => recipient.email),
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      });

      return { sent: true, provider: 'gmail' };
    } catch (error) {
      console.error('[email] Gmail SMTP send failed:', error?.message || error);
    }
  }

  return { sent: false, provider: 'none' };
}
