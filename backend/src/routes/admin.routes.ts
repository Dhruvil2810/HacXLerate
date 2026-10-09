import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as creditController from '../controllers/credit.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

export const adminRouter = Router();

// All admin routes require ADMIN role
adminRouter.use(authenticate, requireRole(['ADMIN']));

adminRouter.get('/overview', adminController.getOverview);
adminRouter.get('/users', adminController.getUsers);
adminRouter.put('/users/:id/status', adminController.updateUserStatus);
adminRouter.get('/audit-logs', adminController.getAuditLogs);
adminRouter.post('/credits/adjust', creditController.adminAdjustCredits);
