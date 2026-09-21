import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../../lib/api';
import { usePasswordStrength, StrengthMeter } from '../../hooks/usePasswordStrength';
import './auth.css';

export function ResetPasswordPage() {
  const params = new URLSearchParams(useLocation().search);
  const tokenFromUrl = params.get('token') ?? '';
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const strength = usePasswordStrength(password);
  const navigate = useNavigate();

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
      const res = await api.resetPassword(token, password);
      setMessage(res.message ?? 'Password updated.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reset failed');
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
        <h1>Choose a new password</h1>
        <p className="auth-sub">It must be at least 8 characters with upper/lowercase, a number and a symbol.</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-info">{message}</div>}

        <form onSubmit={onSubmit}>
          <div className="auth-field">
            <label htmlFor="token">Reset token</label>
            <input id="token" value={token} onChange={(e) => setToken(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label htmlFor="password">New password</label>
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
                {strength.feedback.length > 0 && <div>Requires: {strength.feedback.join(', ')}.</div>}
              </div>
            )}
          </div>
          <div className="auth-field">
            <label htmlFor="confirm">Confirm new password</label>
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
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <div className="auth-alt">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}