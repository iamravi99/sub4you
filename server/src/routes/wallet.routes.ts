import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, WalletController.getWalletOverview);
router.get('/transactions', authMiddleware, WalletController.getTransactions);
router.post('/purchase-request', authMiddleware, WalletController.createPurchaseRequest);
router.get('/purchase-requests', authMiddleware, WalletController.getMyPurchaseRequests);

export default router;
