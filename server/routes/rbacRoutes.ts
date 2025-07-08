import { Router } from 'express';
import { rbacController } from '../controllers/rbacController';
import { authenticateToken, requireDashboardUser, requirePermission } from '../middleware/auth';

const router = Router();

// All RBAC routes require authentication and dashboard user access
router.use(authenticateToken);
router.use(requireDashboardUser);

// Role management routes
router.get('/roles', rbacController.getAllRoles.bind(rbacController));
router.post('/roles', requirePermission('manage:rbac'), rbacController.createRole.bind(rbacController));
router.put('/roles/:id', requirePermission('manage:rbac'), rbacController.updateRole.bind(rbacController));
router.delete('/roles/:id', requirePermission('manage:rbac'), rbacController.deleteRole.bind(rbacController));

// Permission management routes
router.get('/permissions', rbacController.getAllPermissions.bind(rbacController));

// Role-permission management routes
router.get('/roles/:roleId/permissions', rbacController.getRolePermissions.bind(rbacController));
router.put('/roles/:roleId/permissions', requirePermission('manage:rbac'), rbacController.updateRolePermissions.bind(rbacController));
router.post('/roles/:roleId/permissions/:permissionId', requirePermission('manage:rbac'), rbacController.assignPermissionToRole.bind(rbacController));
router.delete('/roles/:roleId/permissions/:permissionId', requirePermission('manage:rbac'), rbacController.removePermissionFromRole.bind(rbacController));

// User permission routes
router.get('/users/:userId/permissions', rbacController.getUserPermissions.bind(rbacController));

export { router as rbacRoutes };