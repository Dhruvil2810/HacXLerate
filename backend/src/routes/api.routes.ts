import { Router } from 'express';
import { sendSuccess } from '../utils/response.util.js';
import { authRouter } from './auth.routes.js';
import { onboardingRouter } from './onboarding.routes.js';
import { productRouter } from './product.routes.js';
import { campaignRouter } from './campaign.routes.js';
import { creatorRouter } from './creator.routes.js';
import { messagingRouter } from './messaging.routes.js';
import { creditRouter } from './credit.routes.js';
import { adminRouter } from './admin.routes.js';
import { aiRouter } from './ai.routes.js';
import { youtubeRouter } from './youtube.routes.js';
import performanceRouter from './performance.routes.js';

export const apiV1Router = Router();

// Base API information endpoint
apiV1Router.get('/', (req, res) => {
  return sendSuccess(res, {
    name: 'CreatorOS API',
    version: 'v1',
    description: 'AI-Native Creator Performance Marketplace API',
    docs: '/docs',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      onboarding: '/api/v1/onboarding',
      products: '/api/v1/products',
      campaigns: '/api/v1/campaigns',
      creators: '/api/v1/creators',
      messages: '/api/v1/messages',
      credits: '/api/v1/credits',
      admin: '/api/v1/admin',
      ai: '/api/v1/ai',
      youtube: '/api/v1/social/youtube',
      performance: '/api/v1/performance',
    },
  });
});

apiV1Router.get('/health', (req, res) => {
  return sendSuccess(res, {
    status: 'ok',
    api: 'v1',
    timestamp: new Date().toISOString(),
  });
});

// Mounted domain sub-routers
apiV1Router.use('/auth', authRouter);
apiV1Router.use('/onboarding', onboardingRouter);
apiV1Router.use('/products', productRouter);
apiV1Router.use('/campaigns', campaignRouter);
apiV1Router.use('/creators', creatorRouter);
apiV1Router.use('/messages', messagingRouter);
apiV1Router.use('/credits', creditRouter);
apiV1Router.use('/admin', adminRouter);
apiV1Router.use('/ai', aiRouter);
apiV1Router.use('/social/youtube', youtubeRouter);
apiV1Router.use('/performance', performanceRouter);
