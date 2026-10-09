import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as performanceController from '../controllers/performance.controller.js';

export const performanceRouter = Router();

// Creator submits published content link
performanceRouter.post('/content/submit', authenticate, performanceController.submitContent);

// Get published content for a campaign
performanceRouter.get('/content/campaign/:campaignId', authenticate, performanceController.getCampaignContents);

// Brand reviews/approves/flags content
performanceRouter.patch('/content/:contentId/review', authenticate, performanceController.reviewContent);

// Trigger incremental performance check & CPM payout distribution
performanceRouter.post('/content/:contentId/evaluate', authenticate, performanceController.evaluateContent);

// Campaign performance leaderboard
performanceRouter.get('/campaign/:campaignId/leaderboard', authenticate, performanceController.getLeaderboard);

// Brand aggregate performance metrics
performanceRouter.get('/brand/analytics', authenticate, performanceController.getBrandAnalyticsSummary);

// Creator performance metrics across campaigns
performanceRouter.get('/creator/summary', authenticate, performanceController.getCreatorPerformanceSummary);

export default performanceRouter;
