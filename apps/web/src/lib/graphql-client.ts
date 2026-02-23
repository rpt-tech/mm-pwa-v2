import { GraphQLClient } from 'graphql-request';
import Cookies from 'js-cookie';

const MAGENTO_URL = import.meta.env.VITE_MAGENTO_URL;

// Default B2C store code — used when no store has been selected yet
// Using b2c_10010_vi (MM Mega Market An Phú VI) instead of mm_10010_vi (AnPhuVN - store phụ)
const DEFAULT_STORE_CODE = 'b2c_10010_vi';

export function getStoreCode(): string {
  // 1. Check cookie (set by StoreSwitcher after selection)
  const cookie = Cookies.get('store_code');
  if (cookie) return cookie;
  // 2. Check localStorage (legacy format from StoreSwitcher)
  try {
    const stored = localStorage.getItem('store');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.storeViewCode) return parsed.storeViewCode;
    }
  } catch { /* ignore */ }
  return DEFAULT_STORE_CODE;
}

export const gqlClient = new GraphQLClient(MAGENTO_URL, {
  headers: () => {
    const token = Cookies.get('auth_token');
    const storeCode = getStoreCode();
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Store: storeCode,
      'Content-Type': 'application/json',
    };
  },
});

export function setAuthToken(token: string) {
  Cookies.set('auth_token', token, { expires: 1, sameSite: 'strict' });
}

export function clearAuthToken() {
  Cookies.remove('auth_token');
}

export function getAuthToken(): string | undefined {
  return Cookies.get('auth_token');
}
