import { supabase } from './supabase';

export interface PwaInstallRecord {
  id?: string;
  device_id: string;
  platform: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'other';
  user_agent: string;
  installed_at: string;
  last_active?: string;
  source?: string;
}

export interface PwaStatsSummary {
  total: number;
  android: number;
  ios: number;
  desktop: number;
  other: number;
  recent: PwaInstallRecord[];
  isRealtimeSynced: boolean;
}

const DEVICE_ID_KEY = 'jobnews_pwa_device_id';
const INSTALL_TRACKED_KEY = 'jobnews_pwa_install_tracked';
const LOCAL_INSTALLS_STORE = 'jobnews_local_pwa_installs';

/**
 * Gets or creates a persistent anonymous device UUID for install tracking
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'unknown_device';

  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = 'jn_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return 'temp_' + Date.now().toString(36);
  }
}

/**
 * Detects client device platform
 */
export function detectPlatform(): PwaInstallRecord['platform'] {
  if (typeof window === 'undefined') return 'other';
  const ua = navigator.userAgent.toLowerCase();

  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/windows nt/i.test(ua)) return 'windows';
  if (/macintosh|mac os x/i.test(ua)) return 'macos';
  if (/linux/i.test(ua)) return 'linux';
  return 'other';
}

/**
 * Checks if the current session is running in installed standalone mode
 */
export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Records a PWA installation event to Supabase and API
 */
export async function recordPwaInstall(source: string = 'appinstalled_event'): Promise<void> {
  if (typeof window === 'undefined') return;

  const deviceId = getOrCreateDeviceId();
  const platform = detectPlatform();
  const userAgent = navigator.userAgent;
  const now = new Date().toISOString();

  const record: PwaInstallRecord = {
    device_id: deviceId,
    platform,
    user_agent: userAgent,
    installed_at: now,
    last_active: now,
    source,
  };

  // 1. Save in localStorage so device is marked as installed
  try {
    localStorage.setItem(INSTALL_TRACKED_KEY, 'true');
    localStorage.setItem('jobnews_pwa_installed', 'true');

    // Keep local cache of installs
    const existingRaw = localStorage.getItem(LOCAL_INSTALLS_STORE);
    let list: PwaInstallRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    if (!list.some((r) => r.device_id === deviceId)) {
      list.push(record);
      localStorage.setItem(LOCAL_INSTALLS_STORE, JSON.stringify(list));
    }
  } catch (e) {}

  // 2. Report to Serverless API endpoint
  try {
    fetch('/api/pwa-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(() => {});
  } catch (e) {}

  // 3. Attempt direct upsert to Supabase pwa_installations table
  try {
    await supabase.from('pwa_installations').upsert(
      {
        device_id: deviceId,
        platform,
        user_agent: userAgent,
        installed_at: now,
        last_active: now,
      },
      { onConflict: 'device_id' }
    );
  } catch (e) {
    // If table doesn't exist yet, gracefully catch without error
  }
}

/**
 * Initializes listeners for PWA installation and standalone launch
 */
export function initPwaInstallTracker(): void {
  if (typeof window === 'undefined') return;

  // 1. Native appinstalled event (Chrome, Edge, Android)
  window.addEventListener('appinstalled', () => {
    recordPwaInstall('native_appinstalled');
  });

  // 2. Standalone launch check
  if (isRunningStandalone()) {
    const alreadyTracked = localStorage.getItem(INSTALL_TRACKED_KEY) === 'true';
    if (!alreadyTracked) {
      recordPwaInstall('standalone_first_launch');
    }
  }
}

/**
 * Fetches real PWA installation statistics for the Admin Dashboard
 */
export async function fetchPwaStats(): Promise<PwaStatsSummary> {
  let records: PwaInstallRecord[] = [];
  let isRealtimeSynced = false;

  // 1. Try querying Supabase pwa_installations table
  try {
    const { data, error } = await supabase
      .from('pwa_installations')
      .select('*')
      .order('installed_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      records = data as PwaInstallRecord[];
      isRealtimeSynced = true;
    }
  } catch (e) {}

  // 2. If Supabase table empty or unavailable, try Vercel /api/pwa-track
  if (records.length === 0) {
    try {
      const res = await fetch('/api/pwa-track');
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.records)) {
          records = json.records;
          isRealtimeSynced = true;
        }
      }
    } catch (e) {}
  }

  // 3. Fallback to locally stored installs if offline or development
  if (records.length === 0) {
    try {
      const saved = localStorage.getItem(LOCAL_INSTALLS_STORE);
      if (saved) {
        records = JSON.parse(saved);
      }
    } catch (e) {}
  }

  // Ensure current device is counted if marked installed
  try {
    const isThisDeviceInstalled = 
      localStorage.getItem('jobnews_pwa_installed') === 'true' || 
      isRunningStandalone();
      
    const currentDeviceId = getOrCreateDeviceId();
    if (isThisDeviceInstalled && !records.some((r) => r.device_id === currentDeviceId)) {
      records.unshift({
        device_id: currentDeviceId,
        platform: detectPlatform(),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        installed_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        source: 'local_device',
      });
    }
  } catch (e) {}

  // Compute breakdown
  let android = 0;
  let ios = 0;
  let desktop = 0;
  let other = 0;

  for (const r of records) {
    if (r.platform === 'android') android++;
    else if (r.platform === 'ios') ios++;
    else if (r.platform === 'windows' || r.platform === 'macos' || r.platform === 'linux') desktop++;
    else other++;
  }

  return {
    total: records.length,
    android,
    ios,
    desktop,
    other,
    recent: records.slice(0, 10),
    isRealtimeSynced,
  };
}
