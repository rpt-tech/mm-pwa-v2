import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gqlClient } from '@/lib/graphql-client';
import { useAuthStore } from '@/stores/authStore';
import {
  CREATE_ACCOUNT_MUTATION,
  SIGN_IN_AFTER_CREATE_MUTATION,
  GET_CUSTOMER_QUERY,
  CREATE_CART_MUTATION,
  MERGE_CARTS_MUTATION,
  GET_STORE_CONFIG_QUERY,
  type CreateAccountVariables,
  type CreateAccountResponse,
  type GetCustomerResponse,
  type StoreConfigResponse,
} from '@/queries/auth';
import { useCartStore } from '@/stores/cartStore';

const phoneRegex = /^[0-9]{10,11}$/;

const createAccountSchema = z.object({
  email: z.string().email('Invalid email address'),
  telephone: z.string().regex(phoneRegex, 'Invalid phone number (10-11 digits)'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  agree: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

interface CreateAccountProps {
  initialEmail?: string;
  onShowSignIn: () => void;
  onClose?: () => void;
}

export const CreateAccount = ({
  initialEmail = '',
  onShowSignIn,
  onClose,
}: CreateAccountProps) => {
  const navigate = useNavigate();
  const { login, setLoading } = useAuthStore();
  const { cartId, setCartId } = useCartStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      email: initialEmail,
      agree: false,
    },
  });

  const onSubmit = async (data: CreateAccountFormData) => {
    setIsSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      const sourceCartId = cartId;
      const username = data.email.split('@')[0];

      // Create account
      await gqlClient.request<CreateAccountResponse, CreateAccountVariables>(
        CREATE_ACCOUNT_MUTATION,
        {
          email: data.email,
          firstname: username || 'User',
          lastname: '',
          password: data.password,
          is_subscribed: false,
          custom_attributes: [
            {
              attribute_code: 'company_user_phone_number',
              value: data.telephone,
            },
          ],
        }
      );

      // Sign in after account creation
      const signInResult = await gqlClient.request<{ generateCustomerToken: { token: string } }>(
        SIGN_IN_AFTER_CREATE_MUTATION,
        {
          email: data.email,
          password: data.password,
        }
      );

      const token = signInResult.generateCustomerToken.token;

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

      // Close modal and redirect
      onClose?.();
      navigate('/');
    } catch (err: any) {
      console.error('Create account error:', err);
      setError(
        err.response?.errors?.[0]?.message || 'Account creation failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="create-account-form max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Register</h2>

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
          <label htmlFor="telephone" className="block text-sm font-medium mb-1">
            Telephone
          </label>
          <input
            id="telephone"
            type="tel"
            {...register('telephone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your phone number"
            autoComplete="tel"
          />
          {errors.telephone && (
            <p className="text-red-600 text-sm mt-1">{errors.telephone.message}</p>
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
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm password"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div>
          <label className="flex items-start">
            <input
              type="checkbox"
              {...register('agree')}
              className="mt-1 mr-2"
            />
            <span className="text-sm">
              Agree to{' '}
              <a href="/faq/phap-ly-va-dieu-khoan-su-dung" className="text-blue-600 hover:underline">
                the Terms of use
              </a>{' '}
              and{' '}
              <a href="/faq/chinh-sach-bao-mat" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.agree && (
            <p className="text-red-600 text-sm mt-1">{errors.agree.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">You already have an account? </span>
          <button
            type="button"
            onClick={onShowSignIn}
            className="text-sm text-blue-600 hover:underline"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
};
