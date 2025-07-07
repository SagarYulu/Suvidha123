import { Router } from 'express';
import { employeeController } from '../controllers/employeeController';
import { authMiddleware } from '../middleware/auth';
import { rbacMiddleware } from '../middleware/rbac';

const router = Router();

// Protected routes - Dashboard users only
router.get('/', authMiddleware, rbacMiddleware(['tickets:view_all', 'users:view']), employeeController.getEmployees.bind(employeeController));
router.get('/:id', authMiddleware, rbacMiddleware(['tickets:view_all', 'users:view']), employeeController.getEmployee.bind(employeeController));
router.post('/', authMiddleware, rbacMiddleware(['users:create']), employeeController.createEmployee.bind(employeeController));
router.put('/:id', authMiddleware, rbacMiddleware(['users:edit']), employeeController.updateEmployee.bind(employeeController));
router.delete('/:id', authMiddleware, rbacMiddleware(['users:delete']), employeeController.deleteEmployee.bind(employeeController));

// Bulk operations
router.post('/bulk', authMiddleware, rbacMiddleware(['users:create']), employeeController.bulkCreateEmployees.bind(employeeController));

// Employee profile route
router.get('/profile/me', authMiddleware, employeeController.getProfile.bind(employeeController));

export { router as employeeRoutes };