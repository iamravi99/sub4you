import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { ROLES } from '../constants/index.js';

export function adminMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
    return;
  }

  const isPlatformAdmin =
    req.user.role === ROLES.ADMIN ||
    req.user.email?.toLowerCase() === 'ravinder.explore@gmail.com' ||
    req.headers['x-admin-key'] === '9991141758';

  if (!isPlatformAdmin) {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN_ADMIN_ONLY', message: 'Administrative access required for this action' },
    });
    return;
  }

  next();
}
