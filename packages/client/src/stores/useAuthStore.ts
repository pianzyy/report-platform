import { create } from 'zustand';
import type { User } from '@report-gen/shared';
import { apiClient } from '../api/client';

let queryClient: { clear: () => void } | null = null;

export function setQueryClient(qc: { clear: () => void }) {
  queryClient = qc;
}

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (username, password) => {
    const { data } = await apiClient.post('/auth/login', { username, password });
    set({ user: data.data, isAuthenticated: true, isLoading: false });
  },

  register: async (username, password, confirmPassword) => {
    const { data } = await apiClient.post('/auth/register', { username, password, confirmPassword });
    set({ user: data.data, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    }
    if (queryClient) queryClient.clear();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    try {
      const { data } = await apiClient.get('/auth/me');
      if (data.data) {
        set({ user: data.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// Register 401 interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);
