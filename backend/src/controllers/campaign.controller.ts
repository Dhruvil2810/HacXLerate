import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.util.js';
import * as campaignService from '../services/campaign.service.js';
import {
  createCampaignSchema,
  applyCampaignSchema,
  reviewApplicationSchema,
  inviteCreatorSchema,
} from '../validators/campaign.validator.js';

export async function createCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createCampaignSchema.parse(req.body);
    const userId = req.user!.userId;
    const campaign = await campaignService.createCampaign(userId, input, req.ip, req.headers['user-agent']);
    sendSuccess(res, { campaign }, 201);
  } catch (error) {
    next(error);
  }
}

export async function getBrandCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const campaigns = await campaignService.getBrandCampaigns(userId);
    sendSuccess(res, { campaigns }, 200);
  } catch (error) {
    next(error);
  }
}

export async function getMarketplaceCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, platform } = req.query as { category?: string; platform?: string };
    const campaigns = await campaignService.getMarketplaceCampaigns({ category, platform });
    sendSuccess(res, { campaigns }, 200);
  } catch (error) {
    next(error);
  }
}

export async function getCampaignDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const campaign = await campaignService.getCampaignDetails(req.params.id);
    sendSuccess(res, { campaign }, 200);
  } catch (error) {
    next(error);
  }
}

export async function applyToCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = applyCampaignSchema.parse(req.body);
    const userId = req.user!.userId;
    const application = await campaignService.applyToCampaign(userId, req.params.id, input, req.ip, req.headers['user-agent']);
    sendSuccess(res, { application }, 201);
  } catch (error) {
    next(error);
  }
}

export async function reviewApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = reviewApplicationSchema.parse(req.body);
    const userId = req.user!.userId;
    const application = await campaignService.reviewApplication(
      userId,
      req.params.id,
      req.params.appId,
      input,
      req.ip,
      req.headers['user-agent']
    );
    sendSuccess(res, { application }, 200);
  } catch (error) {
    next(error);
  }
}

export async function inviteCreator(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = inviteCreatorSchema.parse(req.body);
    const userId = req.user!.userId;
    const invitation = await campaignService.inviteCreator(userId, req.params.id, input);
    sendSuccess(res, { invitation }, 200);
  } catch (error) {
    next(error);
  }
}
