import { Router } from 'express';
import * as creatorController from '../controllers/creator.controller.js';
import { authenticate, requireRole, optionalAuthenticate } from '../middleware/auth.middleware.js';

export const creatorRouter = Router();

// Search & profile viewing
creatorRouter.get('/', optionalAuthenticate, creatorController.searchCreators);
creatorRouter.get('/:id', optionalAuthenticate, creatorController.getCreatorProfile);

// Portfolio management (Creator only)
creatorRouter.post('/portfolio', authenticate, requireRole(['CREATOR']), creatorController.addPortfolioItem);
creatorRouter.delete('/portfolio/:id', authenticate, requireRole(['CREATOR']), creatorController.deletePortfolioItem);
