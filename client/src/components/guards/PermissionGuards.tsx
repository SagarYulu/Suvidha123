import React from 'react';
import RoleBasedGuard from './RoleBasedGuard';
import { Permission } from '@/contexts/RBACContext';
import PermissionGate from '../rbac/PermissionGate';

// Base interface for all permission guards
interface GuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// Dashboard access guard
export const DashboardGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/' 
}) => (
  <RoleBasedGuard permission="view:dashboard" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);

// User management guard
export const UserManagementGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="manage:users" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);

// Issues management guard
export const IssuesGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="manage:issues" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);

// Analytics access guard
export const AnalyticsGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="manage:analytics" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);

// Feedback Analytics access guard
export const FeedbackAnalyticsGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="view_analytics" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);

// Settings access guard
export const SettingsGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="manage:settings" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);

// Security access guard
export const SecurityGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="access:security" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);

// Create dashboard user guard
export const CreateDashboardUserGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="create:dashboardUser" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);
