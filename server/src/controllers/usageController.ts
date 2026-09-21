import type { Response } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth.js';
import { AidaRunModel } from '../models/index.js';
import { unauthorized } from '../utils/errors.js';

const usageQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  granularity: z.enum(['day', 'week', 'month']).default('day'),
  trafficSource: z.enum(['all', 'playground', 'api']).optional().default('all'),
  model: z.string().optional(),
});

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(d: Date, granularity: 'day' | 'week' | 'month'): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (granularity === 'month') return `${y}-${m}`;
  return `${y}-${m}-${day}`;
}

export async function getUsage(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.organization) throw unauthorized();

  const q = usageQuerySchema.parse(req.query);

  const now = new Date();
  let from: Date;
  let to: Date;

  if (q.from) {
    from = new Date(q.from);
  } else {
    from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  to = q.to ? new Date(q.to) : now;

  const filter: Record<string, unknown> = {
    organizationId: req.organization._id,
    createdAt: { $gte: from, $lte: to },
  };
  if (q.trafficSource !== 'all') filter.trafficSource = q.trafficSource;
  if (q.model) filter.requestedModel = q.model;

  const docs = await AidaRunModel.find(filter).lean();

  const buckets = new Map<string, { inputTokens: number; outputTokens: number; requests: number; spendUsd: number }>();

  const keyFor = (date: Date): string => {
    if (q.granularity === 'day') return formatDate(date, 'day');
    if (q.granularity === 'week') return formatDate(startOfWeek(date), 'day');
    return formatDate(date, 'month');
  };

  for (const doc of docs) {
    const key = keyFor(new Date(doc.createdAt));
    const cur = buckets.get(key) ?? { inputTokens: 0, outputTokens: 0, requests: 0, spendUsd: 0 };
    cur.inputTokens += doc.inputTokens ?? 0;
    cur.outputTokens += doc.outputTokens ?? 0;
    cur.requests += 1;
    cur.spendUsd += doc.spendUsd ?? 0;
    buckets.set(key, cur);
  }

  const series = [...buckets.entries()]
    .map(([date, v]) => ({ date, ...v, spendUsd: Number(v.spendUsd.toFixed(6)) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totals = docs.reduce(
    (acc, doc) => {
      acc.tokens += (doc.inputTokens ?? 0) + (doc.outputTokens ?? 0);
      acc.requests += 1;
      acc.spendUsd += doc.spendUsd ?? 0;
      return acc;
    },
    { tokens: 0, requests: 0, spendUsd: 0 },
  );

  res.json({
    totals: {
      tokens: totals.tokens,
      inputTokens: docs.reduce((s, d) => s + (d.inputTokens ?? 0), 0),
      outputTokens: docs.reduce((s, d) => s + (d.outputTokens ?? 0), 0),
      requests: totals.requests,
      spendUsd: Number(totals.spendUsd.toFixed(6)),
    },
    series,
  });
}