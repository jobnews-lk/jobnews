import { setNativeAppBadge } from './appBadgeService';

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  unreadCount?: number;
}

const NOTIFICATION_KEY = 'jobnews_notifications_enabled';

/**
 * Checks whether the browser supports Notifications and Service Worker
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator
  );
}

/**
 * Gets current Notification permission ('default' | 'granted' | 'denied')
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Requests Notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return 'denied';

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem(NOTIFICATION_KEY, 'true');
    } else {
      localStorage.setItem(NOTIFICATION_KEY, 'false');
    }
    return permission;
  } catch (error) {
    console.error('[PushNotification] Error requesting permission:', error);
    return 'denied';
  }
}

/**
 * Shows an instant local notification and updates the App Icon Red Badge.
 * Works even when standalone or in-browser if user granted permission.
 */
export async function showJobAlertNotification({
  title,
  body,
  url = '/jobs',
  unreadCount = 1,
}: PushNotificationPayload): Promise<boolean> {
  if (!isPushSupported()) return false;

  // Always update App Icon Red Badge
  await setNativeAppBadge(unreadCount);

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg && reg.showNotification) {
      await reg.showNotification(title, {
        body,
        icon: '/pwa-icon-192.png',
        badge: '/favicon.svg',
        data: { url },
        vibrate: [150, 80, 150],
      });
      return true;
    } else {
      // Fallback to standard window Notification
      new Notification(title, {
        body,
        icon: '/pwa-icon-192.png',
      });
      return true;
    }
  } catch (err) {
    console.error('[PushNotification] Error displaying notification:', err);
    return false;
  }
}
