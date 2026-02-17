import { AuthModal } from '@/components/auth';

export default function CreateAccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AuthModal initialView="CREATE_ACCOUNT" />
    </div>
  );
}
