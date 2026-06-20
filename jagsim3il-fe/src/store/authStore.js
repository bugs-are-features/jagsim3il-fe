// 인증 상태관리 (zustand)
import { create } from 'zustand';
import { loginRequest, signupRequest } from '../api/auth';

export const useAuthStore = create((set) => ({
  // state
  user: null, // { id, username, nickname, email, avatar }
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // actions
  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await loginRequest({ username, password });
      set({ user, token, isAuthenticated: true, loading: false });
      return true;
    } catch (e) {
      set({ error: e.message, loading: false });
      return false;
    }
  },

  signup: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await signupRequest(payload);
      set({ user, token, isAuthenticated: true, loading: false });
      return true;
    } catch (e) {
      set({ error: e.message, loading: false });
      return false;
    }
  },

  logout: () =>
    set({ user: null, token: null, isAuthenticated: false, error: null }),

  clearError: () => set({ error: null }),
}));
