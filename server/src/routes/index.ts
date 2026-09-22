import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import walletRoutes from './wallet.routes.js';
import campaignRoutes from './campaign.routes.js';
import notificationRoutes from './notification.routes.js';
import adminRoutes from './admin.routes.js';

const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ONLINE',
    service: 'Sub4You API Engine',
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/wallet', walletRoutes);
apiRouter.use('/campaigns', campaignRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
