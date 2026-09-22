import { Types } from 'mongoose';
import { Notification, INotification } from '../models/Notification.js';

export class NotificationService {
  static async sendNotification(params: {
    userId: string | Types.ObjectId;
    type: string;
    title: string;
    message: string;
    link?: string;
  }): Promise<INotification> {
    const notification = await Notification.create({
      userId: new Types.ObjectId(params.userId.toString()),
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      isRead: false,
    });
    return notification;
  }
}
