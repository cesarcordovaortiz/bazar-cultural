import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';

interface Props {
  children: ReactNode;
}

export function AdminGuard({ children }: Props) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.roles.includes('admin')) return <Navigate to="/" replace />;
  return <>{children}</>;
}
