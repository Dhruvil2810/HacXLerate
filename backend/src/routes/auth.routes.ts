import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/security.middleware.js';

export const authRouter = Router();

// Public auth routes
authRouter.post('/register', authRateLimiter, authController.register);
authRouter.post('/login', authRateLimiter, authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);

// Protected auth routes
authRouter.get('/me', authenticate, authController.getMe);
authRouter.post('/switch-role', authenticate, authController.switchRole);
