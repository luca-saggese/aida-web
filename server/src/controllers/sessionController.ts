import type { Response } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';

export async function getSession(req: AuthedRequest, res: Response): Promise<void> {
  res.json({
    session: {
      user: { id: req.user._id, name: req.user.name, email: req.user.email },
      organization: req.organization ? { id: req.organization._id, name: req.organization.name } : null,
    },
  });
}