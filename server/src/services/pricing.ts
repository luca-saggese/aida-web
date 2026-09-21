import { env } from '../config/env.js';

/**
 * Local estimate for Aida usage. Not official GoTraxx billing; a configurable
 * approximation (default Aida 1.13 input $0.042/Mtok, output free).
 */
export function computeSpendUsd(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * env.AIDA_INPUT_USD_PER_MILLION;
  const outputCost = (outputTokens / 1_000_000) * env.AIDA_OUTPUT_USD_PER_MILLION;
  return Number((inputCost + outputCost).toFixed(8));
}