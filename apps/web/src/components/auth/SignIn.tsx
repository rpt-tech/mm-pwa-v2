import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gqlClient } from '@/lib/graphql-client';
import { useAuthStore } from '@/stores/authStore';
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
      <h2 className="text-2xl font-bold mb-6">Sign In</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter password"
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('saveInformation')}
              className="mr-2"
            />
            <span className="text-sm">Save information</span>
          </label>

          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">Don't have an account yet? </span>
          <button
            type="button"
            onClick={handleCreateAccountClick}
            className="text-sm text-blue-600 hover:underline"
          >
            Register now
          </button>
        </div>
      </form>
    </div>
  );
};
