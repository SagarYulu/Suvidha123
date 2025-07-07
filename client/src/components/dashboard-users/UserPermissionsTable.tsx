
import React, { useState, useEffect, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, AlertCircle, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  employee_id: string | null;
}

interface Permission {
  id: string;
  name: string;
  description: string | null;
}

interface UserPermissionsTableProps {
  dashboardUsers: DashboardUser[];
  permissions: Permission[];
  isLoading: boolean;
  hasPermission: (userId: string, permissionId: string) => boolean;
  togglePermission: (userId: string, permissionId: string) => Promise<void>;
}

const UserPermissionsTable: React.FC<UserPermissionsTableProps> = ({
  dashboardUsers,
  permissions,
  isLoading,
  hasPermission,
  togglePermission,
}) => {
  const [pendingPermissions, setPendingPermissions] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionStates, setPermissionStates] = useState<Record<string, boolean>>({});
  const { authState } = useAuth();
  const permissionStateRef = useRef<Record<string, boolean>>({}); // For tracking without re-renders
  
  // Initialize permission states based on current permissions
  useEffect(() => {
    const newStates: Record<string, boolean> = {};
    
    if (!isLoading && dashboardUsers.length > 0 && permissions.length > 0) {
      console.log("Initializing permission states from props");
      dashboardUsers.forEach(user => {
        permissions.forEach(permission => {
          const key = `${user.id}-${permission.id}`;
          newStates[key] = hasPermission(user.id, permission.id);
        });
      });
      
      setPermissionStates(newStates);
      permissionStateRef.current = newStates;
    }
  }, [dashboardUsers, permissions, hasPermission, isLoading]);
  
  const handleTogglePermission = async (userId: string, permissionId: string) => {
    // Clear any previous error
    setErrorMessage(null);
    
    const permissionKey = `${userId}-${permissionId}`;
    
    // Prevent duplicate toggles
    if (pendingPermissions.has(permissionKey)) {
      console.log("Toggle already pending for this permission, skipping");
      return;
    }
    
    // Optimistically update UI
    const newValue = !permissionStates[permissionKey];
    setPermissionStates(prev => ({
      ...prev,
      [permissionKey]: newValue
    }));
    permissionStateRef.current[permissionKey] = newValue;
    
    // Mark as pending
    setPendingPermissions(prev => {
      const newSet = new Set(prev);
      newSet.add(permissionKey);
      return newSet;
    });
    
    try {
      console.log("Toggle permission for:", { userId, permissionId });
      await togglePermission(userId, permissionId);
      
      // Keep the optimistic update since it succeeded
    } catch (error) {
      console.error("Error toggling permission:", error);
      
      // Revert the optimistic update on error
      setPermissionStates(prev => ({
        ...prev,
        [permissionKey]: !prev[permissionKey]
      }));
      permissionStateRef.current[permissionKey] = !permissionStateRef.current[permissionKey];
      
      // Show more specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes("administrator privileges")) {
          setErrorMessage("This action requires administrator privileges. Your current role does not have permission to manage security settings.");
        } else if (error.message.includes("Not authenticated")) {
          setErrorMessage("You are not authenticated. Please log out and log back in to refresh your session.");
        } else if (error.message.includes("policy")) {
          setErrorMessage("Permission change failed due to security policy restrictions. This operation can only be performed by system administrators.");
        } else {
          setErrorMessage(`Failed to update permission: ${error.message}`);
        }
      } else {
        setErrorMessage("An unexpected error occurred while updating permissions");
      }
      
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive"
      });
    } finally {
      setPendingPermissions(prev => {
        const newSet = new Set(prev);
        newSet.delete(permissionKey);
        return newSet;
      });
    }
  };

  // Check if the current user is an admin or security-admin
  const isCurrentUserAdmin = authState.role === 'admin' || authState.role === 'security-admin';
  
  if (isLoading) {
    return (
      <div className="space-y-2 py-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (dashboardUsers.length === 0) {
    return <div className="text-center py-10">No dashboard users found</div>;
  }

  if (!isCurrentUserAdmin) {
    return (
      <Alert variant="destructive" className="mb-4">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You need administrator privileges to manage user permissions.
          Please contact a system administrator if you need to make changes.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              {permissions.map(permission => (
                <TableHead key={permission.id} className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="inline-flex items-center">
                        <span className="mr-1">{permission.name}</span>
                        {permission.description && (
                          <InfoIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TooltipTrigger>
                      {permission.description && (
                        <TooltipContent>
                          <p>{permission.description}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashboardUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "Super Admin" ? "secondary" : "outline"}>
                    {user.role}
                  </Badge>
                </TableCell>
                {permissions.map(permission => {
                  const permissionKey = `${user.id}-${permission.id}`;
                  const isPending = pendingPermissions.has(permissionKey);
                  const isChecked = permissionStates[permissionKey] ?? false;
                  
                  // Super Admin users automatically have all permissions
                  const isSuperAdmin = user.role === "Super Admin";
                  // Current user cannot modify their own permissions
                  const isSelf = user.id === authState.user?.id;
                  
                  return (
                    <TableCell key={permissionKey} className="text-center">
                      <div className="flex justify-center items-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex items-center justify-center">
                                <Checkbox 
                                  id={permissionKey}
                                  checked={isSuperAdmin || isChecked}
                                  disabled={isPending || isSuperAdmin || isSelf}
                                  className={`cursor-pointer ${isPending ? "opacity-50 animate-pulse" : 
                                            isSuperAdmin ? "opacity-80" : 
                                            isSelf ? "opacity-70" : ""}`}
                                  onCheckedChange={() => {
                                    if (!isPending && !isSuperAdmin && !isSelf) {
                                      handleTogglePermission(user.id, permission.id);
                                    }
                                  }}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {isSuperAdmin 
                                  ? "Super Admins have all permissions by default"
                                  : isSelf
                                  ? "You cannot modify your own permissions"
                                  : isPending 
                                    ? "Processing..." 
                                    : isChecked 
                                      ? `Remove "${permission.name}" permission from ${user.name}` 
                                      : `Grant "${permission.name}" permission to ${user.name}`
                                }
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserPermissionsTable;
