import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { AppShell } from '../components/AppShell';
import { HomePage } from '../routes/HomePage';
import { PlaygroundPage } from '../routes/PlaygroundPage';
import { UsagePage } from '../routes/UsagePage';
import { ApiKeysPage } from '../routes/ApiKeysPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ConfirmEmailPage } from '../features/auth/ConfirmEmailPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';

function Protected({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  const loadSession = useAuthStore((s) => s.loadSession);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/confirm-email" element={<ConfirmEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="playground" element={<PlaygroundPage />} />
        <Route path="usage" element={<UsagePage />} />
        <Route path="api-keys" element={<ApiKeysPage />} />
      </Route>

      <Route path="*" element={<Navigate to={status === 'authenticated' ? '/' : '/login'} replace />} />
    </Routes>
  );
}