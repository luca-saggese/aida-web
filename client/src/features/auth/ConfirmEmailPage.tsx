import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../../lib/api';
import './auth.css';

function useQueryParams() {
  return new URLSearchParams(useLocation().search);
}

export function ConfirmEmailPage() {
  const params = useQueryParams();
  const tokenFromUrl = params.get('token');
  const location = useLocation();
  const navigate = useNavigate();
  const devToken = (location.state as { devToken?: string } | null)?.devToken;

  const [token, setToken] = useState(tokenFromUrl ?? devToken ?? '');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.verifyEmail(token);
      setMessage(res.message ?? 'Email verified! You can now sign in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email) return;
    setError(null);
    setMessage(null);
    try {
      const res = await api.resendVerification(email);
      if (res.token) setMessage(`Dev verification token: ${res.token}`);
      else setMessage('Verification email sent.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-lockup">
          <span className="mark">TS</span>
          <span className="name">GOTRAXX AI</span>
        </div>
        <h1>Confirm your email</h1>
        <p className="auth-sub">Enter the verification token you received by email.</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-info">{message}</div>}

        <form onSubmit={onSubmit}>
          <div className="auth-field">
            <label htmlFor="token">Verification token</label>
            <input id="token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="paste-token" required />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Confirming…' : 'Confirm email'}
          </button>
        </form>

        <div className="auth-alt">
          Didn't get it? Resend below.
        </div>
        <div className="auth-field" style={{ marginTop: 12 }}>
          <label htmlFor="email">Email (to resend)</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="button" className="auth-btn" onClick={resend} style={{ marginTop: 8 }}>
            Resend verification
          </button>
        </div>

        <div className="auth-alt">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}