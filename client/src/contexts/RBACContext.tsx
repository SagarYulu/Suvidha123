import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Define permission types based on the new RBAC structure
export type Permission = 
  | 'view:dashboard'
  | 'view:tickets_all'
  | 'view:tickets_assigned'
  | 'manage:tickets_all'
  | 'manage:tickets_assigned'
  | 'view:issue_analytics'
  | 'view:feedback_analytics'
  | 'manage:users'
  | 'manage:dashboard_users'
  | 'access:city_restricted'
  | 'access:all_cities'
  | 'access:security';

// Define context type
type RBACContextType = {
  hasPermission: (permission: Permission) => boolean;
  userRole: string | null;
  isLoading: boolean;
  refreshPermissions: () => Promise<void>;
};

// Create the context
const RBACContext = createContext<RBACContextType | undefined>(undefined);

// Provider props type
interface RBACProviderProps {
  children: ReactNode;
}

// RBAC Provider component
export const RBACProvider: React.FC<RBACProviderProps> = ({ children }) => {
  const { authState } = useAuth();
  const [permissionCache, setPermissionCache] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Get current user role
  const userRole = authState.role || null;
  
  // Role-based permissions mapping based on the RBAC system
  const getPermissionsForRole = (role: string): Record<Permission, boolean> => {
    const basePermissions: Record<Permission, boolean> = {
      'view:dashboard': false,
      'view:tickets_all': false,
      'view:tickets_assigned': false,
      'manage:tickets_all': false,
      'manage:tickets_assigned': false,
      'view:issue_analytics': false,
      'view:feedback_analytics': false,
      'manage:users': false,
      'manage:dashboard_users': false,
      'access:city_restricted': false,
      'access:all_cities': false,
      'access:security': false
    };

    // Role-based permission mapping according to the new RBAC structure
    switch (role) {
      case 'Super Admin':
      case 'admin':
        // Super Admin gets all permissions
        return Object.keys(basePermissions).reduce((acc, key) => {
          acc[key as Permission] = true;
          return acc;
        }, {} as Record<Permission, boolean>);

      case 'HR Admin':
        return {
          ...basePermissions,
          'view:dashboard': true,
          'view:tickets_all': true,
          'manage:tickets_all': true,
          'manage:users': true,
          'manage:dashboard_users': true,
          'view:feedback_analytics': true,
          'view:issue_analytics': true,
          'access:all_cities': true
        };

      case 'City Head':
        return {
          ...basePermissions,
          'view:dashboard': true,
          'view:tickets_assigned': true,
          'manage:tickets_assigned': true,
          'view:issue_analytics': true,
          'view:feedback_analytics': true,
          'access:city_restricted': true
        };

      case 'CRM':
        return {
          ...basePermissions,
          'view:dashboard': true,
          'view:tickets_assigned': true,
          'manage:tickets_assigned': true,
          'view:issue_analytics': true,
          'access:city_restricted': true
        };

      case 'Cluster Head':
        return {
          ...basePermissions,
          'view:dashboard': true,
          'view:tickets_assigned': true,
          'manage:tickets_assigned': true,
          'view:issue_analytics': true,
          'access:city_restricted': true
        };

      case 'Ops Head':
        return {
          ...basePermissions,
          'view:dashboard': true,
          'view:tickets_assigned': true,
          'manage:tickets_assigned': true,
          'view:issue_analytics': true,
          'view:feedback_analytics': true,
          'access:all_cities': true
        };

      case 'Payroll Ops':
        return {
          ...basePermissions,
          'view:dashboard': true,
          'view:tickets_assigned': true,
          'manage:tickets_assigned': true,
          'view:issue_analytics': true,
          'access:all_cities': true
        };

      case 'TA Associate':
        return {
          ...basePermissions,
          'view:dashboard': true,
          'view:tickets_assigned': true,
          'manage:tickets_assigned': true,
          'view:issue_analytics': true,
          'access:city_restricted': true
        };
      
      case 'security-admin':
        return {
          ...basePermissions,
          'view:dashboard': true,
          'access:security': true,
          'manage:users': true
        };
      
      default:
        // Employee roles or unknown roles get no permissions
        return basePermissions;
    }
  };

  // Update permissions when auth state changes
  useEffect(() => {
    if (authState.isAuthenticated && userRole) {
      const permissions = getPermissionsForRole(userRole);
      setPermissionCache(permissions);
    } else {
      setPermissionCache({});
    }
    setIsLoading(false);
  }, [authState.isAuthenticated, userRole]);

  // Function to refresh permissions
  const refreshPermissions = async () => {
    if (userRole) {
      const permissions = getPermissionsForRole(userRole);
      setPermissionCache(permissions);
    }
  };

  // Function to check if user has permission
  const hasPermission = (permission: Permission): boolean => {
    return permissionCache[permission] || false;
  };

  const contextValue = useMemo(() => ({
    hasPermission,
    userRole,
    isLoading,
    refreshPermissions
  }), [permissionCache, userRole, isLoading]);

  return (
    <RBACContext.Provider value={contextValue}>
      {children}
    </RBACContext.Provider>
  );
};

// Hook to use RBAC context
export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};