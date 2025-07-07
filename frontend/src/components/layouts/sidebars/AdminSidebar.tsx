
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRBAC } from '@/contexts/RBACContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  TicketCheck,
  Users,
  BarChart3,
  LogOut,
  Settings,
  Shield,
  ChevronDown,
  UserPlus,
  Ticket,
  BarChart2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
}

interface AdminSidebarProps {
  onLogout: () => void;
}

interface DropdownMenuProps {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isOpen: boolean;
  toggleOpen: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon: Icon, label, isActive: forcedActiveState }) => {
  const location = useLocation();
  const isActive = forcedActiveState !== undefined ? forcedActiveState : location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center py-3 px-6 text-sm font-medium border-l-2 transition-colors",
        isActive
          ? "bg-blue-50 border-blue-500 text-blue-700"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      )}
    >
      <Icon className={cn("h-5 w-5 mr-3", isActive ? "text-blue-500" : "text-gray-400")} />
      {label}
    </Link>
  );
};

const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
  label, 
  icon: Icon, 
  children, 
  isOpen, 
  toggleOpen 
}) => {
  const isActive = isOpen || React.Children.toArray(children).some((child) => {
    if (React.isValidElement(child) && 
        'props' in child && 
        child.props && 
        typeof child.props === 'object' && 
        child.props !== null &&
        'href' in child.props && 
        typeof child.props.href === 'string') {
      return window.location.pathname === child.props.href;
    }
    return false;
  });

  return (
    <div className="flex flex-col">
      <button 
        onClick={toggleOpen}
        className={cn(
          "flex items-center justify-between py-3 px-6 text-sm font-medium border-l-2 transition-colors",
          isActive
            ? "bg-blue-50 border-blue-500 text-blue-700"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        )}
      >
        <div className="flex items-center">
          <Icon className={cn("h-5 w-5 mr-3", isActive ? "text-blue-500" : "text-gray-400")} />
          {label}
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 transition-transform", 
            isOpen ? "transform rotate-180" : ""
          )} 
        />
      </button>
      {isOpen && (
        <div className="bg-gray-50 pl-4">
          {children}
        </div>
      )}
    </div>
  );
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout }) => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    dashboardUsers: false,
    tickets: false,
    analytics: false
  });
  const { hasPermission, userRole } = useRBAC();
  const location = useLocation();
  const { logout, authState } = useAuth();

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Check if user is HR Admin
  const isHrAdmin = authState.role === 'HR Admin';

  // Check if user is Super Admin
  const isSuperAdmin = authState.role === 'Super Admin' || authState.role === 'admin';

  // Determine active link based on current location
  useEffect(() => {
    // Check if we're in a subpath and open the corresponding dropdown
    if (location.pathname.includes('/admin/dashboard-users')) {
      setOpenMenus(prev => ({
        ...prev,
        dashboardUsers: true
      }));
    }
    
    // Check if we're in tickets pages
    if (location.pathname.includes('/admin/issues') || location.pathname.includes('/admin/assigned-issues')) {
      setOpenMenus(prev => ({
        ...prev,
        tickets: true
      }));
    }
    
    // Check if we're in analytics pages
    if (location.pathname.includes('/admin/analytics')) {
      setOpenMenus(prev => ({
        ...prev,
        analytics: true
      }));
    }
  }, [location]);

  // Create a proper logout handler function
  const handleLogout = async () => {
    try {
      await logout();
      onLogout(); // Call the passed onLogout prop
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  console.log("Current user role:", userRole);
  console.log("Has dashboard permission:", hasPermission("view:dashboard"));
  console.log("Has tickets permission:", hasPermission("manage:tickets_all") || hasPermission("manage:tickets_assigned"));
  console.log("Has users permission:", hasPermission("manage:users"));
  console.log("Has analytics permission:", hasPermission("view:issue_analytics") || hasPermission("view:feedback_analytics"));
  console.log("Has security permission:", hasPermission("access:security"));

  const showAllTickets = isHrAdmin || isSuperAdmin;

  return (
    <div className="w-64 bg-white border-r hidden md:block overflow-y-auto h-full flex flex-col">
      <div className="py-6 px-6 border-b">
        <Link to="/admin/dashboard" className="flex items-center">
          <span className="text-xl font-bold text-blue-700">Yulu Suvidha Management</span>
        </Link>
      </div>

      <div className="py-3 flex-grow">
        {/* Dashboard - All admin users have access */}
        {hasPermission("view:dashboard") && (
          <SidebarLink href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
        )}


        
        {/* Tickets dropdown - Available to users with ticket management permissions */}
        {(hasPermission("manage:tickets_all") || hasPermission("manage:tickets_assigned")) && (
          <DropdownMenu 
            label="Tickets" 
            icon={TicketCheck} 
            isOpen={openMenus.tickets} 
            toggleOpen={() => toggleMenu('tickets')}
          >
            {/* All Tickets - Only visible to HR Admin and Super Admin */}
            {showAllTickets && (
              <SidebarLink 
                href="/admin/issues" 
                icon={TicketCheck} 
                label="All Tickets" 
                isActive={location.pathname === "/admin/issues"}
              />
            )}
            
            {/* Assigned To Me - Available to all users with manage:issues */}
            <SidebarLink 
              href="/admin/assigned-issues" 
              icon={Ticket} 
              label="Assigned To Me" 
              isActive={location.pathname === "/admin/assigned-issues"}
            />
          </DropdownMenu>
        )}
        
        {/* Users - Available to users with manage:users permission */}
        {hasPermission("manage:users") && (
          <SidebarLink href="/admin/users" icon={Users} label="Users" />
        )}
        
        {/* Analytics dropdown - Available to users with analytics permissions */}
        {(hasPermission("view:issue_analytics") || hasPermission("view:feedback_analytics")) && (
          <DropdownMenu 
            label="Analytics" 
            icon={BarChart3} 
            isOpen={openMenus.analytics} 
            toggleOpen={() => toggleMenu('analytics')}
          >
            <SidebarLink 
              href="/admin/analytics" 
              icon={BarChart3} 
              label="Issue Analytics" 
              isActive={location.pathname === "/admin/analytics"}
            />
          </DropdownMenu>
        )}
        
        {/* Dashboard Users dropdown - Available to users with dashboard user management permission */}
        {hasPermission("manage:dashboard_users") && (
          <DropdownMenu 
            label="Dashboard Users" 
            icon={Users} 
            isOpen={openMenus.dashboardUsers} 
            toggleOpen={() => toggleMenu('dashboardUsers')}
          >
            <SidebarLink 
              href="/admin/dashboard-users/add" 
              icon={UserPlus} 
              label="Add Dashboard User" 
              isActive={location.pathname === "/admin/dashboard-users/add"}
            />
          </DropdownMenu>
        )}
        
        {/* Access Control - Available to users with access:security permission */}
        {hasPermission("access:security") && (
          <SidebarLink href="/admin/access-control" icon={Shield} label="Access Control" />
        )}
        
        {/* Settings - Available to Super Admin or users with dashboard management */}
        {(isSuperAdmin || hasPermission("manage:dashboard_users")) && (
          <SidebarLink href="/admin/settings" icon={Settings} label="Settings" />
        )}
        
        {/* Feedback Analytics - Available to users with feedback analytics permission */}
        {hasPermission("view:feedback_analytics") && (
          <SidebarLink 
            href="/admin/feedback-analytics" 
            icon={BarChart2} 
            label="Feedback Analytics" 
            isActive={location.pathname === "/admin/feedback-analytics"}
          />
        )}
      </div>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-500 hover:text-gray-700"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
