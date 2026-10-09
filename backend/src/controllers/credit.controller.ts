import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.util.js';
import * as creditService from '../services/credit.service.js';
import { getLedgerQuerySchema, adminAdjustCreditsSchema } from '../validators/credit.validator.js';

export async function getBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const wallet = await creditService.getUserWallet(userId);
    sendSuccess(res, { wallet }, 200);
  } catch (error) {
    next(error);
  }
}

export async function getLedger(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const query = getLedgerQuerySchema.parse(req.query);
    const result = await creditService.getUserLedger(userId, query);
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}

export async function adminAdjustCredits(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminUserId = req.user!.userId;
    const input = adminAdjustCreditsSchema.parse(req.body);
    const result = await creditService.adminAdjustCredits(adminUserId, input, req.ip, req.headers['user-agent']);
    sendSuccess(res, { transaction: result }, 200);
  } catch (error) {
    next(error);
  }
}
