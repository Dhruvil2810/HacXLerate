import { Router } from 'express';
import * as youtubeController from '../controllers/youtube.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

export const youtubeRouter = Router();

// OAuth callback is public
youtubeRouter.get('/callback', youtubeController.handleCallback);

// Protected creator actions
youtubeRouter.get('/connect', authenticate, requireRole(['CREATOR']), youtubeController.getConnectUrl);
youtubeRouter.post('/sync', authenticate, requireRole(['CREATOR']), youtubeController.syncChannel);
youtubeRouter.post('/manual-entry', authenticate, requireRole(['CREATOR']), youtubeController.recordManualEntry);
