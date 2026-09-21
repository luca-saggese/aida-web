import type { Response } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth.js';
import { createApiKey, listApiKeys, revokeApiKey } from '../services/apiKeyService.js';
import { unauthorized } from '../utils/errors.js';

const createSchema = z.object({ name: z.string().min(1).max(100) });

export async function list(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.organization) throw unauthorized();
  const keys = await listApiKeys(req.organization._id);
  res.json({
    keys: keys.map((k) => ({
      id: k._id,
      name: k.name,
      prefix: k.prefix,
      last4: k.last4,
      status: k.status,
      createdBy: k.createdBy,
      createdAt: k.createdAt,
      revokedAt: k.revokedAt,
      lastUsedAt: k.lastUsedAt,
    })),
  });
}

export async function create(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.organization) throw unauthorized();
  const { name } = createSchema.parse(req.body);
  const key = await createApiKey({
    organizationId: req.organization._id,
    name,
    createdBy: req.user._id,
  });
  res.status(201).json(key);
}

export async function revoke(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.organization) throw unauthorized();
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const doc = await revokeApiKey(id, req.organization._id);
  res.json({ id: doc._id, status: doc.status, revokedAt: doc.revokedAt });
}

export async function remove(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.organization) throw unauthorized();
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const { ApiKeyModel } = await import('../models/index.js');
  await ApiKeyModel.deleteOne({ _id: id, organizationId: req.organization._id });
  res.status(204).end();
}