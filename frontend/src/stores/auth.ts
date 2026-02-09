import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import type { User, LoginData, RegisterData, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setToken: (token: string) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (data: LoginData) => {
        set({ isLoading: true });
        try {
          const response = await api.post<AuthResponse>('/auth/login', data);
          const { user, token } = response.data.data;
          localStorage.setItem('wisebox_token', token);
          document.cookie = `wisebox_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await api.post<AuthResponse>('/auth/register', data);
          const { user, token } = response.data.data;
          localStorage.setItem('wisebox_token', token);
          document.cookie = `wisebox_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      googleLogin: async (idToken: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post<AuthResponse>('/auth/google', { id_token: idToken });
          const { user, token } = response.data.data;
          localStorage.setItem('wisebox_token', token);
          document.cookie = `wisebox_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // Ignore logout errors
        } finally {
          localStorage.removeItem('wisebox_token');
          document.cookie = 'wisebox_token=; path=/; max-age=0';
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      refreshUser: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.data, isAuthenticated: true });
        } catch {
          localStorage.removeItem('wisebox_token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      setToken: (token: string) => {
        localStorage.setItem('wisebox_token', token);
        set({ token, isAuthenticated: true });
      },

      reset: () => {
        localStorage.removeItem('wisebox_token');
        document.cookie = 'wisebox_token=; path=/; max-age=0';
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'wisebox-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
