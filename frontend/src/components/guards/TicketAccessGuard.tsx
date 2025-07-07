
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface TicketAccessGuardProps {
  children: React.ReactNode;
  onlyForAssigned?: boolean;
  redirectTo?: string;
}

/**
 * A component that guards routes based on ticket access permissions
 */
const TicketAccessGuard: React.FC<TicketAccessGuardProps> = ({
  children,
  onlyForAssigned = false,
  redirectTo = '/admin/dashboard'
}) => {
  const { checkAccess, isAuthenticated } = useRoleAccess();
  const { authState } = useAuth();
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Only check access once authentication state is known
    if (isAuthenticated !== undefined) {
      // First, check if user has the basic issue management permission
      const hasIssuePermission = checkAccess('manage:issues', { 
        redirectTo, 
        showToast: false 
      });

      let hasTicketAccess = false;
      
      if (hasIssuePermission) {
        if (onlyForAssigned) {
          // For "Assigned to Me" - always allow access if user has issue management permission
          hasTicketAccess = true;
        } else {
          // For "All Tickets" - only HR Admin and Super Admin roles can access
          const isHrAdmin = authState.role === 'HR Admin';
          const isSuperAdmin = authState.role === 'Super Admin' || authState.role === 'admin';
          
          hasTicketAccess = isHrAdmin || isSuperAdmin;
          
          if (!hasTicketAccess && authState.user?.email === 'sagar.km@yulu.bike') {
            // Developer account exception
            hasTicketAccess = true;
          }
          
          if (!hasTicketAccess) {
            toast({
              title: "Access Denied",
              description: "Only HR Admin and Super Admin can access all tickets",
              variant: "destructive"
            });
          }
        }
      }
      
      setHasAccess(hasTicketAccess);
      setAccessChecked(true);
    }
  }, [isAuthenticated, authState.role, authState.user, checkAccess, onlyForAssigned, redirectTo]);

  // Show loading indicator while checking access
  if (!accessChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

  // If no access, redirect
  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  // If has access, render children
  return <>{children}</>;
};

export default TicketAccessGuard;
