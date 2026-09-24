import { env } from '../config/env.js';
import type { SystemOneRequest, SystemOneResponse } from '../types/aida.js';
import { invalidRequest } from '../utils/errors.js';

export interface ProviderResult {
  response: SystemOneResponse;
  statusCode: number;
  providerMs?: number;
}

/** Proxies an Aida request to the external inference server server-side. */
export async function callGoTraxxProvider(request: SystemOneRequest): Promise<ProviderResult> {
  const startedAt = Date.now();
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
  } catch (err) {
    const message = err instanceof Error && err.name === 'AbortError'
      ? `request timed out after ${env.INFERENCE_API_TIMEOUT_MS}ms`
      : err instanceof Error
        ? err.message
        : 'Unknown network error';
    throw invalidRequest(`Unable to reach inference server: ${message}`);
  } finally {
    clearTimeout(timeout);
  }

  const providerMs = Date.now() - startedAt;
  const body = (await res.json().catch(() => null)) as SystemOneResponse | null;
console.log('Inference server response body:', JSON.stringify(body,null,4));
  if (!res.ok || !body) {
    const details = body ? [{ status: res.status }] : [];
    throw invalidRequest(`Inference server returned ${res.status}`, details);
  }

  return { response: body, statusCode: res.status, providerMs };
}
