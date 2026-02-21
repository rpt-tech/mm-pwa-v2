import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analytics } from '@/lib/analytics';
import { gqlClient } from '@/lib/graphql-client';
import { useAuthStore } from '@/stores/authStore';
import SocialLogin from '@/components/auth/SocialLogin';
import {
  SIGN_IN_MUTATION,
  GET_CUSTOMER_QUERY,
  CREATE_CART_MUTATION,
  MERGE_CARTS_MUTATION,
  GET_STORE_CONFIG_QUERY,
  type SignInVariables,
  type SignInResponse,
  type GetCustomerResponse,
  type StoreConfigResponse,
} from '@/queries/auth';
import { useCartStore } from '@/stores/cartStore';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  saveInformation: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInProps {
  onShowCreateAccount: (email?: string) => void;
  onShowForgotPassword: (email?: string) => void;
  onClose?: () => void;
  redirectUrl?: string;
}

export const SignIn = ({
  onShowCreateAccount,
  onShowForgotPassword,
  onClose,
  redirectUrl = '/',
}: SignInProps) => {
  const navigate = useNavigate();
  const { login, setLoading } = useAuthStore();
  const { cartId, setCartId } = useCartStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      saveInformation: false,
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      const sourceCartId = cartId;

      // Sign in
      const signInResult = await gqlClient.request<SignInResponse, SignInVariables>(
        SIGN_IN_MUTATION,
        {
          email: data.email,
          password: data.password,
        }
      );

      const token = signInResult.generateCustomerTokenV2.token;

      // Get store config for token lifetime
      const storeConfigResult = await gqlClient.request<StoreConfigResponse>(
        GET_STORE_CONFIG_QUERY
      );
      const tokenLifetime = storeConfigResult.storeConfig.customer_access_token_lifetime;

      // Get customer details
      const customerResult = await gqlClient.request<GetCustomerResponse>(
        GET_CUSTOMER_QUERY
      );

      // Login user
      login(token, customerResult.customer, tokenLifetime);
      analytics.login('email');

      // Handle cart merging
      if (sourceCartId) {
        try {
          // Create new cart for logged-in user
          const createCartResult = await gqlClient.request<{ cartId: string }>(
            CREATE_CART_MUTATION
          );
          const destinationCartId = createCartResult.cartId;

          // Merge guest cart into customer cart
          await gqlClient.request(MERGE_CARTS_MUTATION, {
            sourceCartId,
            destinationCartId,
          });

          setCartId(destinationCartId);
        } catch (cartError) {
          console.error('Cart merge error:', cartError);
          // Continue even if cart merge fails
        }
      }

      // Save credentials if requested
      if (data.saveInformation) {
        localStorage.setItem('saved_email', data.email);
      }

      // Close modal and redirect
      onClose?.();
      navigate(redirectUrl);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.response?.errors?.[0]?.message || 'Sign in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    const email = getValues('email');
    onShowForgotPassword(email);
  };

  const handleCreateAccountClick = () => {
    const email = getValues('email');
    onShowCreateAccount(email);
  };

  return (
    <div className="sign-in-form max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-1 text-gray-800">Đăng nhập</h2>
      <p className="text-sm text-gray-500 mb-6">Chào mừng bạn quay lại MM Vietnam</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0272BA] focus:ring-1 focus:ring-[#0272BA]"
            placeholder="Nhập địa chỉ email"
            autoComplete="email"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0272BA] focus:ring-1 focus:ring-[#0272BA]"
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('saveInformation')} className="w-4 h-4 accent-[#0272BA]" />
            <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
          </label>
          <button type="button" onClick={handleForgotPasswordClick} className="text-sm text-[#0272BA] hover:underline">
            Quên mật khẩu?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#0272BA] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#005a9e] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <div className="text-center">
          <span className="text-sm text-gray-600">Chưa có tài khoản? </span>
          <button type="button" onClick={handleCreateAccountClick} className="text-sm text-[#0272BA] font-medium hover:underline">
            Đăng ký ngay
          </button>
        </div>
      </form>
      <SocialLogin onSuccess={() => { onClose?.(); navigate(redirectUrl); }} onError={(msg) => setError(msg)} />
    </div>
  );
};
