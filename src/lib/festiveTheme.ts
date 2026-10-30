import { useState, useEffect } from 'react';

export type FestiveMode = 'auto' | 'enabled' | 'disabled';

export const FESTIVE_STORAGE_KEY = 'jn_festive_mode';

/**
 * Retrieves the current festive mode preference.
 * Defaults to 'enabled' so the user can immediately experience the snowfall live.
 */
export function getFestiveMode(): FestiveMode {
  try {
    const stored = localStorage.getItem(FESTIVE_STORAGE_KEY);
    if (stored === 'enabled' || stored === 'disabled' || stored === 'auto') {
      return stored as FestiveMode;
    }
  } catch (e) {}
  return 'enabled';
}

/**
 * Checks whether the festive snowfall should currently be active.
 * - 'enabled': Forced ON for testing / live preview.
 * - 'disabled': Forced OFF.
 * - 'auto': Automatically active from Nov 01 (00:00) to Dec 31 (23:59).
 */
export function isFestiveActive(): boolean {
  const mode = getFestiveMode();
  if (mode === 'enabled') return true;
  if (mode === 'disabled') return false;

  // Auto seasonal schedule: Nov 1 to Dec 31
  const now = new Date();
  const month = now.getMonth(); // 10 = November, 11 = December (0-indexed)
  return month === 10 || month === 11;
}

/**
 * Updates the festive mode preference and dispatches an event so all components react immediately.
 */
export function setFestiveMode(mode: FestiveMode) {
  try {
    localStorage.setItem(FESTIVE_STORAGE_KEY, mode);
    window.dispatchEvent(new Event('festive-theme-changed'));
  } catch (e) {}
}

/**
 * React hook that subscribes to festive mode changes with 0ms reactivity.
 */
export function useFestiveActive(): boolean {
  const [active, setActive] = useState<boolean>(() => isFestiveActive());

  useEffect(() => {
    const handleChange = () => setActive(isFestiveActive());
    window.addEventListener('festive-theme-changed', handleChange);
    window.addEventListener('storage', handleChange);
    return () => {
      window.removeEventListener('festive-theme-changed', handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  return active;
}
