import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireUserType?: 'dashboard_user' | 'employee';
  requirePermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireUserType,
  requirePermission 
}) => {
  const { user, authState } = useAuth();

  // If not authenticated, redirect to appropriate login
  if (!authState.isAuthenticated || !user) {
    if (requireUserType === 'employee') {
      return <Navigate to="/mobile/login" replace />;
    }
    return <Navigate to="/admin/login" replace />;
  }

  // Check user type requirement
  if (requireUserType && user.userType !== requireUserType) {
    // Employee trying to access admin routes
    if (user.userType === 'employee' && requireUserType === 'dashboard_user') {
      return <Navigate to="/mobile/issues" replace />;
    }
    // Dashboard user trying to access mobile routes
    if (user.userType === 'dashboard_user' && requireUserType === 'employee') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Check permission requirement (for future use)
  if (requirePermission) {
    // This would require RBAC context integration
    // For now, we'll handle this at the component level
  }

  return <>{children}</>;
};

export default ProtectedRoute;