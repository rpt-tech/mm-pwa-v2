import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import MyAccountLayout from '@/components/account/MyAccountLayout';
import { gqlClient } from '@/lib/graphql-client';
import { UPDATE_CUSTOMER, GET_CUSTOMER } from '@/queries/account';

const schema = z.object({
  telephone: z
    .string()
    .min(10, 'Số điện thoại phải có ít nhất 10 chữ số')
    .max(11, 'Số điện thoại không được quá 11 chữ số')
    .regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa chữ số'),
});

type FormData = z.infer<typeof schema>;

export default function UpdatePhonePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: customerData } = useQuery({
    queryKey: ['customer'],
    queryFn: () => gqlClient.request(GET_CUSTOMER),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: { telephone: customerData?.customer?.telephone || '' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      gqlClient.request(UPDATE_CUSTOMER, { input: { telephone: data.telephone } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      toast.success('Số điện thoại đã được cập nhật');
      navigate('/account/information');
    },
    onError: (err: any) => {
      const msg = err.response?.errors?.[0]?.message || 'Cập nhật thất bại';
      toast.error(msg);
    },
  });

  return (
    <MyAccountLayout currentPage="information">
      <div className="max-w-md">
        <h2 className="text-2xl font-bold mb-6">Cập nhật số điện thoại</h2>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại mới <span className="text-red-500">*</span>
            </label>
            <input
              {...register('telephone')}
              type="tel"
              placeholder="0901234567"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341]"
            />
            {errors.telephone && (
              <p className="mt-1 text-xs text-red-500">{errors.telephone.message}</p>
            )}
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
