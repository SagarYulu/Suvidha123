
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Permission } from '@/contexts/RBACContext';

interface AccessCheckOptions {
  redirectTo?: string | false;
  showToast?: boolean;
}

/**
 * Custom hook for checking user permissions based on roles
 */
export const useRoleAccess = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();

  // Helper function to check permissions without side effects
  const hasPermission = useCallback((permission: Permission): boolean => {
    // Special case for Super Admin or specific admin users
    if (
      authState.role === "Super Admin" || 
      authState.role === "admin" ||
      authState.user?.email === "sagar.km@yulu.bike" || 
      authState.user?.email === "admin@yulu.com"
    ) {
      console.log(`useRoleAccess: Developer/admin account - has permission: ${permission}`);
      return true;
    }

    // Check if user is authenticated - this is critical
    if (!authState.isAuthenticated) {
      console.log(`useRoleAccess: User not authenticated, needs permission: ${permission}`);
      return false;
    }

    // At this point we know the user is authenticated
    
    // Logic for checking role-specific permissions
    const permissions = authState.role ? getPermissionsForRole(authState.role) : [];
    if (permissions.includes(permission)) {
      console.log(`useRoleAccess: User has permission: ${permission}`);
      return true;
    }
    
    // Special check for assigned issues - all dashboard users can manage their assigned issues
    if (permission === 'manage:issues' && authState.user?.id) {
      console.log(`useRoleAccess: User can manage assigned issues: ${permission}`);
      return true;
    }
    
    console.log(`useRoleAccess: User does not have permission: ${permission}`);
    return false;
  }, [authState]);

  // Legacy function that supports navigation and toasts
  // Simplified to prevent conflicting redirects
  const checkAccess = useCallback((permission: Permission, options: AccessCheckOptions = {}) => {
    const { showToast = true } = options;
    
    // Check permission without side effects
    const hasAccess = hasPermission(permission);
    
    if (!hasAccess && showToast) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to access this resource.`,
        variant: "destructive"
      });
    }
    
    return hasAccess;
  }, [hasPermission]);

  return {
    checkAccess,
    hasPermission,
    isAuthenticated: authState.isAuthenticated,
    role: authState.role
  };
};

// Mock function to get permissions based on role
const getPermissionsForRole = (role: string): Permission[] => {
  switch (role) {
    case 'Super Admin':
      return [
        'view:dashboard',
        'manage:users',
        'manage:issues',
        'manage:analytics',
        'manage:settings',
        'access:security',
        'create:dashboardUser',
        'view_analytics'
      ];
    case 'admin':
      return [
        'view:dashboard',
        'manage:users',
        'manage:issues',
        'manage:analytics',
        'manage:settings',
        'access:security',
        'create:dashboardUser',
        'view_analytics'
      ];
    case 'City Head':
      return ['view:dashboard', 'manage:issues', 'view_analytics'];
    case 'Revenue and Ops Head':
      return ['view:dashboard', 'manage:analytics', 'view_analytics'];
    case 'CRM':
      return ['view:dashboard', 'manage:users', 'view_analytics'];
    case 'Cluster Head':
      return ['view:dashboard', 'manage:issues', 'view_analytics'];
    case 'Payroll Ops':
      return ['view:dashboard', 'manage:settings'];
    case 'HR Admin':
      return ['view:dashboard', 'manage:users', 'manage:issues', 'create:dashboardUser', 'view_analytics'];
    case 'security-admin':
      return ['view:dashboard', 'access:security'];
    default:
      return [];
  }
};
