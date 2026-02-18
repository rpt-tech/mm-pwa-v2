import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { gqlClient } from '@/lib/graphql-client';
import { RESET_PASSWORD_MUTATION } from '@/queries/auth';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ConfirmPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { email: string; resetPasswordToken: string; newPassword: string }) =>
      gqlClient.request(RESET_PASSWORD_MUTATION, data),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        navigate('/sign-in');
      }, 3000);
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token || !email) {
      return;
    }
    resetPasswordMutation.mutate({
      email,
      resetPasswordToken: token,
      newPassword: data.password,
    });
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t('auth.invalidResetLink', 'Invalid Reset Link')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('auth.invalidResetLinkMessage', 'This password reset link is invalid or has expired.')}
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-[#006341] text-white py-3 rounded-lg font-semibold hover:bg-[#004d32]"
          >
            {t('auth.requestNewLink', 'Request New Link')}
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t('auth.passwordResetSuccess', 'Password Reset Successful')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('auth.passwordResetSuccessMessage', 'Your password has been reset successfully. Redirecting to sign in...')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {t('auth.resetPassword', 'Reset Password')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('auth.resetPasswordMessage', 'Enter your new password below.')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email', 'Email')}
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.newPassword', 'New Password')}
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006341] focus:border-transparent"
              placeholder={t('auth.enterNewPassword', 'Enter new password')}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.confirmPassword', 'Confirm Password')}
            </label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006341] focus:border-transparent"
              placeholder={t('auth.confirmNewPassword', 'Confirm new password')}
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Error Message */}
          {resetPasswordMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">
                {t('auth.resetPasswordError', 'Failed to reset password. Please try again or request a new link.')}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full bg-[#006341] text-white py-3 rounded-lg font-semibold hover:bg-[#004d32] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resetPasswordMutation.isPending
              ? t('auth.resetting', 'Resetting...')
              : t('auth.resetPassword', 'Reset Password')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/sign-in')}
            className="text-[#006341] hover:underline text-sm"
          >
            {t('auth.backToSignIn', 'Back to Sign In')}
          </button>
        </div>
      </div>
    </div>
  );
}
