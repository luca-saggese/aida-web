import type { Request, Response, NextFunction } from 'express';
import { verifySessionToken } from '../utils/jwt.js';
import { unauthorized } from '../utils/errors.js';
import { UserModel, MembershipModel } from '../models/index.js';
import type { Types } from 'mongoose';

export interface AuthedRequest extends Request {
  user: {
    _id: Types.ObjectId;
    email: string;
    name: string;
  };
  organization?: {
    _id: Types.ObjectId;
    name: string;
    role: string;
  } | null;
}

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme && scheme.toLowerCase() === 'bearer' && token) return token;
  return null;
}

/**
 * Authenticates based on a JWT session token. Loads the user and their primary
 * organization membership so routes have both available.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> | void {
  const authed = req as AuthedRequest;
  return (async () => {
    try {
      const token = extractBearer(req);
      if (!token) throw unauthorized();

      let payload: ReturnType<typeof verifySessionToken>;
      try {
        payload = verifySessionToken(token);
      } catch {
        throw unauthorized('Session expired or invalid');
      }

      const user = await UserModel.findById(payload.sub);
      if (!user) throw unauthorized('User no longer exists');

      authed.user = { _id: user._id, email: user.email, name: user.name };

      // Primary organization = first membership (development has one org).
      const membership = await MembershipModel.findOne({ userId: user._id }).sort({ createdAt: 1 }).populate('organizationId');
      if (membership) {
        const org = membership.organizationId as unknown as { _id: Types.ObjectId; name: string } | null;
        if (org) {
          authed.organization = { _id: org._id, name: org.name, role: membership.role };
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  })();
}