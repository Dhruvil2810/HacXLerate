import { Router } from 'express';
import * as onboardingController from '../controllers/onboarding.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

export const onboardingRouter = Router();

onboardingRouter.post('/brand', authenticate, requireRole(['BRAND']), onboardingController.submitBrandOnboarding);
onboardingRouter.post('/creator', authenticate, requireRole(['CREATOR']), onboardingController.submitCreatorOnboarding);
