import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVerificationRecord extends Document {
  participationId: Types.ObjectId;
  campaignId: Types.ObjectId;
  userId: Types.ObjectId;
  youtubeAccount?: string;
  verificationMethod: 'OAUTH_API' | 'PUBLIC_API' | 'MANUAL_ADMIN_REVIEW' | 'AUTO_CHECK';
  apiResponsePayload?: Record<string, any>;
  status: 'PENDING' | 'VERIFIED' | 'FAILED' | 'REVIEW';
  riskScore: number;
  reviewedBy?: Types.ObjectId;
  adminReviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationRecordSchema = new Schema<IVerificationRecord>(
  {
    participationId: { type: Schema.Types.ObjectId, ref: 'CampaignParticipation', required: true, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    youtubeAccount: { type: String },
    verificationMethod: {
      type: String,
      enum: ['OAUTH_API', 'PUBLIC_API', 'MANUAL_ADMIN_REVIEW', 'AUTO_CHECK'],
      default: 'AUTO_CHECK',
    },
    apiResponsePayload: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['PENDING', 'VERIFIED', 'FAILED', 'REVIEW'], default: 'PENDING', index: true },
    riskScore: { type: Number, default: 0 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    adminReviewNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const VerificationRecord = mongoose.model<IVerificationRecord>(
  'VerificationRecord',
  VerificationRecordSchema
);
