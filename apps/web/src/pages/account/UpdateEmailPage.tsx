import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import MyAccountLayout from '@/components/account/MyAccountLayout';
import { gqlClient } from '@/lib/graphql-client';
import { UPDATE_CUSTOMER_EMAIL } from '@/queries/account';
import { useAuthStore } from '@/stores/authStore';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
});

type FormData = z.infer<typeof schema>;

export default function UpdateEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      gqlClient.request(UPDATE_CUSTOMER_EMAIL, { email: data.email, password: data.password }, {
        Authorization: `Bearer ${token}`,
      }),
    onSuccess: () => {
      toast.success('Email đã được cập nhật thành công');
      navigate('/account/information');
    },
    onError: (err: any) => {
      const msg = err.response?.errors?.[0]?.message || 'Cập nhật email thất bại';
      toast.error(msg);
    },
  });

  return (
    <MyAccountLayout currentPage="information">
      <div className="max-w-md">
        <h2 className="text-2xl font-bold mb-6">{t('account.updateEmail', 'Cập nhật email')}</h2>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email mới <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="email@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341]"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341]"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/account/information')}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-2 bg-[#006341] text-white rounded-lg text-sm font-medium hover:bg-[#004d32] disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </MyAccountLayout>
  );
}
