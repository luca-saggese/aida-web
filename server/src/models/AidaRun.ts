import { Schema, model, type InferSchemaType } from 'mongoose';

export type TrafficSource = 'playground' | 'api';

const aidaRunSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    trafficSource: { type: String, enum: ['playground', 'api'], required: true },

    requestedModel: { type: String, required: true },
    resolvedModel: { type: String, default: null },

    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },

    spendUsd: { type: Number, default: null },

    latencyMs: { type: Number, default: 0 },

    success: { type: Boolean, default: true },
    statusCode: { type: Number, default: 200 },
  },
  { timestamps: true },
);

aidaRunSchema.index({ organizationId: 1, createdAt: 1 });
aidaRunSchema.index({ createdAt: 1 });

export type AidaRun = InferSchemaType<typeof aidaRunSchema> & { _id: import('mongoose').Types.ObjectId };
export const AidaRunModel = model('AidaRun', aidaRunSchema);
