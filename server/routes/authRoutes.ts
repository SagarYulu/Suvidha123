import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', authController.login.bind(authController));
router.post('/mobile-verify', authController.mobileVerify.bind(authController));

// Protected routes
router.get('/verify', authMiddleware, authController.verify.bind(authController));
router.post('/logout', authMiddleware, authController.logout.bind(authController));

export { router as authRoutes };