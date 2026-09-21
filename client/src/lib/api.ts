import type {
  ApiKeyItem,
  EvaluateResponse,
  Session,
  SystemOneResponse,
  UsageResponse,
} from '../types';

const TOKEN_KEY = 'ts_clone_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  code: string;
  details: unknown[];

  constructor(message: string, code = 'ERROR', details: unknown[] = []) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });

  if (res.status === 204) return undefined as T;

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const err = body as { error?: { code?: string; message?: string; details?: unknown[] } };
    throw new ApiError(
      err?.error?.message ?? `Request failed (${res.status})`,
      err?.error?.code ?? 'ERROR',
      err?.error?.details ?? [],
    );
  }

  return body as T;
}

export const api = {
  getSession: () => request<{ session: Session }>('/api/session'),

  // Auth
  register: (payload: { name: string; email: string; password: string; organization?: string }) =>
    request<{
      token: string | null;
      user: Session['user'];
      organization: Session['organization'];
      requiresEmailConfirmation: boolean;
      verification?: { message: string; token?: string };
    }>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: Session['user']; organization: Session['organization'] | null }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify(payload) },
    ),
  verifyEmail: (token: string) =>
    request<{ success: boolean; message?: string }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  resendVerification: (email: string) =>
    request<{ success: boolean; message?: string; token?: string }>('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  forgotPassword: (email: string) =>
    request<{ success: boolean; message?: string; token?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    request<{ success: boolean; message?: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  // Playground
  evaluate: (payload: { state: unknown; questions: unknown; model: string }) =>
    request<EvaluateResponse>('/api/evaluate', { method: 'POST', body: JSON.stringify(payload) }),

  createShare: (payload: { state: unknown; questions: unknown; selectedModels: string[]; layout: string }) =>
    request<{ shareId: string; url: string }>('/api/shares', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getShare: (id: string) =>
    request<{ share: { state: unknown; questions: unknown; selectedModels: string[]; layout: string } }>(
      `/api/shares/${id}`,
    ),

  // API keys
  listApiKeys: () => request<{ keys: ApiKeyItem[] }>('/api/api-keys'),
  createApiKey: (name: string) =>
    request<{ id: string; name: string; secret: string }>('/api/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  revokeApiKey: (id: string) => request<{ id: string; status: string }>(`/api/api-keys/${id}/revoke`, { method: 'POST' }),
  deleteApiKey: (id: string) => request<void>(`/api/api-keys/${id}`, { method: 'DELETE' }),

  // Usage
  getUsage: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return request<UsageResponse>(`/api/usage?${qs}`);
  },
};

export function maskKey(prefix: string, last4: string): string {
  return `${prefix}...${last4}`;
}

export type { ApiKeyItem };
export type { SystemOneResponse };