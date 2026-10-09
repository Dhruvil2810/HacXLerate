import { Router } from 'express';
import * as youtubeController from '../controllers/youtube.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

export const youtubeRouter = Router();

// OAuth callback is public
youtubeRouter.get('/callback', youtubeController.handleCallback);

// Protected creator actions
youtubeRouter.get('/channel', authenticate, requireRole(['CREATOR']), youtubeController.getChannel);
youtubeRouter.get('/connect', authenticate, requireRole(['CREATOR']), youtubeController.getConnectUrl);
youtubeRouter.get('/oauth/url', authenticate, requireRole(['CREATOR']), youtubeController.getConnectUrl);
youtubeRouter.post('/sync', authenticate, requireRole(['CREATOR']), youtubeController.syncChannel);
youtubeRouter.post('/manual-entry', authenticate, requireRole(['CREATOR']), youtubeController.recordManualEntry);
youtubeRouter.post('/upload-report', authenticate, requireRole(['CREATOR']), youtubeController.uploadReport);
youtubeRouter.post('/link-channel', authenticate, requireRole(['CREATOR']), youtubeController.linkChannel);
youtubeRouter.post('/analyze-video', authenticate, requireRole(['CREATOR']), youtubeController.analyzeVideo);
youtubeRouter.post('/add-video', authenticate, requireRole(['CREATOR']), youtubeController.addVideoToPortfolio);
