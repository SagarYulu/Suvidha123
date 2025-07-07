import { Router } from 'express';
import { issueController } from '../controllers/issueController';
import { authMiddleware } from '../middleware/auth';
import { rbacMiddleware } from '../middleware/rbac';

const router = Router();

// General issue routes
router.get('/', authMiddleware, rbacMiddleware(['tickets:view_all', 'tickets:view_assigned']), issueController.getIssues.bind(issueController));
router.get('/stats', authMiddleware, rbacMiddleware(['analytics:view_issue']), issueController.getStatistics.bind(issueController));
router.get('/:id', authMiddleware, issueController.getIssue.bind(issueController));
router.post('/', authMiddleware, issueController.createIssue.bind(issueController));
router.put('/:id', authMiddleware, rbacMiddleware(['tickets:view_all', 'tickets:view_assigned']), issueController.updateIssue.bind(issueController));
router.delete('/:id', authMiddleware, rbacMiddleware(['tickets:view_all']), issueController.deleteIssue.bind(issueController));

// Specific issue operations
router.get('/my/issues', authMiddleware, issueController.getMyIssues.bind(issueController));
router.get('/assigned/me', authMiddleware, issueController.getAssignedIssues.bind(issueController));
router.put('/:id/assign', authMiddleware, rbacMiddleware(['tickets:view_all', 'tickets:view_assigned']), issueController.assignIssue.bind(issueController));
router.patch('/:id/status', authMiddleware, issueController.updateStatus.bind(issueController));

export { router as issueRoutes };