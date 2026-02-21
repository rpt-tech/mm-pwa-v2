import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { gqlClient } from '@/lib/graphql-client';
import {
  REQUEST_PASSWORD_RESET_EMAIL_MUTATION,
  type RequestPasswordResetVariables,
  type RequestPasswordResetResponse,
} from '@/queries/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordProps {
  initialEmail?: string;
  onShowSignIn: () => void;
  onClose?: () => void;
}

export const ForgotPassword = ({
  initialEmail = '',
  onShowSignIn,
  onClose,
}: ForgotPasswordProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: initialEmail,
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await gqlClient.request<RequestPasswordResetResponse, RequestPasswordResetVariables>(
        REQUEST_PASSWORD_RESET_EMAIL_MUTATION,
        {
          email: data.email,
        }
      );

      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(
        err.response?.errors?.[0]?.message ||
          'Gửi email thất bại. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose?.();
  };

  if (isSuccess) {
    return (
      <div className="forgot-password-success max-w-md mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-green-800 mb-3">Kiểm tra email của bạn</h2>
          <p className="text-green-700 text-sm mb-2">
            Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{submittedEmail}</strong>
          </p>
          <p className="text-green-700 text-sm mb-6">
            Vui lòng kiểm tra email và làm theo hướng dẫn để đặt lại mật khẩu.
          </p>
          <div className="flex gap-3">
            <button onClick={handleClose} className="flex-1 bg-[#0272BA] text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-[#005a9e] transition-colors">
              Đóng
            </button>
            <button onClick={onShowSignIn} className="flex-1 bg-white text-[#0272BA] border border-[#0272BA] py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-form max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-1 text-gray-800">Quên mật khẩu?</h2>
      <p className="text-sm text-gray-500 mb-6">
        Nhập email của bạn để nhận link đặt lại mật khẩu
      </p>

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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#0272BA] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#005a9e] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
        </button>

        <div className="text-center">
          <button type="button" onClick={onShowSignIn} className="text-sm text-[#0272BA] hover:underline">
            Quay lại đăng nhập
          </button>
        </div>
      </form>
    </div>
  );
};
