import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.util.js';
import * as youtubeService from '../services/social/youtube.service.js';
import { z } from 'zod';

const manualAnalyticsSchema = z.object({
  subscriberCount: z.coerce.number().min(0),
  averageViews: z.coerce.number().min(0),
  totalViews: z.coerce.number().min(0),
  notes: z.string().max(500).optional(),
});

export async function getChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const channel = await youtubeService.getCreatorYouTubeChannel(userId);
    sendSuccess(res, { channel }, 200);
  } catch (error) {
    next(error);
  }
}

export async function getConnectUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const authUrl = youtubeService.getYouTubeAuthUrl(userId);
    sendSuccess(res, { authUrl }, 200);
  } catch (error) {
    next(error);
  }
}

export async function handleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code || !state) {
      res.status(400).send('Missing code or state in OAuth callback');
      return;
    }
    await youtubeService.handleYouTubeOAuthCallback(code, state, req.ip, req.headers['user-agent']);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/?tab=youtube&connected=true`);
  } catch (error) {
    next(error);
  }
}

export async function syncChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await youtubeService.syncYouTubeChannel(userId, req.ip, req.headers['user-agent']);
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}

export async function recordManualEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = manualAnalyticsSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await youtubeService.recordManualAnalytics(userId, input, req.ip, req.headers['user-agent']);
    sendSuccess(res, { socialAccount: result }, 201);
  } catch (error) {
    next(error);
  }
}

const uploadReportSchema = z.object({
  fileName: z.string().min(1).max(255),
  estimatedViews: z.coerce.number().min(0).optional(),
  estimatedSubs: z.coerce.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export async function uploadReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = uploadReportSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await youtubeService.recordUploadedReport(userId, input, req.ip, req.headers['user-agent']);
    sendSuccess(res, { socialAccount: result, message: 'Analytics evidence report uploaded successfully' }, 201);
  } catch (error) {
    next(error);
  }
}
