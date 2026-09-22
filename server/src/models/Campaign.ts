import mongoose, { Document, Schema, Types } from 'mongoose';
import { CAMPAIGN_STATUS, CAMPAIGN_TYPES } from '../constants/index.js';

export interface ICampaign extends Document {
  creatorId: Types.ObjectId;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  youtubeChannelId?: string;
  youtubeChannelTitle?: string;
  thumbnailUrl: string;
  type: 'SUBSCRIBER' | 'LIKE';
  costPerAction: number;
  targetQuantity: number;
  completedQuantity: number;
  remainingQuantity: number;
  totalBudget: number;
  reservedCoins: number;
  spentCoins: number;
  category: string;
  language: string;
  targetAudience?: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED' | 'REJECTED' | 'CANCELLED';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 1000 },
    youtubeUrl: { type: String, required: true, trim: true },
    youtubeVideoId: { type: String, required: true, index: true },
    youtubeChannelId: { type: String, trim: true },
    youtubeChannelTitle: { type: String, trim: true },
    thumbnailUrl: { type: String, required: true },
    type: { type: String, enum: Object.values(CAMPAIGN_TYPES), required: true, index: true },
    costPerAction: { type: Number, default: 1, min: 1 },
    targetQuantity: { type: Number, required: true, min: 1 },
    completedQuantity: { type: Number, default: 0, min: 0 },
    remainingQuantity: { type: Number, required: true, min: 0 },
    totalBudget: { type: Number, required: true, min: 1 },
    reservedCoins: { type: Number, required: true, min: 0 },
    spentCoins: { type: Number, default: 0, min: 0 },
    category: { type: String, default: 'General' },
    language: { type: String, default: 'English' },
    targetAudience: { type: String, default: 'All' },
    status: { type: String, enum: Object.values(CAMPAIGN_STATUS), default: CAMPAIGN_STATUS.ACTIVE, index: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },
  { timestamps: true }
);

CampaignSchema.index({ status: 1, createdAt: -1 });
CampaignSchema.index({ type: 1, status: 1 });

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
