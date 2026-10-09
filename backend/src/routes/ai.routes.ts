import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const aiRouter = Router();

aiRouter.use(authenticate);

aiRouter.post('/product-analyze', aiController.analyzeProduct);
aiRouter.post('/campaign-assist', aiController.assistCampaignBrief);
aiRouter.post('/creator-match', aiController.explainMatch);
