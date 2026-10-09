import { Router } from 'express';
import * as creditController from '../controllers/credit.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const creditRouter = Router();

creditRouter.use(authenticate);

creditRouter.get('/balance', creditController.getBalance);
creditRouter.get('/ledger', creditController.getLedger);
creditRouter.post('/top-up', creditController.topUpCredits);
