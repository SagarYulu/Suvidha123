
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast"; 

import BaseLayout from './layouts/BaseLayout';
import AdminHeader from './layouts/headers/AdminHeader';
import AdminSidebar from './layouts/sidebars/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  showBackButton?: boolean;
  requiredPermission?: 'view:dashboard' | 'manage:users' | 'manage:issues' | 'manage:analytics' | 'manage:settings' | 'access:security' | 'create:dashboardUser';
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title,
  className,
  showBackButton = true,
  requiredPermission = 'view:dashboard'
}) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  
  // Show loading indicator while authentication state is being determined
  if (authState.isAuthenticated === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Unable to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <BaseLayout 
      header={
        <AdminHeader 
          title={title} 
          userName={authState.user?.name || 'Administrator'} 
          showBackButton={showBackButton}
        />
      } 
      sidebar={
        <AdminSidebar onLogout={handleLogout} />
      }
      className={className}
    >
      {children}
    </BaseLayout>
  );
};

export default AdminLayout;
