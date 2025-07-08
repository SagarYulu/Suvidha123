import { Router } from 'express';
import { slaController } from '../controllers/slaController';
import { authenticateToken, requireDashboardUser, requirePermission } from '../middleware/auth';

const router = Router();

// All SLA routes require authentication and dashboard user access
router.use(authenticateToken);
router.use(requireDashboardUser);

// SLA metrics and monitoring routes
router.get('/metrics', requirePermission('view:issue_analytics'), slaController.getSLAMetrics.bind(slaController));
router.get('/alerts', requirePermission('view:issue_analytics'), slaController.getSLAAlerts.bind(slaController));
router.get('/breaches', requirePermission('view:issue_analytics'), slaController.getSLABreaches.bind(slaController));

// SLA configuration routes
router.get('/config', slaController.getSLAConfig.bind(slaController));
router.put('/config', requirePermission('manage:tickets_all'), slaController.updateSLAConfig.bind(slaController));

export { router as slaRoutes };