import { AuthModal } from '@/components/auth';

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AuthModal initialView="FORGOT_PASSWORD" />
    </div>
  );
}
