import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { SystemSetting } from './models/SystemSetting.js';
import { User } from './models/User.js';
import { Campaign } from './models/Campaign.js';
import { CoinLedgerService } from './services/coinLedger.service.js';
import { CAMPAIGN_STATUS, CAMPAIGN_TYPES, TRANSACTION_TYPES } from './constants/index.js';

async function bootstrap() {
  await connectDB();

  // Seed default settings if empty
  let settings = await SystemSetting.findOne();
  if (!settings) {
    settings = await SystemSetting.create({});
    console.log('[Bootstrap] Initialized default system settings and coin packages');
  }

  // Ensure default Admin user exists
  const adminEmail = (env.INITIAL_ADMIN_EMAIL || 'ravinder.explore@gmail.com').toLowerCase();
  let adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    adminUser = await User.create({
      firebaseUid: 'admin_ravinder_main',
      email: adminEmail,
      name: 'Ravinder (Administrator)',
      username: 'ravinder_admin',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ravinder_admin',
      bio: 'Platform Lead & Administrator',
      role: 'admin',
      coins: 10000,
      totalEarned: 10000,
      status: 'active',
    });
    console.log(`[Bootstrap] Default Admin account established: ${adminEmail}`);
  } else if (adminUser.role !== 'admin') {
    adminUser.role = 'admin';
    await adminUser.save();
    console.log(`[Bootstrap] Promoted ${adminEmail} to Administrator`);
  }

  // Clean up any legacy dummy/showcase users or campaigns
  await User.deleteMany({ email: { $in: ['creator@sub4you.com', 'alex.creator@sub4you.com', 'nexus_gaming@sub4you.com'] } });
  await Campaign.deleteMany({ youtubeChannelTitle: 'Nexus Gaming & Tech' });
  console.log('[Bootstrap] Database verified: Zero dummy data present.');

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`[Server] Sub4You Backend API running at http://localhost:${env.PORT}`);
    console.log(`[Server] Health check available at http://localhost:${env.PORT}/api/health`);
  });
}

bootstrap().catch((err) => {
  console.error('[Server Boot Error]', err);
  process.exit(1);
});
