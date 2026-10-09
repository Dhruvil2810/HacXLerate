import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.util.js';
import * as aiService from '../services/ai/ai.service.js';
import { z } from 'zod';

const analyzeProductRequestSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().min(5),
  websiteUrl: z.string().optional(),
  usp: z.string().optional(),
});

const assistCampaignRequestSchema = z.object({
  title: z.string().min(2),
  objective: z.string().min(2),
  rewardModel: z.string().default('CPM'),
  cpmRate: z.coerce.number().default(50),
  categories: z.array(z.string()).default([]),
  description: z.string().min(5),
});

const explainMatchRequestSchema = z.object({
  campaign: z.object({
    title: z.string(),
    categories: z.array(z.string()),
    cpmRate: z.coerce.number().default(50),
  }),
  creator: z.object({
    handle: z.string(),
    categories: z.array(z.string()),
    skills: z.array(z.string()).default([]),
    bio: z.string().optional(),
  }),
});

export async function analyzeProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = analyzeProductRequestSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await aiService.analyzeProductWithAI(userId, input);
    sendSuccess(res, { analysis: result, creditCost: 10 }, 200);
  } catch (error) {
    next(error);
  }
}

export async function assistCampaignBrief(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = assistCampaignRequestSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await aiService.assistCampaignBriefWithAI(userId, input);
    sendSuccess(res, { brief: result, creditCost: 10 }, 200);
  } catch (error) {
    next(error);
  }
}

export async function explainMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = explainMatchRequestSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await aiService.explainCreatorMatch(userId, input.campaign, input.creator);
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}

const generatePitchRequestSchema = z.object({
  campaign: z.object({
    title: z.string(),
    objective: z.string().optional(),
    categories: z.array(z.string()).default([]),
    description: z.string().optional(),
    cpmRate: z.coerce.number().default(50),
  }),
  creator: z.object({
    handle: z.string(),
    categories: z.array(z.string()).default([]),
    bio: z.string().optional(),
  }),
});

export async function generatePitch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = generatePitchRequestSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await aiService.generatePitchProposalWithAI(userId, input.campaign, input.creator);
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}
