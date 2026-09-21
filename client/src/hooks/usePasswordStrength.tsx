import { useMemo } from 'react';

export interface PasswordStrength {
  score: number;
  ok: boolean;
  feedback: string[];
}

const MIN_LENGTH = 8;

export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    const checks = {
      length: password.length >= MIN_LENGTH,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    };
    const passed = Object.values(checks).filter(Boolean).length;
    const score = checks.length ? Math.max(0, Math.min(4, passed - 1)) : 0;

    const feedback: string[] = [];
    if (!checks.length) feedback.push('At least ' + MIN_LENGTH + ' characters');
    if (!checks.upper) feedback.push('An uppercase letter');
    if (!checks.lower) feedback.push('A lowercase letter');
    if (!checks.number) feedback.push('A number');
    if (!checks.symbol) feedback.push('A symbol');

    const ok = checks.length && checks.upper && checks.lower && checks.number && checks.symbol;

    return { score, ok, feedback };
  }, [password]);
}

export function StrengthMeter({ score }: { score: number }) {
  return (
    <div className="strength-box">
      <div className="strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={score >= i ? 'filled-' + score : ''} />
        ))}
      </div>
    </div>
  );
}