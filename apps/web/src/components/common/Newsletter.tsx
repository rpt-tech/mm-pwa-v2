import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { gql } from '@/lib/gql';
import { gqlClient } from '@/lib/graphql-client';
import { Mail } from 'lucide-react';

const SUBSCRIBE_EMAIL = gql`
  mutation SubscribeEmailToNewsletter($email: String!) {
    subscribeEmailToNewsletter(email: $email) {
      status
    }
  }
`;

interface NewsletterProps {
  className?: string;
}

export default function Newsletter({ className = '' }: NewsletterProps) {
  const [email, setEmail] = useState('');

  const subscribeMutation = useMutation({
    mutationFn: () => gqlClient.request(SUBSCRIBE_EMAIL, { email }),
    onSuccess: () => {
      toast.success('Đăng ký nhận tin thành công!');
      setEmail('');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Vui lòng nhập email hợp lệ');
      return;
    }
    subscribeMutation.mutate();
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <Mail size={16} className="text-[#0272BA]" />
        <span className="text-sm font-medium text-gray-700">Đăng ký nhận tin khuyến mãi</span>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0272BA]"
        />
        <button
          type="submit"
          disabled={subscribeMutation.isPending}
          className="bg-[#0272BA] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#005a9e] disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {subscribeMutation.isPending ? '...' : 'Đăng ký'}
        </button>
      </form>
    </div>
  );
}
