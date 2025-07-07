import React, { useState, useEffect, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Role,
  Permission,
  getRoles, 
  getPermissions,
  getRolePermissions,
  assignPermissionToRole,
  removePermissionFromRole
} from '@/services/rbacService';
import { useAuth } from '@/contexts/AuthContext';
import { useRBAC } from '@/contexts/RBACContext';

const RolePermissionsManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<number, Record<number, boolean>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  
  const { authState } = useAuth();
  const { hasPermission } = useRBAC();

  // Check if current user is an admin
  const isAdmin = authState.role === 'admin' || authState.role === 'security-admin' || 
                  authState.user?.email === 'sagar.km@yulu.bike';

  // Load roles and permissions
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Fetch all roles and permissions
      const [allRoles, allPermissions] = await Promise.all([
        getRoles(),
        getPermissions()
      ]);
      
      setRoles(allRoles);
      setPermissions(allPermissions);
      
      // Initialize role permissions structure
      const permissionMap: Record<number, Record<number, boolean>> = {};
      
      // Fetch permissions for each role
      for (const role of allRoles) {
        // Skip if role.id is undefined or invalid
        if (!role.id || typeof role.id !== 'number') {
          console.warn('Skipping role with invalid ID:', role);
          continue;
        }
        
        const rolePermList = await getRolePermissions(role.id);
        
        permissionMap[role.id] = {};
        
        // Initialize all permissions to false
        for (const perm of allPermissions) {
          permissionMap[role.id][perm.id] = false;
        }
        
        // Set true for permissions that the role has
        for (const perm of rolePermList) {
          permissionMap[role.id][perm.id] = true;
        }
      }
      
      setRolePermissions(permissionMap);
    } catch (error) {
      console.error('Error loading RBAC data:', error);
      setErrorMessage('Failed to load roles and permissions data');
      toast({
        title: "Error",
        description: "Failed to load roles and permissions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle permission for a role
  const handleTogglePermission = useCallback(async (roleId: number, roleName: string, permissionId: number, permissionName: string) => {
    const changeKey = `${roleId}-${permissionId}`;
    setPendingChanges(prev => new Set(prev).add(changeKey));

    try {
      const currentlyHas = rolePermissions[roleId]?.[permissionId] || false;
      
      if (currentlyHas) {
        // Remove permission
        await removePermissionFromRole(roleId, permissionId);
        toast({
          title: "Permission Removed",
          description: `Removed "${permissionName}" from ${roleName}`,
        });
      } else {
        // Add permission
        await assignPermissionToRole(roleId, permissionId);
        toast({
          title: "Permission Granted",
          description: `Granted "${permissionName}" to ${roleName}`,
        });
      }

      // Update local state immediately
      setRolePermissions(prev => ({
        ...prev,
        [roleId]: {
          ...prev[roleId],
          [permissionId]: !currentlyHas
        }
      }));

    } catch (error) {
      console.error('Error toggling permission:', error);
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive"
      });
    } finally {
      setPendingChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(changeKey);
        return newSet;
      });
    }
  }, [rolePermissions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!isAdmin) {
    return (
      <Card className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            You don't have permission to manage role permissions. This feature is only available to administrators.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <h3 className="text-lg font-medium">Role Permissions Management</h3>
        <p className="text-sm text-muted-foreground">
          Manage which permissions are assigned to each role
        </p>
        
        {/* Debug information */}
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <strong>Debug:</strong> Roles: {roles.length}, Permissions: {permissions.length}
          {roles.length > 0 && (
            <div>Sample role: {JSON.stringify(roles[0])}</div>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
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
                      <TooltipContent>
                        <p>{permission.description || 'No description available'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map(role => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{role.name}</div>
                    {role.description && (
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    )}
                  </div>
                </TableCell>
                {permissions.map(permission => (
                  <TableCell key={`${role.id}-${permission.id}`} className="text-center">
                    <Checkbox
                      checked={rolePermissions[role.id]?.[permission.id] || false}
                      onCheckedChange={() => handleTogglePermission(role.id, role.name, permission.id, permission.name)}
                      disabled={pendingChanges.has(`${role.id}-${permission.id}`)}
                    />
                    {pendingChanges.has(`${role.id}-${permission.id}`) && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Updating...
                      </Badge>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {roles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No roles found. Please create some roles first.
          </div>
        )}
      </div>
    </Card>
  );
};

export default RolePermissionsManager;