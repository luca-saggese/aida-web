import crypto from 'node:crypto';

/** Generate a cryptographically secure random token string. */
export function generateToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/** SHA-256 hash of a token, used for storing single-use auth tokens at rest. */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** HMAC-SHA256 with pepper for hashing API key secrets. */
export function hmacKey(secret: string, pepper: string): string {
  return crypto.createHmac('sha256', pepper).update(secret).digest('hex');
}

/** Random hex byte string (for API key secret material). */
export function randomBytesHex(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/** Constant-time compare for hex strings. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}