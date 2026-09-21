import type { Types } from 'mongoose';
import { randomBytes } from 'node:crypto';
import { UserModel, hashPassword, verifyPassword, MembershipModel, OrganizationModel } from '../models/index.js';
import { env } from '../config/env.js';
import { hashToken } from '../utils/tokens.js';
import {
  signSessionToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
} from '../utils/jwt.js';
import { conflict, emailNotVerified, invalidCredentials, notFound, invalidRequest } from '../utils/errors.js';
import { buildPasswordResetEmail, sendMail, mailConfigured } from '../utils/mailer.js';

const DELTA = 24 * 60 * 60 * 1000;

export async function registerUser(input: { name: string; email: string; password: string }) {
  const existing = await UserModel.findOne({ email: input.email.toLowerCase() });
  if (existing) throw conflict('An account with this email already exists');

  const user = await UserModel.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: await hashPassword(input.password),
    emailVerified: false,
    emailVerificationTokenHash: null,
  });

  return user;
}

export function makeEmailVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Persist a hashed verification token with expiry, returning the raw token to
 * deliver to the user (or return in the API in dev when SMTP is unset).
 */
export async function setEmailVerificationToken(userId: string): Promise<string> {
  const raw = makeEmailVerificationToken();
  await UserModel.updateOne(
    { _id: userId },
    {
      emailVerificationTokenHash: hashToken(raw),
      emailVerificationExpiresAt: new Date(Date.now() + DELTA),
    },
  );
  return raw;
}

export async function verifyEmail(rawToken: string): Promise<void> {
  const hash = hashToken(rawToken);
  const user = await UserModel.findOne({ emailVerificationTokenHash: hash });
  if (!user) throw invalidRequest('Invalid or expired verification token');

  if (user.emailVerified) return; // idempotent

  user.emailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpiresAt = null;
  await user.save();
}

export async function login(input: { email: string; password: string }) {
  const user = await UserModel.findOne({ email: input.email.toLowerCase() });
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw invalidCredentials();
  }
  if (env.REQUIRE_EMAIL_CONFIRMATION && !user.emailVerified) {
    throw emailNotVerified();
  }
  const organization = await primaryOrganization(user._id);
  return { user, organization };
}

export async function primaryOrganization(userId: Types.ObjectId) {
  const membership = await MembershipModel.findOne({ userId }).populate('organizationId');
  const org = membership?.organizationId as unknown as { _id: Types.ObjectId; name: string } | null;
  return org;
}

export async function ensureOrganization(name: string) {
  let org = await OrganizationModel.findOne({ name });
  if (!org) org = await OrganizationModel.create({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
  return org;
}

export async function ensureOwnerMembership(org: { _id: Types.ObjectId }, user: { _id: Types.ObjectId }) {
  const existing = await MembershipModel.findOne({ organizationId: org._id, userId: user._id });
  if (existing) return existing;
  return MembershipModel.create({ organizationId: org._id, userId: user._id, role: 'owner' });
}

export function issueTokens(user: { _id: Types.ObjectId; email: string; name: string }, organization?: { _id: Types.ObjectId; name: string } | null) {
  return signSessionToken({ user, organization });
}

export async function requestPasswordReset(email: string): Promise<{ token: string; delivered: boolean; exists: boolean }> {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  // Always return success-ish to avoid account enumeration, but in dev we only
  // have something to send for an existing account.
  if (!user) return { token: randomBytes(16).toString('hex'), delivered: false, exists: false };

  const token = signPasswordResetToken(user._id.toString());
  if (mailConfigured()) {
    await sendMail(buildPasswordResetEmail(user.email, token, env.CLIENT_URL));
    return { token, delivered: true, exists: true };
  }
  // Dev without SMTP: return token in response (never in production).
  if (env.NODE_ENV === 'production') return { token, delivered: false, exists: true };
  return { token, delivered: false, exists: true };
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  let payload: { kind: string; uid: string };
  try {
    payload = verifyPasswordResetToken(rawToken);
  } catch {
    throw invalidRequest('Invalid or expired reset token');
  }
  if (payload.kind !== 'password-reset') throw invalidRequest('Invalid reset token');

  const user = await UserModel.findById(payload.uid);
  if (!user) throw notFound('User not found');

  user.passwordHash = await hashPassword(newPassword);
  // Invalidate reset token.
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  await user.save();
}

export { mailConfigured };