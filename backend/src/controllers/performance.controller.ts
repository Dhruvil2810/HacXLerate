import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.util.js';
import * as performanceService from '../services/performance.service.js';
import { 
  submitContentSchema, 
  reviewContentSchema, 
  evaluateContentSchema 
} from '../validators/performance.validator.js';

export async function submitContent(req: Request, res: Response, next: NextFunction) {
  try {
    const input = submitContentSchema.parse(req.body);
    const content = await performanceService.submitPublishedContent(
      req.user!.userId,
      input,
      req.ip,
      req.get('user-agent')
    );
    sendSuccess(res, content, 201, { message: 'Published content link registered for live incremental tracking' });
  } catch (error) {
    next(error);
  }
}

export async function reviewContent(req: Request, res: Response, next: NextFunction) {
  try {
    const { contentId } = req.params;
    const input = reviewContentSchema.parse(req.body);
    const result = await performanceService.reviewPublishedContent(
      req.user!.userId,
      contentId,
      input,
      req.ip,
      req.get('user-agent')
    );
    sendSuccess(res, result, 200, { message: 'Content review recorded' });
  } catch (error) {
    next(error);
  }
}

export async function evaluateContent(req: Request, res: Response, next: NextFunction) {
  try {
    const { contentId } = req.params;
    const input = req.body && Object.keys(req.body).length > 0 ? evaluateContentSchema.parse(req.body) : undefined;
    const result = await performanceService.evaluateIncrementalPerformance(
      contentId,
      input,
      req.user?.userId
    );
    sendSuccess(res, result, 200, { message: 'Incremental verified performance evaluated and rewards distributed' });
  } catch (error) {
    next(error);
  }
}

export async function getCampaignContents(req: Request, res: Response, next: NextFunction) {
  try {
    const { campaignId } = req.params;
    const contents = await performanceService.getCampaignPublishedContent(campaignId);
    sendSuccess(res, contents, 200);
  } catch (error) {
    next(error);
  }
}

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { campaignId } = req.params;
    const data = await performanceService.getCampaignLeaderboard(campaignId);
    sendSuccess(res, data, 200);
  } catch (error) {
    next(error);
  }
}

export async function getBrandAnalyticsSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const summary = await performanceService.getBrandPerformanceSummary(req.user!.userId);
    sendSuccess(res, summary, 200);
  } catch (error) {
    next(error);
  }
}

export async function getCreatorPerformanceSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const summary = await performanceService.getCreatorPerformanceSummary(req.user!.userId);
    sendSuccess(res, summary, 200);
  } catch (error) {
    next(error);
  }
}
