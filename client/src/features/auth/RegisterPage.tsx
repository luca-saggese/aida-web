import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { usePasswordStrength, StrengthMeter } from '../../hooks/usePasswordStrength';
import './auth.css';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const strength = usePasswordStrength(password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!strength.ok) {
      setError('Password does not meet the strength requirements');
      return;
    }
    setLoading(true);
    try {
      const res = await api.register({
        name,
        email,
        password,
        organization: organization || undefined,
      });
      if (res.token) {
        setSession({ token: res.token, user: res.user, organization: res.organization });
        navigate('/playground');
      } else {
        // Email confirmation required.
        setInfo(res.verification?.message ?? 'Please check your email to confirm your account.');
        if (res.verification?.token) setDevToken(res.verification.token);
        navigate('/confirm-email', { state: { devToken: res.verification?.token } });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-lockup">
          <span className="mark">GT</span>
          <span className="name">GOTRAXX AI</span>
        </div>
        <h1>Create your account</h1>
        <p className="auth-sub">Run Aida evaluations with the GoTraxx console clone.</p>

        {error && <div className="auth-error">{error}</div>}
        {info && <div className="auth-info">{info}</div>}
        {devToken && !info && <div className="auth-info">Dev verification token: {devToken}</div>}

        <form onSubmit={onSubmit}>
          <div className="auth-field">
            <label htmlFor="name">Full name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label htmlFor="organization">Organization (optional)</label>
            <input
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Bernardo's org"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            {password && (
              <div className="strength-feedback">
                <StrengthMeter score={strength.score} />
                {strength.feedback.length > 0 && (
                  <>
                    <div>Requires: {strength.feedback.join(', ')}.</div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="auth-field">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div className="auth-alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}