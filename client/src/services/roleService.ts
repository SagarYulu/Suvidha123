import authenticatedAxios from './authenticatedAxios';

/**
 * Check if a user has a specific role
 * @param userId User's integer ID
 * @param roleName Role name to check
 * @returns Boolean indicating if user has the role
 */
export const checkUserRole = async (userId: number, roleName: string): Promise<boolean> => {
  try {
    // First check if we have a valid user ID
    if (!userId || isNaN(userId)) {
      console.error('Invalid user ID provided:', userId);
      return false;
    }
    
    const response = await authenticatedAxios.get(`/api/rbac/users/${userId}/roles`);
    const userRoles = response.data || [];
    
    // Handle both array and object responses
    if (Array.isArray(userRoles)) {
      return userRoles.some((role: any) => 
        role && role.name && role.name.toLowerCase() === roleName.toLowerCase()
      );
    }
    
    // If single role object returned
    if (userRoles && userRoles.name) {
      return userRoles.name.toLowerCase() === roleName.toLowerCase();
    }
    
    return false;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

/**
 * Assign a role to a user
 * @param userId User's integer ID
 * @param roleName Role name to assign
 * @returns Boolean indicating success
 */
export const assignRole = async (userId: number, roleName: string): Promise<boolean> => {
  try {
    // First get the role ID by name
    const rolesResponse = await authenticatedAxios.get('/rbac/roles');
    const roles = rolesResponse.data || [];
    const role = roles.find((r: any) => r.name.toLowerCase() === roleName.toLowerCase());
    
    if (!role) {
      console.error('Role not found:', roleName);
      return false;
    }

    // Assign the role to the user
    await authenticatedAxios.post('/api/rbac/user-roles', {
      userId,
      roleId: role.id
    });
    
    return true;
  } catch (error) {
    console.error('Error assigning role to user:', error);
    return false;
  }
};

/**
 * Remove a role from a user
 * @param userId User's integer ID
 * @param roleName Role name to remove
 * @returns Boolean indicating success
 */
export const removeRole = async (userId: number, roleName: string): Promise<boolean> => {
  try {
    // First get the role ID by name
    const rolesResponse = await authenticatedAxios.get('/rbac/roles');
    const roles = rolesResponse.data || [];
    const role = roles.find((r: any) => r.name.toLowerCase() === roleName.toLowerCase());
    
    if (!role) {
      console.error('Role not found:', roleName);
      return false;
    }

    // Remove the role from the user
    await authenticatedAxios.delete(`/api/rbac/users/${userId}/roles/${role.id}`);
    
    return true;
  } catch (error) {
    console.error('Error removing role from user:', error);
    return false;
  }
};

/**
 * Get all roles for a user
 * @param userId User's integer ID
 * @returns Array of role names
 */
export const getUserRoles = async (userId: number): Promise<string[]> => {
  try {
    const response = await authenticatedAxios.get(`/api/rbac/users/${userId}/roles`);
    const userRoles = response.data || [];
    
    return userRoles.map((role: any) => role.name);
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
};

/**
 * Check if a user has any of the specified roles
 * @param userId User's integer ID
 * @param roleNames Array of role names to check
 * @returns Boolean indicating if user has any of the roles
 */
export const hasAnyRole = async (userId: number, roleNames: string[]): Promise<boolean> => {
  try {
    const userRoles = await getUserRoles(userId);
    return roleNames.some(roleName => 
      userRoles.includes(roleName) || 
      userRoles.some(userRole => userRole.toLowerCase() === roleName.toLowerCase())
    );
  } catch (error) {
    console.error('Error checking user roles:', error);
    return false;
  }
};

/**
 * Check if a user has all of the specified roles
 * @param userId User's integer ID
 * @param roleNames Array of role names to check
 * @returns Boolean indicating if user has all of the roles
 */
export const hasAllRoles = async (userId: number, roleNames: string[]): Promise<boolean> => {
  try {
    const userRoles = await getUserRoles(userId);
    return roleNames.every(roleName => 
      userRoles.includes(roleName) || 
      userRoles.some(userRole => userRole.toLowerCase() === roleName.toLowerCase())
    );
  } catch (error) {
    console.error('Error checking user roles:', error);
    return false;
  }
};