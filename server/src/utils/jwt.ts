import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { Types } from 'mongoose';

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  orgId?: string;
  orgName?: string;
}

export interface TokenIssuerInput {
  user: { _id: Types.ObjectId; email: string; name: string };
  organization?: { _id: Types.ObjectId; name: string } | null;
}

export function signSessionToken(input: TokenIssuerInput): string {
  const payload: SessionPayload = {
    sub: input.user._id.toString(),
    email: input.user.email,
    name: input.user.name,
    orgId: input.organization?._id.toString(),
    orgName: input.organization?.name,
  };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function verifySessionToken(token: string): SessionPayload {
  return jwt.verify(token, env.JWT_SECRET) as SessionPayload;
}

export function signEmailVerifyToken(userId: string): string {
  return jwt.sign({ kind: 'email-verify', uid: userId }, env.JWT_SECRET, {
    expiresIn: env.EMAIL_VERIFY_TOKEN_EXPIRES as jwt.SignOptions['expiresIn'],
  });
}

export function verifyEmailVerifyToken(token: string): { kind: string; uid: string } {
  return jwt.verify(token, env.JWT_SECRET) as { kind: string; uid: string };
}

export function signPasswordResetToken(userId: string): string {
  return jwt.sign({ kind: 'password-reset', uid: userId }, env.JWT_SECRET, {
    expiresIn: env.PASSWORD_RESET_TOKEN_EXPIRES as jwt.SignOptions['expiresIn'],
  });
}

export function verifyPasswordResetToken(token: string): { kind: string; uid: string } {
  return jwt.verify(token, env.JWT_SECRET) as { kind: string; uid: string };
}