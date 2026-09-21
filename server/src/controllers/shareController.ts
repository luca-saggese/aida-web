import type { Response } from 'express';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import type { AuthedRequest } from '../middleware/auth.js';
import { ShareModel } from '../models/index.js';
import { notFound } from '../utils/errors.js';

const createShareSchema = z.object({
  state: z.unknown().optional(),
  questions: z.unknown().optional(),
  selectedModels: z.array(z.string()).optional().default(['aida-latest']),
  layout: z.string().optional().default('default'),
});

export async function createShare(req: AuthedRequest, res: Response): Promise<void> {
  const data = createShareSchema.parse(req.body);
  const shareId = randomBytes(6).toString('base64url');
  const doc = await ShareModel.create({
    shareId,
    state: data.state ?? null,
    questions: data.questions ?? null,
    selectedModels: data.selectedModels,
    layout: data.layout,
    createdBy: req.user?._id ?? null,
  });
  res.status(201).json({ id: doc._id, shareId: doc.shareId, url: `/playground?share=${doc.shareId}` });
}

export async function getShare(req: AuthedRequest, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const doc = await ShareModel.findOne({ shareId: id });
  if (!doc) throw notFound('Share not found');
  if (doc.expiresAt && doc.expiresAt < new Date()) throw notFound('Share has expired');

  res.json({
    share: {
      shareId: doc.shareId,
      state: doc.state,
      questions: doc.questions,
      selectedModels: doc.selectedModels,
      layout: doc.layout,
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt,
    },
  });
}
