import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.util.js';
import * as messagingService from '../services/messaging.service.js';
import { createConversationSchema, sendMessageSchema } from '../validators/message.validator.js';

export async function getUserConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const conversations = await messagingService.getUserConversations(userId);
    sendSuccess(res, { conversations }, 200);
  } catch (error) {
    next(error);
  }
}

export async function getConversationMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const messages = await messagingService.getConversationMessages(userId, req.params.id);
    sendSuccess(res, { messages }, 200);
  } catch (error) {
    next(error);
  }
}

export async function startConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createConversationSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await messagingService.startConversation(userId, input);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = sendMessageSchema.parse(req.body);
    const userId = req.user!.userId;
    const message = await messagingService.sendMessage(userId, req.params.id, input);
    sendSuccess(res, { message }, 201);
  } catch (error) {
    next(error);
  }
}
