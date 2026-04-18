import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

const ADMIN_ROLES = ['admin', 'moderator', 'finance_manager', 'support_agent'];

export const ProtectedRoute = ({ requireAdmin = false, redirectAdmin = false }: { requireAdmin?: boolean, redirectAdmin?: boolean }) => {
  const { user, profile, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy text-accent">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.is_suspended) {
    return <Navigate to="/login" state={{ error: 'Your account has been suspended. Please contact support.' }} replace />;
  }

  if (requireAdmin && !ADMIN_ROLES.includes(profile?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (redirectAdmin && ADMIN_ROLES.includes(profile?.role)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};
