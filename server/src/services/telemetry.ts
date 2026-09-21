import { AidaRunModel } from '../models/index.js';
import type { Types } from 'mongoose';

export interface RecordRunInput {
  organizationId: Types.ObjectId;
  userId?: Types.ObjectId | null;
  trafficSource: 'playground' | 'api';
  requestedModel: string;
  resolvedModel: string | null;
  inputTokens: number;
  outputTokens: number;
  spendUsd: number | null;
  latencyMs: number;
  success: boolean;
  statusCode: number;
}

export async function recordRun(input: RecordRunInput): Promise<void> {
  await AidaRunModel.create({
    organizationId: input.organizationId,
    userId: input.userId ?? null,
    trafficSource: input.trafficSource,
    requestedModel: input.requestedModel,
    resolvedModel: input.resolvedModel,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    spendUsd: input.spendUsd,
    latencyMs: input.latencyMs,
    success: input.success,
    statusCode: input.statusCode,
  });
}