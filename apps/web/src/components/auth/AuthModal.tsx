import { useState } from 'react';
import { SignIn } from './SignIn';
import { CreateAccount } from './CreateAccount';
import { ForgotPassword } from './ForgotPassword';

type AuthView = 'SIGN_IN' | 'CREATE_ACCOUNT' | 'FORGOT_PASSWORD';

interface AuthModalProps {
  initialView?: AuthView;
  onClose?: () => void;
}

export const AuthModal = ({ initialView = 'SIGN_IN', onClose }: AuthModalProps) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [email, setEmail] = useState('');

  const handleShowSignIn = () => setView('SIGN_IN');
  const handleShowCreateAccount = (defaultEmail?: string) => {
    if (defaultEmail) setEmail(defaultEmail);
    setView('CREATE_ACCOUNT');
  };
  const handleShowForgotPassword = (defaultEmail?: string) => {
    if (defaultEmail) setEmail(defaultEmail);
    setView('FORGOT_PASSWORD');
  };

  return (
    <div className="auth-modal">
      {view === 'SIGN_IN' && (
        <SignIn
          onShowCreateAccount={handleShowCreateAccount}
          onShowForgotPassword={handleShowForgotPassword}
          onClose={onClose}
        />
      )}
      {view === 'CREATE_ACCOUNT' && (
        <CreateAccount
          initialEmail={email}
          onShowSignIn={handleShowSignIn}
          onClose={onClose}
        />
      )}
      {view === 'FORGOT_PASSWORD' && (
        <ForgotPassword
          initialEmail={email}
          onShowSignIn={handleShowSignIn}
          onClose={onClose}
        />
      )}
    </div>
  );
};
