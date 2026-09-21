import { env } from '../config/env.js';
import type { SystemOneRequest, SystemOneResponse } from '../types/aida.js';
import { invalidRequest } from '../utils/errors.js';

export interface ProviderResult {
  response: SystemOneResponse;
  statusCode: number;
  providerMs?: number;
}

/**
 * Proxies a SystemOne request to the official GoTraxx API. The provider key is
 * always resolved server-side and is never exposed to the browser.
 */
export async function callGoTraxxProvider(request: SystemOneRequest): Promise<ProviderResult> {
  if (!env.GOTRAXX_API_KEY) {
    throw invalidRequest('GoTraxx provider key is not configured');
  }

  const startedAt = Date.now();
  const url = `${env.GOTRAXX_API_BASE_URL.replace(/\/$/, '')}/v1/systemone`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GOTRAXX_API_KEY}`,
      },
      body: JSON.stringify({
        state: request.state,
        model: request.model,
        questions: request.questions,
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown network error';
    throw invalidRequest(`Unable to reach GoTraxx: ${message}`);
  }

  const providerMs = Date.now() - startedAt;
  const body = (await res.json().catch(() => null)) as SystemOneResponse | null;

  if (!res.ok || !body) {
    const details = body ? [{ status: res.status }] : [];
    throw invalidRequest(`GoTraxx provider returned ${res.status}`, details);
  }

  return { response: body, statusCode: res.status, providerMs };
}
