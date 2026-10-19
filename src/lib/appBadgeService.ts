import { useState, useEffect } from 'react';
import type { Job } from './supabase';

const LAST_SEEN_KEY = 'jobnews_last_seen_job_time';
const UNREAD_COUNT_KEY = 'jobnews_unread_badge_count';

/**
 * Safely sets the native Red Number Badge on the installed PWA App Icon
 * (Supported on Android Chrome, Windows PWA, macOS PWA).
 */
export async function setNativeAppBadge(count: number): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;

  try {
    if (count > 0 && 'setAppBadge' in navigator) {
      await (navigator as any).setAppBadge(count);
      localStorage.setItem(UNREAD_COUNT_KEY, count.toString());
      window.dispatchEvent(new CustomEvent('jn-unread-badge-change', { detail: { count } }));
      return true;
    } else if (count <= 0 && 'clearAppBadge' in navigator) {
      await (navigator as any).clearAppBadge();
      localStorage.removeItem(UNREAD_COUNT_KEY);
      window.dispatchEvent(new CustomEvent('jn-unread-badge-change', { detail: { count: 0 } }));
      return true;
    }
  } catch (err) {
    // Badging API may be blocked by user permissions or unsupported browser
    console.debug('[AppBadge] Badge update ignored or unsupported:', err);
  }
  return false;
}

/**
 * Clears the Red Number Badge from the installed app icon
 */
export async function clearNativeAppBadge(): Promise<void> {
  await setNativeAppBadge(0);
}

/**
 * Marks all latest jobs as seen by the user and clears the badge
 */
export async function markJobsAsSeen(): Promise<void> {
  try {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    await clearNativeAppBadge();
  } catch (e) {
    // Ignore localStorage access issues
  }
}

/**
 * Gets the timestamp of when the user last viewed jobs
 */
export function getLastSeenJobTime(): Date {
  try {
    const saved = localStorage.getItem(LAST_SEEN_KEY);
    if (saved) return new Date(saved);
  } catch (e) {}
  // Default to 24 hours ago if first time visitor so they see latest fresh vacancies
  return new Date(Date.now() - 24 * 60 * 60 * 1000);
}

/**
 * Calculates how many published jobs were added since user's last visit
 * and sets the App Icon Red Badge.
 */
export function syncUnreadJobsCount(jobs: Partial<Job>[]): number {
  if (!Array.isArray(jobs) || jobs.length === 0) return 0;

  const lastSeen = getLastSeenJobTime();
  const unreadJobs = jobs.filter((job) => {
    if (job.status && job.status !== 'published') return false;
    if (!job.created_at) return false;
    const createdAt = new Date(job.created_at);
    return createdAt > lastSeen;
  });

  const count = unreadJobs.length;
  setNativeAppBadge(count);
  return count;
}

/**
 * Reactive React hook to display the badge in Top Navbar and Bottom Navigation
 */
export function useUnreadJobsBadge() {
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(UNREAD_COUNT_KEY);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const handleBadgeChange = (e: any) => {
      const count = e.detail?.count ?? 0;
      setUnreadCount(count);
    };

    window.addEventListener('jn-unread-badge-change', handleBadgeChange);
    return () => {
      window.removeEventListener('jn-unread-badge-change', handleBadgeChange);
    };
  }, []);

  return {
    unreadCount,
    markAsSeen: markJobsAsSeen,
    setBadge: setNativeAppBadge,
  };
}
