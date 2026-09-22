import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { Notification } from '../models/Notification.js';

export class NotificationController {
  /**
   * Get user notifications
   */
  static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 30;
      const skip = (page - 1) * limit;

      const [notifications, unreadCount, total] = await Promise.all([
        Notification.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Notification.countDocuments({ userId: user._id, isRead: false }),
        Notification.countDocuments({ userId: user._id }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          notifications,
          unreadCount,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'NOTIFICATIONS_FETCH_FAILED', message: error.message },
      });
    }
  }

  /**
   * Mark single notification as read
   */
  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { id } = req.params;

      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId: user._id },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({
          success: false,
          error: { code: 'NOTIFICATION_NOT_FOUND', message: 'Notification not found' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { notification },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'MARK_READ_FAILED', message: error.message },
      });
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      await Notification.updateMany({ userId: user._id, isRead: false }, { isRead: true });

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'MARK_ALL_READ_FAILED', message: error.message },
      });
    }
  }
}
