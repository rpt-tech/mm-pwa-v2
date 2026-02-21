import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { gqlClient } from '@/lib/graphql-client';
import { SOCIAL_LOGIN_MUTATION, GET_CUSTOMER_QUERY, GET_STORE_CONFIG_QUERY, CREATE_CART_MUTATION, MERGE_CARTS_MUTATION } from '@/queries/auth';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { analytics } from '@/lib/analytics';

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    FB: any;
    google: any;
  }
}

interface SocialLoginProps {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export default function SocialLogin({ onSuccess, onError }: SocialLoginProps) {
  const { login } = useAuthStore();
  const { cartId } = useCartStore();

  const socialLoginMutation = useMutation({
    mutationFn: async ({ provider, token }: { provider: string; token: string }) => {
      const sourceCartId = cartId;
      const result: any = await gqlClient.request(SOCIAL_LOGIN_MUTATION, { provider, token });
      const authToken = result.socialLogin.token;

      const [storeConfigResult, customerResult] = await Promise.all([
        gqlClient.request<any>(GET_STORE_CONFIG_QUERY),
        gqlClient.request<any>(GET_CUSTOMER_QUERY),
      ]);

      const tokenLifetime = storeConfigResult.storeConfig.customer_access_token_lifetime;
      login(authToken, customerResult.customer, tokenLifetime);
      analytics.login(provider);

      // Merge carts
      if (sourceCartId) {
        try {
          const createCartResult = await gqlClient.request<any>(CREATE_CART_MUTATION);
          await gqlClient.request(MERGE_CARTS_MUTATION, {
            sourceCartId,
            destinationCartId: createCartResult.cartId,
          });
        } catch {
          // Cart merge failure is non-fatal
        }
      }
    },
    onSuccess: () => onSuccess?.(),
    onError: (err: any) => onError?.(err.message || 'Đăng nhập thất bại'),
  });

  const handleFacebook = useCallback(() => {
    if (!window.FB) return;
    window.FB.login((response: any) => {
      if (response.authResponse?.accessToken) {
        socialLoginMutation.mutate({ provider: 'facebook', token: response.authResponse.accessToken });
      }
    }, { scope: 'email,public_profile' });
  }, [socialLoginMutation]);

  const handleGoogle = useCallback(() => {
    if (!window.google?.accounts?.oauth2) return;
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: (response: any) => {
        if (response.access_token) {
          socialLoginMutation.mutate({ provider: 'google', token: response.access_token });
        }
      },
    });
    client.requestAccessToken();
  }, [socialLoginMutation]);

  if (!FACEBOOK_APP_ID && !GOOGLE_CLIENT_ID) return null;

  return (
    <div className="mt-4">
      <div className="relative flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">hoặc đăng nhập với</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="flex gap-3">
        {FACEBOOK_APP_ID && (
          <button
            type="button"
            onClick={handleFacebook}
            disabled={socialLoginMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        )}
        {GOOGLE_CLIENT_ID && (
          <button
            type="button"
            onClick={handleGoogle}
            disabled={socialLoginMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
        )}
      </div>
    </div>
  );
}
