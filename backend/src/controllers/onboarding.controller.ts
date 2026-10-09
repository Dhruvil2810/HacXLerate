import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.util.js';
import * as onboardingService from '../services/onboarding.service.js';
import * as authService from '../services/auth.service.js';
import {
  brandOnboardingSchema,
  creatorOnboardingSchema,
} from '../validators/onboarding.validator.js';

export async function submitBrandOnboarding(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedInput = brandOnboardingSchema.parse(req.body);
    const userId = req.user!.userId;
    const profile = await onboardingService.completeBrandOnboarding(
      userId,
      validatedInput,
      req.ip,
      req.headers['user-agent']
    );
    const updatedUser = await authService.getAuthenticatedUser(userId, 'BRAND');
    sendSuccess(res, { profile, user: updatedUser }, 200);
  } catch (error) {
    next(error);
  }
}

export async function submitCreatorOnboarding(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedInput = creatorOnboardingSchema.parse(req.body);
    const userId = req.user!.userId;
    const profile = await onboardingService.completeCreatorOnboarding(
      userId,
      validatedInput,
      req.ip,
      req.headers['user-agent']
    );
    const updatedUser = await authService.getAuthenticatedUser(userId, 'CREATOR');
    sendSuccess(res, { profile, user: updatedUser }, 200);
  } catch (error) {
    next(error);
  }
}
