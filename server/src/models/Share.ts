import { Schema, model, type InferSchemaType } from 'mongoose';

const shareSchema = new Schema(
  {
    shareId: { type: String, required: true, unique: true },
    state: { type: Schema.Types.Mixed, default: null },
    questions: { type: Schema.Types.Mixed, default: null },
    selectedModels: { type: [String], default: [] },
    layout: { type: String, default: 'default' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

shareSchema.index({ shareId: 1 }, { unique: true });

export type Share = InferSchemaType<typeof shareSchema> & { _id: import('mongoose').Types.ObjectId };
export const ShareModel = model('Share', shareSchema);