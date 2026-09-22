import mongoose, { Document, Schema, Types } from 'mongoose';
import { AUDIT_ACTIONS } from '../constants/index.js';

export interface IAuditLog extends Document {
  adminId: Types.ObjectId;
  action: string;
  targetType: 'USER' | 'CAMPAIGN' | 'PURCHASE_REQUEST' | 'VERIFICATION' | 'SETTINGS';
  targetId: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, enum: Object.values(AUDIT_ACTIONS), required: true, index: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
