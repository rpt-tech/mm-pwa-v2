import { AuthModal } from '@/components/auth';

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AuthModal initialView="SIGN_IN" />
    </div>
  );
}
