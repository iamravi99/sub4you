import mongoose, { Document, Schema } from 'mongoose';
import { ROLES } from '../constants/index.js';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  role: 'user' | 'admin';
  coins: number;
  reservedCoins: number;
  totalEarned: number;
  totalSpent: number;
  campaignsCreated: number;
  completedActions: number;
  status: 'active' | 'suspended' | 'flagged';
  riskScore: number;
  lastIpAddress?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER, index: true },
    coins: { type: Number, default: 0, min: 0, index: true },
    reservedCoins: { type: Number, default: 0, min: 0 },
    totalEarned: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    campaignsCreated: { type: Number, default: 0, min: 0 },
    completedActions: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'suspended', 'flagged'], default: 'active', index: true },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    lastIpAddress: { type: String },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
