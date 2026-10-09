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

const linkChannelSchema = z.object({
  channelUrl: z.string().min(1, 'Channel URL or handle is required'),
});

export async function linkChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = linkChannelSchema.parse(req.body);
    const userId = req.user!.userId;
    const channel = await youtubeService.linkChannelByUrl(userId, input.channelUrl, req.ip, req.headers['user-agent']);
    sendSuccess(res, { channel, message: 'YouTube channel linked and verified successfully' }, 200);
  } catch (error) {
    next(error);
  }
}

const analyzeVideoSchema = z.object({
  videoUrl: z.string().min(1, 'YouTube video URL is required'),
});

export async function analyzeVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = analyzeVideoSchema.parse(req.body);
    const analysis = await youtubeService.analyzeVideoByUrl(input.videoUrl);
    sendSuccess(res, { analysis, message: 'Video analytics fetched and analyzed successfully' }, 200);
  } catch (error) {
    next(error);
  }
}

const addVideoSchema = z.object({
  videoUrl: z.string().min(1, 'YouTube video URL is required'),
  title: z.string().optional(),
  category: z.string().optional(),
  toolsUsed: z.array(z.string()).optional(),
});

export async function addVideoToPortfolio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = addVideoSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await youtubeService.addVideoToPortfolio(userId, input);
    sendSuccess(res, { ...result, message: 'YouTube video added to portfolio with live verified metrics' }, 201);
  } catch (error) {
    next(error);
  }
}
