import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAuthToken, clearAuthToken, getAuthToken } from '@/lib/graphql-client';

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,

      login: (token, user) => {
        setAuthToken(token);
        set({ user, isLoggedIn: true });
      },

      logout: () => {
        clearAuthToken();
        set({ user: null, isLoggedIn: false });
      },

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),

      checkAuth: () => {
        const token = getAuthToken();
        if (!token) {
          set({ user: null, isLoggedIn: false });
          return false;
        }
        return true;
      },
    }),
    {
      name: 'mm-auth',
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }),
    },
  ),
);
