import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useAuth = () => {
  const { user, isLoggedIn, token, isLoading, login, logout, setUser, setLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth on mount
    initializeAuth();
  }, [initializeAuth]);

  return {
    user,
    isLoggedIn,
    token,
    isLoading,
    login,
    logout,
    setUser,
    setLoading,
  };
};

export const useRequireAuth = (redirectTo: string = '/sign-in') => {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate(redirectTo);
    }
  }, [isLoggedIn, isLoading, navigate, redirectTo]);

  return { isLoggedIn, isLoading };
};
