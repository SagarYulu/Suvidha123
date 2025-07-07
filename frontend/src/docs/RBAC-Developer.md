
# Role-Based Access Control (RBAC) Developer Guide

## Overview

This document provides detailed information for developers on how to modify and extend the RBAC system in this application.

## Core Files

1. **`src/contexts/RBACContext.tsx`**: The central configuration file that:
   - Defines permission types
   - Provides hooks for permission checks
   - Communicates with the database-backed RBAC system

2. **`src/hooks/useRoleAccess.tsx`**: A utility hook that:
   - Checks if a user has a specific permission
   - Handles redirection for unauthorized access
   - Displays toast notifications

3. **`src/components/guards/RoleBasedGuard.tsx`**: Protects routes based on permissions

4. **`src/components/guards/PermissionGuards.tsx`**: Pre-configured guards for common permissions

5. **`src/components/rbac/PermissionGate.tsx`**: Conditionally renders UI elements based on permissions

6. **`src/services/rbacService.ts`**: Service functions to interact with the RBAC database tables

## Database Structure

The RBAC system is backed by several database tables:

1. **`rbac_permissions`**: Stores available permissions
   - id (UUID)
   - name (TEXT)
   - description (TEXT)

2. **`rbac_roles`**: Stores roles that can be assigned to users
   - id (UUID)
   - name (TEXT)
   - description (TEXT)

3. **`rbac_role_permissions`**: Junction table linking roles to permissions
   - id (UUID)
   - role_id (UUID)
   - permission_id (UUID)

4. **`rbac_user_roles`**: Junction table linking users to roles
   - id (UUID)
   - user_id (UUID)
   - role_id (UUID)

## Database Functions

The following database functions are available for RBAC operations:

1. **`has_role(user_id, role_name)`**: Check if a user has a specific role
2. **`assign_role(target_user_id, role_name)`**: Assign a role to a user
3. **`remove_role(target_user_id, role_name)`**: Remove a role from a user
4. **`has_permission(user_id, permission_name)`**: Check if a user has a specific permission
5. **`assign_permission_to_role(role_name, permission_name)`**: Assign a permission to a role
6. **`remove_permission_from_role(role_name, permission_name)`**: Remove a permission from a role

## Modifying the RBAC System

### Adding a New Permission

1. Insert the new permission into the `rbac_permissions` table:
   ```sql
   INSERT INTO public.rbac_permissions (name, description)
   VALUES ('access:new-feature', 'Description of the permission');
   ```

2. Update the `Permission` type in `src/contexts/RBACContext.tsx`:
   ```typescript
   export type Permission = 
     | 'view:dashboard' 
     | 'manage:users'
     // Add your new permission here
     | 'access:new-feature';
   ```

3. Assign the permission to the appropriate roles through the UI or directly in the database:
   ```sql
   INSERT INTO public.rbac_role_permissions (role_id, permission_id)
   VALUES (
     (SELECT id FROM public.rbac_roles WHERE name = 'admin'),
     (SELECT id FROM public.rbac_permissions WHERE name = 'access:new-feature')
   );
   ```

### Creating a New Guard for a Permission

To protect routes with your new permission, add a new guard in `src/components/guards/PermissionGuards.tsx`:

```typescript
// New feature guard
export const NewFeatureGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="access:new-feature" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);
```

Then use this guard in `App.tsx` to protect routes:

```typescript
<Route path="/admin/new-feature" element={
  <NewFeatureGuard>
    <NewFeaturePage />
  </NewFeatureGuard>
} />
```

### Special Developer Access

The email `sagar.km@yulu.bike` is configured as a developer account with full access override.

You can find this configuration in:
- `src/contexts/RBACContext.tsx` - The hasPermission function
- `src/hooks/useRoleAccess.tsx` - The checkAccess function

## Best Practices

1. **Clear Permission Names**: Use descriptive permission names with a colon separator (`area:action`)
2. **Fine-grained Permissions**: Create specific permissions rather than broad ones
3. **Default Deny**: Always default to no access and explicitly grant permissions
4. **UI Components**: Use `PermissionGate` for conditional UI rendering

## Managing Permissions Through the UI

The application includes UI tools for managing permissions at `/admin/access-control`. This interface allows you to:

1. View all roles and their assigned permissions
2. Add or remove permissions from roles
3. Assign roles to users
4. Create new roles or permissions if needed

## Testing RBAC Implementation

When testing your RBAC implementation:

1. Test with different user roles
2. Verify direct URL access is protected
3. Check that UI elements are conditionally rendered correctly
4. Test permission changes and their effect on access
