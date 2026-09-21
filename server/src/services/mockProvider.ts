import { createHash } from 'node:crypto';
import type { SystemOneRequest, SystemOneResponse, Question } from '../types/aida.js';

/**
 * Deterministic mock provider. Given the same input it always produces the same
 * output, which keeps screenshot tests reproducible. We seed a tiny PRNG from a
 * hash of the request payload.
 */

function seededRandom(seedText: string): () => number {
  const seed = createHash('sha256').update(seedText).digest();
  let a = 0;
  // Convert first 8 bytes into a 32-bit state.
  for (let i = 0; i < 4; i++) {
    a = (a * 256 + seed[i]) | 0;
  }
  if (a === 0) a = 1;
  return () => {
    a = (a * 1664525 + 1013904223) | 0;
    return (a >>> 0) / 4294967296;
  };
}

function hashString(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export function respondWithMock(request: SystemOneRequest): SystemOneResponse {
  const rand = seededRandom(JSON.stringify(request));
  const answers: SystemOneResponse['answers'] = {};

  for (const [key, q] of Object.entries(request.questions)) {
    const { type } = q as Question;

    if (type === 'noul') {
      // Bias a stable value from the question key/id.
      const bias = (parseInt(hashString(key).slice(0, 6), 16) % 1000) / 1000;
      const jitter = (rand() - 0.5) * 0.12;
      const p = Math.min(0.98, Math.max(0.02, bias + jitter));
      answers[key] = { type: 'noul', noul: Number(p.toFixed(2)) };
    } else if (type === 'choice') {
      const qq = q as Extract<Question, { type: 'choice' }>;
      const options = Object.keys(qq.criteria);
      const probs: Record<string, number> = {};
      let total = 0;
      options.forEach((opt, idx) => {
        const raw = 0.15 + rand() * 0.7 + (idx * 0.03);
        probs[opt] = raw;
        total += raw;
      });
      for (const opt of options) probs[opt] = Number((probs[opt] / total).toFixed(4));
      // Normalize any rounding drift.
      const sum = Object.values(probs).reduce((s, v) => s + v, 0);
      const first = options[0];
      if (first) probs[first] = Number((probs[first] + (1 - sum)).toFixed(4));

      const choice = options.reduce((best, opt) => (probs[opt] > probs[best] ? opt : best));
      const confidence = Number((0.5 + rand() * 0.45).toFixed(2));
      answers[key] = { type: 'choice', choice, probabilities: probs, confidence };
    } else {
      const qq = q as Extract<Question, { type: 'score' }>;
      const n = qq.criteria.length;
      const probs: Record<string, number> = {};
      const target = Math.floor(rand() * n);
      for (let i = 0; i < n; i++) {
        const dist = Math.abs(i - target);
        probs[String(i)] = Number((Math.max(0, 0.8 - dist * 0.35 + (rand() - 0.5) * 0.1)).toFixed(4));
      }
      const sum = Object.values(probs).reduce((s, v) => s + v, 0);
      probs['0'] = Number((probs['0'] + (1 - sum)).toFixed(4));

      let weighted = 0;
      for (let i = 0; i < n; i++) weighted += i * probs[String(i)];
      const score = Number(weighted.toFixed(2));

      const legend: Record<string, unknown> = {};
      qq.criteria.forEach((level, i) => (legend[String(i)] = level));

      const confidence = Number((0.4 + rand() * 0.4).toFixed(2));
      answers[key] = { type: 'score', score, legend, probabilities: probs, confidence };
    }
  }

  const inputTokens = estimateTokens(request.state) + estimateTokens(request.questions);
  const outputTokens = estimateOutputTokens(answers);

  return {
    model: 'aida-mock-1.13.0',
    answers,
    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
  };
}

function estimateTokens(value: unknown): number {
  return Math.max(1, Math.round(JSON.stringify(value ?? {}).length / 4));
}

function estimateOutputTokens(answers: Record<string, unknown>): number {
  return Math.max(1, Math.round(JSON.stringify(answers).length / 4));
}