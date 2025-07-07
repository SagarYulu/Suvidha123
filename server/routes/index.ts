import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { employeeRoutes } from './employeeRoutes';
import { issueRoutes } from './issueRoutes';
import holidayRoutes from './holidayRoutes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/issues', issueRoutes);
router.use('/holidays', holidayRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { router as apiRoutes };