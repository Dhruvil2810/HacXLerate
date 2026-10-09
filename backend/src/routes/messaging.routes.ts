import { Router } from 'express';
import * as messagingController from '../controllers/messaging.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const messagingRouter = Router();

// All messaging endpoints require authentication
messagingRouter.use(authenticate);

messagingRouter.get('/conversations', messagingController.getUserConversations);
messagingRouter.post('/conversations', messagingController.startConversation);
messagingRouter.get('/conversations/:id/messages', messagingController.getConversationMessages);
messagingRouter.post('/conversations/:id/messages', messagingController.sendMessage);
