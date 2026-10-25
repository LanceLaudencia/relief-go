import { computed, ref } from 'vue';
import {
  limitToLast,
  onValue,
  orderByChild,
  push,
  query,
  ref as dbRef,
  remove,
  update,
} from 'firebase/database';
import type { DataSnapshot } from 'firebase/database';
import { rtdb } from '../firebase/config';
import type { AppNotification, NotificationType } from '../models/Notification';

export interface NotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  link: string;
}

/**
 * Builds the database entry for a notification, to be added to an admin's
 * multi-path update(). That way the action and its notification are saved
 * together or not at all. Only admins can create notifications (database rules).
 */
export function notificationUpdate(userId: string, input: NotificationInput): Record<string, unknown> {
  const key = push(dbRef(rtdb, `notifications/${userId}`)).key as string;
  return {
    [`notifications/${userId}/${key}`]: {
      id: key,
      userId,
      type: input.type,
      title: input.title.slice(0, 150),
      message: input.message.slice(0, 500),
      link: input.link,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  };
}

/* ---------- The logged-in person's notifications (live) ---------- */

export const notifications = ref<AppNotification[]>([]);
export const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length);

let stopListening: (() => void) | null = null;
let listeningFor = '';

function snapshotToNotifications(snapshot: DataSnapshot): AppNotification[] {
  const list: AppNotification[] = [];
  snapshot.forEach((child) => {
    const data = child.val() as Partial<AppNotification>;
    list.push({
      id: child.key as string,
      userId: data.userId ?? '',
      type: data.type ?? 'campaign',
      title: data.title ?? '',
      message: data.message ?? '',
      link: data.link ?? '/',
      isRead: data.isRead === true,
      createdAt: data.createdAt ?? '',
    });
  });
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // newest first
}

/** Starts listening for the latest 50 notifications. Safe to call many times. */
export function startNotificationListener(uid: string): void {
  if (stopListening && listeningFor === uid) return;
  stopNotificationListener();
  listeningFor = uid;

  const latest = query(dbRef(rtdb, `notifications/${uid}`), orderByChild('createdAt'), limitToLast(50));
  stopListening = onValue(
    latest,
    (snapshot) => {
      notifications.value = snapshotToNotifications(snapshot);
    },
    (error) => {
      console.error('Notification listener error:', error);
      notifications.value = [];
    }
  );
}

export function stopNotificationListener(): void {
  if (stopListening) stopListening();
  stopListening = null;
  listeningFor = '';
  notifications.value = [];
}

/* ---------- Actions ---------- */

export async function markAsRead(uid: string, notificationId: string): Promise<void> {
  try {
    await update(dbRef(rtdb, `notifications/${uid}/${notificationId}`), { isRead: true });
  } catch (error) {
    console.error('Mark as read failed:', error);
    throw new Error('Could not update the notification. Please try again.');
  }
}

export async function markAllAsRead(uid: string, notificationIds: string[]): Promise<void> {
  if (notificationIds.length === 0) return;
  const updates: Record<string, boolean> = {};
  for (const id of notificationIds) {
    updates[`notifications/${uid}/${id}/isRead`] = true;
  }
  try {
    await update(dbRef(rtdb), updates);
  } catch (error) {
    console.error('Mark all as read failed:', error);
    throw new Error('Could not update the notifications. Please try again.');
  }
}

export async function deleteNotification(uid: string, notificationId: string): Promise<void> {
  try {
    await remove(dbRef(rtdb, `notifications/${uid}/${notificationId}`));
  } catch (error) {
    console.error('Delete notification failed:', error);
    throw new Error('Could not delete the notification. Please try again.');
  }
}