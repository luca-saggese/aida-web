import type { Request, Response } from 'express';
import { systemOneRequestSchema } from '../services/validation.js';
import type { SystemOneRequest } from '../types/aida.js';
import { respondWithMock } from '../services/mockProvider.js';
import { callGoTraxxProvider } from '../services/aidaProvider.js';
import { isMockMode } from '../config/env.js';
import { findActiveKeyBySecret } from '../services/apiKeyService.js';
import { recordRun } from '../services/telemetry.js';
import { computeSpendUsd } from '../services/pricing.js';
import { unauthorized } from '../utils/errors.js';
import { ApiKeyModel } from '../models/index.js';

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme && scheme.toLowerCase() === 'bearer' && token) return token;
  return null;
}

/**
 * Public Aida-compatible endpoint authenticated with a *clone* API key
 * (apikey_...). This is the route external consumers would use.
 */
export async function systemOne(req: Request, res: Response): Promise<void> {
  const secret = extractBearer(req);
  if (!secret || !secret.startsWith('apikey_')) {
    throw unauthorized('A valid Bearer API key is required');
  }

  const key = await findActiveKeyBySecret(secret);
  if (!key) throw unauthorized('Invalid or revoked API key');

  // Update lastUsedAt (fire and forget).
  ApiKeyModel.updateOne({ _id: key._id }, { lastUsedAt: new Date() }).exec().catch(() => undefined);

  const parsed = systemOneRequestSchema.parse(req.body);
  const body: SystemOneRequest = {
    state: parsed.state ?? {},
    model: parsed.model,
    questions: parsed.questions,
  };

  const startedAt = Date.now();

  let provider;
  if (isMockMode()) {
    provider = { response: respondWithMock(body), statusCode: 200, providerMs: undefined };
  } else {
    provider = await callGoTraxxProvider(body);
  }

  const roundTripMs = Date.now() - startedAt;
  const response = provider.response;
  const inputTokens = response.usage?.input_tokens ?? 0;
  const outputTokens = response.usage?.output_tokens ?? 0;
  const spendUsd = computeSpendUsd(inputTokens, outputTokens);

  await recordRun({
    organizationId: key.organizationId,
    userId: null,
    trafficSource: 'api',
    requestedModel: body.model,
    resolvedModel: response.model ?? null,
    inputTokens,
    outputTokens,
    spendUsd,
    latencyMs: roundTripMs,
    success: true,
    statusCode: 200,
  });

  res.status(200).json(response);
}