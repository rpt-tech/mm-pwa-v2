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
  email: z.string().email('Invalid email address'),
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
          'Failed to send reset email. Please try again.'
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
          <h2 className="text-2xl font-bold text-green-800 mb-4">Check Your Email</h2>
          <p className="text-green-700 mb-4">
            We've sent a password reset link to <strong>{submittedEmail}</strong>
          </p>
          <p className="text-green-700 mb-6">
            Please check your email and follow the instructions to reset your password.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Close
            </button>
            <button
              onClick={onShowSignIn}
              className="flex-1 bg-white text-green-600 border border-green-600 py-2 px-4 rounded-md hover:bg-green-50"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-form max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Reset Password?</h2>
      <p className="text-gray-600 mb-6">
        Please enter your email to retrieve your password
      </p>

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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
          <button
            type="button"
            onClick={onShowSignIn}
            className="flex-1 bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onShowSignIn}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to Sign In
          </button>
        </div>
      </form>
    </div>
  );
};
