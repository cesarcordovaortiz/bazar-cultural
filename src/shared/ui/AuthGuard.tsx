import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';

interface Props {
  children: ReactNode;
}

export function AuthGuard({ children }: Props) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
