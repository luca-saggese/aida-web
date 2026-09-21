import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../../lib/api';
import './auth.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setMessage('If that email exists, a reset link has been sent.');
      if (res.token) setDevToken(res.token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Request failed');
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
        <h1>Reset your password</h1>
        <p className="auth-sub">We'll email you a link to reset your password.</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-info">{message}</div>}
        {devToken && <div className="auth-info">Dev reset token: {devToken}</div>}

        <form onSubmit={onSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <div className="auth-alt">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}