
# Role-Based Access Control (RBAC) System

This document explains how to use the RBAC system to secure parts of your application.

## Core Components

1. **RBACContext**: Provides role and permission data throughout the application
2. **useRoleAccess**: Hook for checking permissions and redirecting if needed
3. **RoleBasedGuard**: Component for protecting routes based on permissions
4. **PermissionGuards**: Pre-configured guards for common permissions
5. **PermissionGate**: Component for conditionally rendering UI elements

## Available Permissions

- `view:dashboard`: Access to view the admin dashboard
- `manage:users`: Access to manage users
- `manage:issues`: Access to manage issues
- `manage:analytics`: Access to view analytics
- `manage:settings`: Access to change settings
- `access:security`: Access to security features
- `create:dashboardUser`: Permission to create dashboard users

## Role-Permission Mapping

- `admin`: All permissions
- `security-admin`: view:dashboard, access:security, manage:users
- `Super Admin`: All permissions
- `employee`: manage:issues
- `default`: No permissions

## How to Use

### Protecting Routes

In your App.tsx, wrap routes with permission guards:

```tsx
<Route path="/admin/dashboard" element={
  <DashboardGuard redirectTo="/admin/login">
    <AdminDashboard />
  </DashboardGuard>
} />
```

### Conditional UI Rendering

Use PermissionGate to show/hide UI elements:

```tsx
<PermissionGate permission="access:security">
  <Button>Sensitive Action</Button>
</PermissionGate>
```

### Checking Permissions in Components

Use the useRBAC hook:

```tsx
const { hasPermission } = useRBAC();

if (hasPermission('manage:users')) {
  // Do something only admins can do
}
```

### Custom Permission Checks with Redirect

Use the useRoleAccess hook:

```tsx
const { checkAccess } = useRoleAccess();

useEffect(() => {
  checkAccess('manage:analytics', { 
    redirectTo: '/access-denied',
    showToast: true 
  });
}, []);
```

## Extending the System

To add new permissions:

1. Add the permission type to the Permission type in RBACContext.tsx
2. Update the ROLE_PERMISSIONS mapping with the new permission
3. Create a new guard if needed in PermissionGuards.tsx

