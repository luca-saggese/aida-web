import crypto from 'node:crypto';
import { env } from '../config/env.js';
import type { SystemOneRequest, SystemOneResponse } from '../types/aida.js';
import { invalidRequest } from '../utils/errors.js';

export interface ProviderResult {
  response: SystemOneResponse;
  statusCode: number;
  providerMs?: number;
}

type ModelsResponse = {
  data?: Array<{ id?: unknown }>;
  models?: unknown;
};

export async function listInferenceModels(): Promise<string[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.INFERENCE_API_TIMEOUT_MS);

  try {
    const res = await fetch(env.INFERENCE_API_MODELS_URL, {
      headers: {
        ...(env.INFERENCE_API_KEY
          ? { Authorization: `Bearer ${env.INFERENCE_API_KEY}` }
          : {}),
      },
      signal: controller.signal,
    });

    const body = (await res.json().catch(() => null)) as ModelsResponse | null;
    const models = body?.data?.flatMap((item) => typeof item.id === 'string' ? [item.id] : [])
      ?? (Array.isArray(body?.models)
        ? body.models.filter((model): model is string => typeof model === 'string')
        : []);

    if (!res.ok || models.length === 0) {
      throw invalidRequest(`Inference models endpoint returned ${res.status}`);
    }

    return models;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Inference models endpoint')) throw err;
    const message = err instanceof Error && err.name === 'AbortError'
      ? `request timed out after ${env.INFERENCE_API_TIMEOUT_MS}ms`
      : err instanceof Error ? err.message : 'Unknown network error';
    throw invalidRequest(`Unable to fetch inference models: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}

/** Proxies an Aida request to the external inference server server-side. */
export async function callGoTraxxProvider(request: SystemOneRequest): Promise<ProviderResult> {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const questionCount = Object.keys(request.questions).length;
  // Do not log request contents or credentials: state/questions may contain user data.
  // eslint-disable-next-line no-console
  console.info('[inference] request', {
    requestId,
    url: env.INFERENCE_API_URL,
    model: request.model,
    questionCount,
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.INFERENCE_API_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(env.INFERENCE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.INFERENCE_API_KEY
          ? { Authorization: `Bearer ${env.INFERENCE_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        state: request.state,
        model: request.model,
        questions: request.questions,
      }),
      signal: controller.signal,
    });
    console.debug('[inference] request sent', {
      requestId,
      model: request.model,
      questionCount,
    });
  } catch (err) {
    const message = err instanceof Error && err.name === 'AbortError'
      ? `request timed out after ${env.INFERENCE_API_TIMEOUT_MS}ms`
      : err instanceof Error
        ? err.message
        : 'Unknown network error';
    // eslint-disable-next-line no-console
    console.error('[inference] request failed', {
      requestId,
      model: request.model,
      durationMs: Date.now() - startedAt,
      error: message,
    });
    throw invalidRequest(`Unable to reach inference server: ${message}`);
  } finally {
    clearTimeout(timeout);
  }

  const providerMs = Date.now() - startedAt;
  const body = (await res.json().catch(() => null)) as SystemOneResponse | null;
console.log('Inference server response body:', JSON.stringify(body,null,4));
  if (!res.ok || !body) {
    const details = body ? [{ status: res.status }] : [];
    // eslint-disable-next-line no-console
    console.error('[inference] response failed', {
      requestId,
      model: request.model,
      status: res.status,
      durationMs: providerMs,
      responseBody: body ? 'json' : 'invalid-or-empty-json',
    }, body);
    throw invalidRequest(`Inference server returned ${res.status}`, details);
  }

  // eslint-disable-next-line no-console
  console.info('[inference] response ok', {
    requestId,
    model: request.model,
    resolvedModel: body.model,
    status: res.status,
    durationMs: providerMs,
    answerCount: Object.keys(body.answers ?? {}).length,
    usage: body.usage,
  });

  return { response: body, statusCode: res.status, providerMs };
}
