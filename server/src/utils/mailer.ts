import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

/**
 * Transactional mail. In development without SMTP configured we don't send real
 * mail: callers should surface the token via the API response instead. We keep a
 * shared transporter for the configured-SMTP path.
 */

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export function mailConfigured(): boolean {
  return Boolean(env.SMTP_HOST);
}

export interface MailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendMail(input: MailInput): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;
  await t.sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
  return true;
}

export function buildVerificationEmail(to: string, token: string, clientUrl: string): MailInput {
  const link = `${clientUrl}/confirm-email?token=${token}`;
  return {
    to,
    subject: 'Confirm your email address',
    text: `Please confirm your email by visiting: ${link}`,
    html: `<p>Welcome! Confirm your email to finish registration:</p><p><a href="${link}">${link}</a></p>`,
  };
}

export function buildPasswordResetEmail(to: string, token: string, clientUrl: string): MailInput {
  const link = `${clientUrl}/reset-password?token=${token}`;
  return {
    to,
    subject: 'Reset your password',
    text: `Reset your password by visiting: ${link}`,
    html: `<p>You requested a password reset. Visit: <a href="${link}">${link}</a></p><p>If you didn't request this, ignore this email.</p>`,
  };
}