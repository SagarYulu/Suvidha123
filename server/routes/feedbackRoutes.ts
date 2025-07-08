import { Router } from 'express';
import { feedbackController } from '../controllers/feedbackController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All feedback routes require authentication
router.use(authenticateToken);

// Feedback routes
router.get('/ticket-feedback', feedbackController.getAllFeedback.bind(feedbackController));
router.post('/ticket-feedback', feedbackController.submitFeedback.bind(feedbackController));
router.post('/ticket-feedback/bulk', feedbackController.checkBulkFeedback.bind(feedbackController));

// Analytics route
router.get('/feedback/analytics', feedbackController.getFeedbackAnalytics.bind(feedbackController));

export { router as feedbackRoutes };