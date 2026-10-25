export type NotificationType = 'campaign' | 'donation' | 'expense';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string; // an app address such as /donor/donations/GCash_123, opened when tapped
  isRead: boolean;
  createdAt: string; // ISO date string
}