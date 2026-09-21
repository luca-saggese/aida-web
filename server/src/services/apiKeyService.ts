import { ApiKeyModel } from '../models/index.js';
import { env } from '../config/env.js';
import { hmacKey, randomBytesHex } from '../utils/tokens.js';
import { notFound } from '../utils/errors.js';
import type { Types } from 'mongoose';

export interface CreatedApiKey {
  id: string;
  name: string;
  secret: string;
}

/**
 * Creates a new API key. The full secret is returned exactly once and can never
 * be retrieved again; only a hash, prefix and last4 are stored.
 */
export async function createApiKey(input: {
  organizationId: Types.ObjectId;
  name: string;
  createdBy: Types.ObjectId;
}): Promise<CreatedApiKey> {
  const secret = `apikey_${randomBytesHex(32)}`;
  const last4 = secret.slice(-4);
  const prefix = secret.slice(0, 10); // "apikey_xxxx"
  const keyHash = hmacKey(secret, env.API_KEY_PEPPER);

  const doc = await ApiKeyModel.create({
    organizationId: input.organizationId,
    name: input.name,
    prefix,
    last4,
    keyHash,
    status: 'active',
    createdBy: input.createdBy,
  });

  return { id: doc._id.toString(), name: input.name, secret };
}

export async function listApiKeys(organizationId: Types.ObjectId) {
  return ApiKeyModel.find({ organizationId }).sort({ createdAt: -1 }).lean();
}

export async function revokeApiKey(id: string, organizationId: Types.ObjectId) {
  const doc = await ApiKeyModel.findOne({ _id: id, organizationId });
  if (!doc) throw notFound('API key not found');
  if (doc.status === 'active') {
    doc.status = 'revoked';
    doc.revokedAt = new Date();
    await doc.save();
  }
  return doc;
}

export async function findActiveKeyBySecret(secret: string) {
  const keyHash = hmacKey(secret, env.API_KEY_PEPPER);
  return ApiKeyModel.findOne({ keyHash, status: 'active' });
}