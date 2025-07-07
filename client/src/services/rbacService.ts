import authenticatedAxios from './authenticatedAxios';

export interface Role {
  id: number;
  name: string;
  description: string | null;
}

export interface Permission {
  id: number;
  name: string;
  description: string | null;
}

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
}

export interface UserRole {
  id: number;
  userId: number;
  roleId: number;
}

// Get all roles
export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await authenticatedAxios.get('/rbac/roles');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

// Get all permissions
export const getPermissions = async (): Promise<Permission[]> => {
  try {
    const response = await authenticatedAxios.get('/rbac/permissions');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
};

// Get role permissions
export const getRolePermissions = async (roleId: number): Promise<Permission[]> => {
  try {
    const response = await authenticatedAxios.get(`/rbac/roles/${roleId}/permissions`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    throw error;
  }
};

// Get user roles
export const getUserRoles = async (userId: number): Promise<Role[]> => {
  try {
    const response = await authenticatedAxios.get(`/rbac/users/${userId}/roles`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
};

// Assign role to user
export const assignRoleToUser = async (userId: number, roleId: number): Promise<UserRole> => {
  try {
    const response = await authenticatedAxios.post('/rbac/user-roles', {
      userId,
      roleId
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning role to user:', error);
    throw error;
  }
};

// Remove role from user
export const removeRoleFromUser = async (userId: number, roleId: number): Promise<void> => {
  try {
    await authenticatedAxios.delete(`/api/rbac/users/${userId}/roles/${roleId}`);
  } catch (error) {
    console.error('Error removing role from user:', error);
    throw error;
  }
};

// Assign permission to role
export const assignPermissionToRole = async (roleId: number, permissionId: number): Promise<RolePermission> => {
  try {
    const response = await authenticatedAxios.post('/rbac/role-permissions', {
      roleId,
      permissionId
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning permission to role:', error);
    throw error;
  }
};

// Remove permission from role
export const removePermissionFromRole = async (roleId: number, permissionId: number): Promise<void> => {
  try {
    await authenticatedAxios.delete(`/api/rbac/roles/${roleId}/permissions/${permissionId}`);
  } catch (error) {
    console.error('Error removing permission from role:', error);
    throw error;
  }
};

// Check if user has permission
export const userHasPermission = async (userId: number, permissionName: string): Promise<boolean> => {
  try {
    const response = await authenticatedAxios.get(`/api/rbac/users/${userId}/permissions/${permissionName}`);
    return response.data?.hasPermission || false;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
};

// Export alias for backward compatibility
export const getPermissionsForRole = getRolePermissions;