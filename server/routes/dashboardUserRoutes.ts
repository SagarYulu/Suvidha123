import { Router } from 'express';
import { dashboardUserController } from '../controllers/dashboardUserController';
import { authenticateToken, requireDashboardUser, requirePermission } from '../middleware/auth';

const router = Router();

// All dashboard user routes require authentication
router.use(authenticateToken);
router.use(requireDashboardUser);

// Dashboard user management routes
router.get('/', requirePermission('manage:dashboard_users'), dashboardUserController.getAllDashboardUsers.bind(dashboardUserController));
router.get('/:id', requirePermission('manage:dashboard_users'), dashboardUserController.getDashboardUserById.bind(dashboardUserController));
router.post('/', requirePermission('manage:dashboard_users'), dashboardUserController.createDashboardUser.bind(dashboardUserController));
router.put('/:id', requirePermission('manage:dashboard_users'), dashboardUserController.updateDashboardUser.bind(dashboardUserController));
router.delete('/:id', requirePermission('manage:dashboard_users'), dashboardUserController.deleteDashboardUser.bind(dashboardUserController));

// Bulk upload route
router.post('/bulk', requirePermission('manage:dashboard_users'), dashboardUserController.bulkCreateDashboardUsers.bind(dashboardUserController));

export { router as dashboardUserRoutes };