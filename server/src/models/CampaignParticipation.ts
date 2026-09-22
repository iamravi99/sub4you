import mongoose, { Document, Schema, Types } from 'mongoose';
import { PARTICIPATION_STATUS } from '../constants/index.js';

export interface ICampaignParticipation extends Document {
  campaignId: Types.ObjectId;
  userId: Types.ObjectId;
  creatorId: Types.ObjectId;
  actionType: 'SUBSCRIBER' | 'LIKE';
  rewardAmount: number;
  status: 'PENDING' | 'VERIFIED' | 'FAILED' | 'REVIEW' | 'EXPIRED';
  riskScore: number;
  ipAddress?: string;
  userAgent?: string;
  youtubeAccountUsed?: string;
  verificationDetails?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignParticipationSchema = new Schema<ICampaignParticipation>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actionType: { type: String, enum: ['SUBSCRIBER', 'LIKE'], required: true },
    rewardAmount: { type: Number, required: true, default: 1 },
    status: { type: String, enum: Object.values(PARTICIPATION_STATUS), default: PARTICIPATION_STATUS.PENDING, index: true },
    riskScore: { type: Number, default: 0 },
    ipAddress: { type: String },
    userAgent: { type: String },
    youtubeAccountUsed: { type: String },
    verificationDetails: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Enforce unique participation per user per campaign
CampaignParticipationSchema.index({ campaignId: 1, userId: 1 }, { unique: true });

export const CampaignParticipation = mongoose.model<ICampaignParticipation>(
  'CampaignParticipation',
  CampaignParticipationSchema
);
