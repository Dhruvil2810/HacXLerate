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
    const result = await youtubeService.handleYouTubeOAuthCallback(code, state, req.ip, req.headers['user-agent']);
    // Redirect to frontend creator dashboard
    res.redirect('/?tab=youtube&connected=true');
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
