import { GraphQLClient } from 'graphql-request';
import Cookies from 'js-cookie';

const MAGENTO_URL = import.meta.env.VITE_MAGENTO_URL;

export const gqlClient = new GraphQLClient(MAGENTO_URL, {
  headers: () => {
    const token = Cookies.get('auth_token');
    const storeCode = Cookies.get('store_code') || 'default';
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
