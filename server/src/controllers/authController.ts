import type { Response, Request } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth.js';
import {
  registerUser,
  setEmailVerificationToken,
  verifyEmail,
  login,
  issueTokens,
  ensureOrganization,
  ensureOwnerMembership,
  requestPasswordReset,
  resetPassword,
  mailConfigured,
} from '../services/authService.js';
import { checkPasswordStrength } from '../utils/passwordStrength.js';
import { invalidRequest } from '../utils/errors.js';
import { buildVerificationEmail, sendMail } from '../utils/mailer.js';
import { env } from '../config/env.js';

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  organization: z.string().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const verifySchema = z.object({ token: z.string().min(1) });
const resendVerifySchema = z.object({ email: z.string().email() });
const forgotSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({ token: z.string().min(1), password: z.string().min(8).max(128) });

async function deliverVerification(_id: string, send: { success: boolean; message: string; token?: string }) {
  const raw = await setEmailVerificationToken(_id);
  if (mailConfigured()) {
    await sendMail(buildVerificationEmail(_id, raw, env.CLIENT_URL));
    send.success = true;
    send.message = 'Verification email sent. Please check your inbox.';
  } else {
    send.success = true;
    send.message = 'SMTP not configured; verification token returned inline (dev).';
    send.token = raw;
  }
}

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const strength = checkPasswordStrength(data.password);
  if (!strength.ok) {
    throw invalidRequest('Password does not meet strength requirements', strength.feedback);
  }

  const user = await registerUser({
    name: data.name,
    email: data.email,
    password: data.password,
  });

  const orgName = data.organization || `${data.name.split(' ')[0]}'s org`;
  const org = await ensureOrganization(orgName);
  await ensureOwnerMembership(org, user);

  const orgForToken = { _id: org._id, name: org.name };
  const token = user.emailVerified ? issueTokens(user, orgForToken) : null;

  const send: { success: boolean; message: string; token?: string } = {
    success: false,
    message: '',
  };
  await deliverVerification(user._id.toString(), send);

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, emailVerified: user.emailVerified },
    organization: { id: org._id, name: org.name },
    requiresEmailConfirmation: env.REQUIRE_EMAIL_CONFIRMATION,
    token,
    verification: send,
  });
}

export async function verifyEmailConfirm(req: Request, res: Response) {
  const { token } = verifySchema.parse(req.body);
  await verifyEmail(token);
  res.json({ success: true, message: 'Email verified successfully' });
}

export async function resendVerification(req: Request, res: Response) {
  const { email } = resendVerifySchema.parse(req.body);
  const { UserModel } = await import('../models/index.js');
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user || user.emailVerified) {
    return res.json({ success: true, message: 'If the account exists and is not verified, an email was sent.' });
  }
  const send: { success: boolean; message: string; token?: string } = { success: false, message: '' };
  await deliverVerification(user._id.toString(), send);
  res.json({ success: true, message: send.message, token: send.token });
}

export async function loginAction(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const { user, organization } = await login(data);
  const token = issueTokens(user, organization);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, emailVerified: user.emailVerified },
    organization: organization ? { id: organization._id, name: organization.name } : null,
  });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = forgotSchema.parse(req.body);
  const result = await requestPasswordReset(email);
  if (result.exists && !result.delivered && env.NODE_ENV !== 'production') {
    return res.json({ success: true, message: 'Reset token generated (dev, SMTP unset).', token: result.token });
  }
  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
}

export async function resetPasswordAction(req: Request, res: Response) {
  const { token, password } = resetSchema.parse(req.body);
  const strength = checkPasswordStrength(password);
  if (!strength.ok) {
    throw invalidRequest('Password does not meet strength requirements', strength.feedback);
  }
  await resetPassword(token, password);
  res.json({ success: true, message: 'Password updated. You can now sign in.' });
}

export async function me(req: AuthedRequest, res: Response) {
  const org = req.organization ?? null;
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
    organization: org ? { id: org._id, name: org.name } : null,
  });
}