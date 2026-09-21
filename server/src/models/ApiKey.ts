import { Schema, model, type InferSchemaType } from 'mongoose';

export type ApiKeyStatus = 'active' | 'revoked';

const apiKeySchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },

    prefix: { type: String, required: true },
    last4: { type: String, required: true },
    keyHash: { type: String, required: true },

    status: { type: String, enum: ['active', 'revoked'], default: 'active' },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    revokedAt: { type: Date, default: null },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

apiKeySchema.index({ organizationId: 1, status: 1 });
apiKeySchema.index({ keyHash: 1 });

export type ApiKey = InferSchemaType<typeof apiKeySchema> & { _id: import('mongoose').Types.ObjectId };
export const ApiKeyModel = model('ApiKey', apiKeySchema);