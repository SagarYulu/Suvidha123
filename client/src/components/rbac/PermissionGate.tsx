
import React from 'react';
import { useRBAC, Permission } from '@/contexts/RBACContext';

interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders content based on user permissions
 * without redirecting - useful for UI elements that should be hidden
 * from users without specific permissions
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback = null
}) => {
  const { hasPermission } = useRBAC();
  
  // If user has permission, render children; otherwise render fallback (or nothing)
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGate;
