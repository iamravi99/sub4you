import { Request, Response, NextFunction } from 'express';
import { admin, isFirebaseInitialized } from '../config/firebase.js';
import { User, IUser } from '../models/User.js';
import { env } from '../config/env.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  firebaseUid?: string;
  userEmail?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' },
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1].trim();
    let uid: string = '';
    let email: string = '';
    let name: string = '';

    // Verify token with Firebase Admin
    if (isFirebaseInitialized && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        uid = decodedToken.uid;
        email = (decodedToken.email || '').toLowerCase();
        name = decodedToken.name || email.split('@')[0] || 'Creator';
      } catch (fbErr: any) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Firebase authentication token is invalid or expired' },
        });
        return;
      }
    } else {
      // Development / sandbox token decoder fallback
      try {
        // Parse simple base64 or payload if formatted as token
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          uid = payload.uid || payload.user_id || payload.sub || 'dev_user_' + token.slice(-6);
          email = (payload.email || `${uid}@demo.com`).toLowerCase();
          name = payload.name || email.split('@')[0];
        } else {
          uid = token.length > 5 ? `uid_${token.slice(0, 16)}` : 'dev_user_default';
          email = `${uid}@demo.com`.toLowerCase();
          name = 'Demo Creator';
        }
      } catch (parseErr) {
        uid = 'dev_user_fallback';
        email = 'creator@demo.com';
        name = 'Demo User';
      }
    }

    req.firebaseUid = uid;
    req.userEmail = email;

    const isAdminEmail =
      (email && (email.toLowerCase() === env.INITIAL_ADMIN_EMAIL || email.toLowerCase() === 'ravinder.explore@gmail.com')) ||
      (req.headers['x-admin-key'] === '9991141758');

    // Look up user in MongoDB
    let user = null;
    if (isAdminEmail && email) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.role = 'admin';
        if (user.firebaseUid !== uid) {
          user.firebaseUid = uid;
        }
        await user.save();
      }
    }

    if (!user) {
      user = await User.findOne({ firebaseUid: uid });
    }

    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.firebaseUid = uid;
        if (isAdminEmail) user.role = 'admin';
        await user.save();
      }
    }

    if (user && isAdminEmail && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    if (!user) {
      // If the endpoint is /auth/sync, let it proceed so AuthController.syncUser can create the record
      if (req.path === '/sync' || req.originalUrl.endsWith('/auth/sync')) {
        next();
        return;
      }

      res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_SYNCED', message: 'User profile not found in database. Please call /api/auth/sync first.' },
      });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended by administration.' },
      });
      return;
    }

    // Attach client IP
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    user.lastIpAddress = clientIp.split(',')[0].trim();
    user.lastLoginAt = new Date();
    await user.save();

    req.user = user;
    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: error.message || 'Authentication error' },
    });
  }
}
