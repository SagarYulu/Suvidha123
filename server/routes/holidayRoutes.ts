import { Router } from 'express';
import { holidayController } from '../controllers/holidayController';
import { authenticateToken, requireDashboardUser } from '../middleware/auth';

const router = Router();

// All holiday routes require authentication and dashboard user access
router.use(authenticateToken);
router.use(requireDashboardUser);

// Get all holidays
router.get('/', holidayController.getHolidays);

// Get holidays by year
router.get('/year/:year', holidayController.getHolidaysByYear);

// Get specific holiday
router.get('/:id', holidayController.getHoliday);

// Create new holiday
router.post('/', holidayController.createHoliday);

// Bulk upload holidays
router.post('/bulk', holidayController.bulkUploadHolidays);

// Update holiday
router.put('/:id', holidayController.updateHoliday);

// Delete holiday
router.delete('/:id', holidayController.deleteHoliday);

export default router;