import { create } from 'zustand';
import Cookies from 'js-cookie';
import { setAuthToken, clearAuthToken } from '@/lib/graphql-client';

interface User {
  customer_uid: string;
  email: string;
  firstname: string;
  is_subscribed: boolean;
  custom_attributes?: Array<{
    code: string;
    value: string;
  }>;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, user: User, tokenLifetime?: number) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
}

const TOKEN_COOKIE_NAME = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  isLoading: false,

  login: (token: string, user: User, tokenLifetime?: number) => {
    // Store token in cookie
    const cookieOptions: Cookies.CookieAttributes = {
      secure: import.meta.env.PROD,
      sameSite: 'strict',
    };

    if (tokenLifetime) {
      // tokenLifetime is in seconds, convert to days for cookie expiry
      cookieOptions.expires = tokenLifetime / (60 * 60 * 24);
    }

    Cookies.set(TOKEN_COOKIE_NAME, token, cookieOptions);
    setAuthToken(token);

    // Store user in localStorage
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    set({
      token,
      user,
      isLoggedIn: true,
    });
  },

  logout: () => {
    // Remove token from cookie
    Cookies.remove(TOKEN_COOKIE_NAME);
    clearAuthToken();

    // Remove user from localStorage
    localStorage.removeItem(USER_STORAGE_KEY);

    set({
      token: null,
      user: null,
      isLoggedIn: false,
    });
  },

  setUser: (user: User) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    set({ user });
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),

  initializeAuth: () => {
    // Check for existing token and user on app load
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    const userStr = localStorage.getItem(USER_STORAGE_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        setAuthToken(token);
        set({
          token,
          user,
          isLoggedIn: true,
        });
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        Cookies.remove(TOKEN_COOKIE_NAME);
        localStorage.removeItem(USER_STORAGE_KEY);
        clearAuthToken();
      }
    }
  },
}));
