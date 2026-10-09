import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.util.js';
import * as creatorService from '../services/creator.service.js';
import { addPortfolioItemSchema, searchCreatorsSchema } from '../validators/creator.validator.js';

export async function searchCreators(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = searchCreatorsSchema.parse(req.query);
    const result = await creatorService.searchCreators(filters);
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}

export async function getCreatorProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const creator = await creatorService.getCreatorProfileByIdOrHandle(req.params.id);
    sendSuccess(res, { creator }, 200);
  } catch (error) {
    next(error);
  }
}

export async function addPortfolioItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = addPortfolioItemSchema.parse(req.body);
    const userId = req.user!.userId;
    const item = await creatorService.addPortfolioItem(userId, input);
    sendSuccess(res, { item }, 201);
  } catch (error) {
    next(error);
  }
}

export async function deletePortfolioItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await creatorService.deletePortfolioItem(userId, req.params.id);
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}
