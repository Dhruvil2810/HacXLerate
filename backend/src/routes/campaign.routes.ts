import { Router } from 'express';
import * as campaignController from '../controllers/campaign.controller.js';
import { authenticate, requireRole, optionalAuthenticate } from '../middleware/auth.middleware.js';

export const campaignRouter = Router();

// Public / Creator marketplace browsing
campaignRouter.get('/marketplace', optionalAuthenticate, campaignController.getMarketplaceCampaigns);

// Brand campaign management
campaignRouter.get('/brand', authenticate, requireRole(['BRAND']), campaignController.getBrandCampaigns);
campaignRouter.post('/', authenticate, requireRole(['BRAND']), campaignController.createCampaign);
campaignRouter.get('/:id', optionalAuthenticate, campaignController.getCampaignDetails);

// Creator application to campaign
campaignRouter.post('/:id/apply', authenticate, requireRole(['CREATOR']), campaignController.applyToCampaign);

// Brand application decision & creator invitations
campaignRouter.post('/:id/applications/:appId/decision', authenticate, requireRole(['BRAND']), campaignController.reviewApplication);
campaignRouter.post('/:id/invite', authenticate, requireRole(['BRAND']), campaignController.inviteCreator);
