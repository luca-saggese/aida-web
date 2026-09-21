import { create } from 'zustand';
import type { Session } from '../types';
import { api, getToken, setToken } from '../lib/api';

interface AuthState {
  user: Session['user'] | null;
  organization: Session['organization'] | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  loadSession: () => Promise<void>;
  logout: () => void;
  setSession: (session: { token: string | null; user: Session['user']; organization: Session['organization'] | null }) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organization: null,
  status: 'loading',

  async loadSession() {
    if (!getToken()) {
      set({ status: 'unauthenticated', user: null, organization: null });
      return;
    }
    try {
      const { session } = await api.getSession();
      set({ user: session.user, organization: session.organization, status: 'authenticated' });
    } catch {
      setToken(null);
      set({ user: null, organization: null, status: 'unauthenticated' });
    }
  },

  logout() {
    setToken(null);
    set({ user: null, organization: null, status: 'unauthenticated' });
  },

  setSession({ token, user, organization }) {
    setToken(token);
    set({ user, organization, status: 'authenticated' });
  },
}));