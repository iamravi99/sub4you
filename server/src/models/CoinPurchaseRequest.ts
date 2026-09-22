import mongoose, { Document, Schema, Types } from 'mongoose';
import { PURCHASE_STATUS } from '../constants/index.js';

export interface ICoinPurchaseRequest extends Document {
  requestId: string;
  userId: Types.ObjectId;
  coinAmount: number;
  price: number;
  currency: string;
  paymentMethod: string;
  paymentNotes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  adminNotes?: string;
  processedBy?: Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CoinPurchaseRequestSchema = new Schema<ICoinPurchaseRequest>(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    coinAmount: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    paymentMethod: { type: String, default: 'ADMIN_MANUAL_REVIEW' },
    paymentNotes: { type: String, default: '' },
    status: { type: String, enum: Object.values(PURCHASE_STATUS), default: PURCHASE_STATUS.PENDING, index: true },
    adminNotes: { type: String, default: '' },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

CoinPurchaseRequestSchema.index({ status: 1, createdAt: -1 });

export const CoinPurchaseRequest = mongoose.model<ICoinPurchaseRequest>(
  'CoinPurchaseRequest',
  CoinPurchaseRequestSchema
);
