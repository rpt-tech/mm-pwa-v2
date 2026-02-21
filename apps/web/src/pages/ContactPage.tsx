import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { gql } from '@/lib/gql';
import { gqlClient } from '@/lib/graphql-client';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const SUBMIT_CONTACT_FORM = gql`
  mutation SubmitContactForm($input: ContactFormInput!) {
    submitContactForm(input: $input) {
      success
      message
    }
  }
`;

const contactSchema = z.object({
  name: z.string().min(2, 'Vui lòng nhập họ tên'),
  email: z.string().email('Email không hợp lệ'),
  telephone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  comment: z.string().min(10, 'Nội dung quá ngắn'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const submitMutation = useMutation({
    mutationFn: (data: ContactFormData) =>
      gqlClient.request(SUBMIT_CONTACT_FORM, { input: data }),
    onSuccess: () => {
      setSubmitted(true);
      reset();
      toast.success('Gửi thành công! Chúng tôi sẽ liên hệ lại sớm.');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    },
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <Helmet>
        <title>Liên hệ | MM Mega Market</title>
        <meta name="description" content="Liên hệ với MM Mega Market - Hotline, email, địa chỉ cửa hàng" />
      </Helmet>

      <Breadcrumbs />

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Liên hệ với chúng tôi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Thông tin liên hệ</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#0272BA] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-gray-700">Địa chỉ</p>
                  <p className="text-sm text-gray-500">MM Mega Market Vietnam</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-[#0272BA] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-gray-700">Hotline</p>
                  <a href="tel:19001234" className="text-sm text-[#0272BA] hover:underline">1900 1234</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-[#0272BA] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-gray-700">Email</p>
                  <a href="mailto:cskh@mmvietnam.com" className="text-sm text-[#0272BA] hover:underline">
                    cskh@mmvietnam.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-[#0272BA] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-gray-700">Giờ làm việc</p>
                  <p className="text-sm text-gray-500">Thứ 2 - Chủ nhật: 8:00 - 22:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Gửi tin nhắn</h2>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-green-600" />
              </div>
              <p className="font-medium text-gray-800 mb-2">Cảm ơn bạn đã liên hệ!</p>
              <p className="text-sm text-gray-500">Chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-sm text-[#0272BA] hover:underline"
              >
                Gửi tin nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit((data) => submitMutation.mutate(data))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                <input
                  {...register('name')}
                  placeholder="Nguyễn Văn A"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0272BA]"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="email@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0272BA]"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                <input
                  {...register('telephone')}
                  type="tel"
                  placeholder="0901234567"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0272BA]"
                />
                {errors.telephone && <p className="mt-1 text-xs text-red-500">{errors.telephone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
                <textarea
                  {...register('comment')}
                  rows={4}
                  placeholder="Nhập nội dung cần hỗ trợ..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0272BA] resize-none"
                />
                {errors.comment && <p className="mt-1 text-xs text-red-500">{errors.comment.message}</p>}
              </div>
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full bg-[#0272BA] text-white py-2.5 rounded-lg font-medium hover:bg-[#005a9e] disabled:opacity-50 transition-colors"
              >
                {submitMutation.isPending ? 'Đang gửi...' : 'Gửi tin nhắn'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
