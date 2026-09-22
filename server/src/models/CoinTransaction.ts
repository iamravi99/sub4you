import mongoose, { Document, Schema, Types } from 'mongoose';
import { TRANSACTION_TYPES } from '../constants/index.js';

export interface ICoinTransaction extends Document {
  userId: Types.ObjectId;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: Types.ObjectId;
  referenceType?: string;
  description: string;
  createdAt: Date;
}

const CoinTransactionSchema = new Schema<ICoinTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(TRANSACTION_TYPES), required: true, index: true },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    referenceId: { type: Schema.Types.ObjectId },
    referenceType: { type: String },
    description: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CoinTransactionSchema.index({ userId: 1, createdAt: -1 });

export const CoinTransaction = mongoose.model<ICoinTransaction>('CoinTransaction', CoinTransactionSchema);
