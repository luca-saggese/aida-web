export interface PasswordStrengthResult {
  ok: boolean;
  score: number; // 0..4
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
  };
  feedback: string[];
}

const MIN_LENGTH = 8;

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    length: password.length >= MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const score = Math.min(4, Math.max(0, passed - (checks.length ? 0 : 1)));

  const feedback: string[] = [];
  if (!checks.length) feedback.push(`At least ${MIN_LENGTH} characters.`);
  if (!checks.uppercase) feedback.push('At least one uppercase letter.');
  if (!checks.lowercase) feedback.push('At least one lowercase letter.');
  if (!checks.number) feedback.push('At least one number.');
  if (!checks.symbol) feedback.push('At least one symbol.');

  const ok = checks.length && checks.uppercase && checks.lowercase && checks.number && checks.symbol;

  return { ok, score, checks, feedback };
}