import { Router } from 'express';
import { employeeController } from '../controllers/employeeController';
import { authMiddleware } from '../middleware/auth';
import { rbacMiddleware } from '../middleware/rbac';

const router = Router();

// Protected routes - Dashboard users only
router.get('/', authMiddleware, rbacMiddleware(['view:tickets_all', 'manage:users']), employeeController.getEmployees.bind(employeeController));
router.get('/:id', authMiddleware, rbacMiddleware(['view:tickets_all', 'manage:users']), employeeController.getEmployee.bind(employeeController));
router.post('/', authMiddleware, rbacMiddleware(['manage:users']), employeeController.createEmployee.bind(employeeController));
router.put('/:id', authMiddleware, rbacMiddleware(['manage:users']), employeeController.updateEmployee.bind(employeeController));
router.delete('/:id', authMiddleware, rbacMiddleware(['manage:users']), employeeController.deleteEmployee.bind(employeeController));

// Bulk operations
router.post('/bulk', authMiddleware, rbacMiddleware(['manage:users']), employeeController.bulkCreateEmployees.bind(employeeController));

// Employee profile route
router.get('/profile/me', authMiddleware, employeeController.getProfile.bind(employeeController));

export { router as employeeRoutes };