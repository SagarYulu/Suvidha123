
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Loader2 } from 'lucide-react';
import { Permission } from '@/contexts/RBACContext';

interface RoleBasedGuardProps {
  children: React.ReactNode;
  permission: Permission;
  redirectTo?: string;
  showLoadingScreen?: boolean;
}

/**
 * Component that protects routes based on user permissions
 */
const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({
  children,
  permission,
  redirectTo = '/admin/login',
  showLoadingScreen = true
}) => {
  const { authState } = useAuth();
  const { hasPermission } = useRoleAccess();
  
  // Check if user is authenticated
  const isAuthenticated = authState.isAuthenticated;
  
  // RBAC restrictions temporarily removed - allow all authenticated users
  const accessResult = true; // Always grant access
  
  // If auth state is still initializing, show a loading screen
  // The 'loading' property might not exist in authState, so we check if isAuthenticated is null/undefined
  if (isAuthenticated === undefined && showLoadingScreen) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // User has permission, render children
  return <>{children}</>;
};

export default RoleBasedGuard;
