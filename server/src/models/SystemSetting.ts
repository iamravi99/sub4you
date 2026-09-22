import mongoose, { Document, Schema, Types } from 'mongoose';
import { DEFAULT_COIN_PACKAGES } from '../constants/index.js';

export interface ISystemSetting extends Document {
  coinPackages: Array<{ id: string; coins: number; price: number; label: string; popular: boolean }>;
  campaignMinBudget: number;
  campaignMaxBudget: number;
  maxActiveCampaignsPerUser: number;
  rewardRates: { subscriber: number; like: number };
  newUserBonusCoins: number;
  referralBonusCoins: number;
  fraudThresholdReview: number;
  fraudThresholdBlock: number;
  maintenanceMode: boolean;
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    coinPackages: {
      type: [
        {
          id: String,
          coins: Number,
          price: Number,
          label: String,
          popular: Boolean,
        },
      ],
      default: DEFAULT_COIN_PACKAGES,
    },
    campaignMinBudget: { type: Number, default: 10 },
    campaignMaxBudget: { type: Number, default: 10000 },
    maxActiveCampaignsPerUser: { type: Number, default: 10 },
    rewardRates: {
      subscriber: { type: Number, default: 1 },
      like: { type: Number, default: 1 },
    },
    newUserBonusCoins: { type: Number, default: 25 }, // Free 25 bonus coins on signup for instant testing!
    referralBonusCoins: { type: Number, default: 50 },
    fraudThresholdReview: { type: Number, default: 30 },
    fraudThresholdBlock: { type: Number, default: 70 },
    maintenanceMode: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const SystemSetting = mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);
