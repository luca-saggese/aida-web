import type { Response } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { systemOneRequestSchema } from '../services/validation.js';
import type { SystemOneRequest } from '../types/aida.js';
import { respondWithMock } from '../services/mockProvider.js';
import { callGoTraxxProvider } from '../services/aidaProvider.js';
import { isMockMode } from '../config/env.js';
import { recordRun } from '../services/telemetry.js';
import { computeSpendUsd } from '../services/pricing.js';
import { unauthorized } from '../utils/errors.js';

export async function evaluate(req: AuthedRequest, res: Response): Promise<void> {
  if (!req.organization) throw unauthorized('No organization found for user');

  const parsed = systemOneRequestSchema.parse(req.body);
  const body: SystemOneRequest = {
    state: parsed.state ?? {},
    model: parsed.model,
    questions: parsed.questions,
  };

  const startedAt = Date.now();

  let provider;
  if (isMockMode()) {
    provider = { response: respondWithMock(body), statusCode: 200, providerMs: Math.max(5, Math.round(Math.random() * 60)) };
  } else {
    provider = await callGoTraxxProvider(body);
  }

  const roundTripMs = Date.now() - startedAt;
  const providerMs = provider.providerMs;
  const overheadMs = Math.max(0, roundTripMs - (providerMs ?? 0));

  const response = provider.response;
  const inputTokens = response.usage?.input_tokens ?? 0;
  const outputTokens = response.usage?.output_tokens ?? 0;
  const spendUsd = computeSpendUsd(inputTokens, outputTokens);

  await recordRun({
    organizationId: req.organization._id,
    userId: req.user._id,
    trafficSource: 'playground',
    requestedModel: body.model,
    resolvedModel: response.model ?? null,
    inputTokens,
    outputTokens,
    spendUsd,
    latencyMs: roundTripMs,
    success: true,
    statusCode: 200,
  });

  res.json({
    provider: response,
    meta: {
      requestedModel: body.model,
      roundTripMs,
      providerMs,
      overheadMs,
      runAt: new Date().toISOString(),
      spendUsd,
    },
  });
}