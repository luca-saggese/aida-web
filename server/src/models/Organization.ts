import { Schema, model, type InferSchemaType } from 'mongoose';

const organizationSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export type Organization = InferSchemaType<typeof organizationSchema>;
export const OrganizationModel = model('Organization', organizationSchema);