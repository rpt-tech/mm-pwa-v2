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
  email: z.string().email('Email không hợp lệ'),
  telephone: z.string().regex(phoneRegex, 'Số điện thoại không hợp lệ (10-11 chữ số)'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
  confirmPassword: z.string(),
  agree: z.boolean().refine((val) => val === true, {
    message: 'Bạn phải đồng ý với điều khoản sử dụng',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
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
        err.response?.errors?.[0]?.message || 'Tạo tài khoản thất bại. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="create-account-form max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-1 text-gray-800">Đăng ký tài khoản</h2>
      <p className="text-sm text-gray-500 mb-6">Tạo tài khoản MM Vietnam của bạn</p>

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
          <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input
            id="telephone"
            type="tel"
            {...register('telephone')}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0272BA] focus:ring-1 focus:ring-[#0272BA]"
            placeholder="Nhập số điện thoại"
            autoComplete="tel"
          />
          {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0272BA] focus:ring-1 focus:ring-[#0272BA]"
            placeholder="Nhập mật khẩu"
            autoComplete="new-password"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0272BA] focus:ring-1 focus:ring-[#0272BA]"
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" {...register('agree')} className="mt-0.5 w-4 h-4 accent-[#0272BA]" />
            <span className="text-sm text-gray-600">
              Tôi đồng ý với{' '}
              <a href="/faq/phap-ly-va-dieu-khoan-su-dung" className="text-[#0272BA] hover:underline">
                Điều khoản sử dụng
              </a>{' '}
              và{' '}
              <a href="/faq/chinh-sach-bao-mat" className="text-[#0272BA] hover:underline">
                Chính sách bảo mật
              </a>
            </span>
          </label>
          {errors.agree && <p className="text-red-500 text-xs mt-1">{errors.agree.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#0272BA] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#005a9e] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>

        <div className="text-center">
          <span className="text-sm text-gray-600">Đã có tài khoản? </span>
          <button type="button" onClick={onShowSignIn} className="text-sm text-[#0272BA] font-medium hover:underline">
            Đăng nhập
          </button>
        </div>
      </form>
    </div>
  );
};
