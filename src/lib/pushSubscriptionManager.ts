import { supabase } from './supabase';
import { getOrCreateDeviceId, detectPlatform } from './pwaInstallTracker';

export const VAPID_PUBLIC_KEY =
  (import.meta.env.VITE_VAPID_PUBLIC_KEY as string) ||
  'BAyyKpVH0oWS87kTyUoR3ehwLmyb_X3_wvEoAJbrEUn2ezfb9pH8c-DlN8qq94UxqinWZnKmiAyvRR9ZUAVFms0';

const SUB_TRACKED_KEY = 'jobnews_push_subscribed';
const DONT_ALLOW_KEY = 'jobnews_push_dont_allow';

/**
 * Converts a base64url string to a Uint8Array for the PushManager applicationServerKey.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Checks if Web Push is supported in the current browser/device
 */
export function isWebPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Checks whether user has already granted permission and subscribed
 */
export async function checkIsSubscribed(): Promise<boolean> {
  if (!isWebPushSupported()) return false;
  try {
    if (Notification.permission !== 'granted') return false;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}

/**
 * Subscribes the current device to Web Push and saves the subscription to Supabase.
 */
export async function subscribeDeviceToPush(): Promise<{ success: boolean; error?: string }> {
  if (!isWebPushSupported()) {
    return { success: false, error: 'Push notifications are not supported on this device.' };
  }

  try {
    // 1. Request notification permission if not yet granted
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      localStorage.setItem(DONT_ALLOW_KEY, 'true');
      return { success: false, error: 'Permission denied by user' };
    }

    // 2. Obtain active ServiceWorkerRegistration
    const reg = await navigator.serviceWorker.ready;
    if (!reg) {
      return { success: false, error: 'Service worker is not ready' };
    }

    // 3. Subscribe or reuse existing subscription
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    const subJson = subscription.toJSON();
    const endpoint = subJson.endpoint;
    const p256dh = subJson.keys?.p256dh;
    const auth = subJson.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return { success: false, error: 'Incomplete push subscription keys' };
    }

    const deviceId = getOrCreateDeviceId();
    const platform = detectPlatform();
    const userAgent = navigator.userAgent;
    const now = new Date().toISOString();

    const record = {
      device_id: deviceId,
      endpoint,
      p256dh,
      auth,
      platform,
      user_agent: userAgent,
      updated_at: now,
    };

    // 4. Save to Supabase push_subscriptions table
    try {
      const { error: dbError } = await supabase.from('push_subscriptions').upsert(record, {
        onConflict: 'endpoint',
      });
      if (dbError) {
        console.warn('[PushSub] Supabase direct upsert notice:', dbError.message);
      }
    } catch (e) {
      console.warn('[PushSub] Supabase direct save skipped:', e);
    }

    // 5. Secondary fallback to serverless API endpoint
    try {
      fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      }).catch(() => {});
    } catch {}

    localStorage.setItem(SUB_TRACKED_KEY, 'true');
    localStorage.removeItem(DONT_ALLOW_KEY);

    return { success: true };
  } catch (err) {
    console.error('[PushSub] Failed to subscribe device:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown push subscription error',
    };
  }
}

/**
 * Records user's choice to not allow notifications
 */
export function markPushDontAllow(): void {
  try {
    localStorage.setItem(DONT_ALLOW_KEY, 'true');
  } catch {}
}

/**
 * Checks whether the prompt should be suppressed
 */
export function shouldSuppressPrompt(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    if (!('Notification' in window)) return true;
    if (Notification.permission === 'granted' || Notification.permission === 'denied') return true;
    if (localStorage.getItem(DONT_ALLOW_KEY) === 'true') return true;
    if (localStorage.getItem(SUB_TRACKED_KEY) === 'true') return true;
    return false;
  } catch {
    return true;
  }
}
