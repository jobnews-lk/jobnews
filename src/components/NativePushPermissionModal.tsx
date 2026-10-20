import React, { useState, useEffect } from 'react';
import { isRunningStandalone } from '../lib/pwaInstallTracker';
import {
  isWebPushSupported,
  shouldSuppressPrompt,
  subscribeDeviceToPush,
  markPushDontAllow,
} from '../lib/pushSubscriptionManager';

export const NativePushPermissionModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Only target users who have installed and opened the app in standalone mode
    if (!isRunningStandalone()) {
      return;
    }

    if (!isWebPushSupported()) {
      return;
    }

    // If notifications are already permitted (e.g. manually enabled in Phone Settings),
    // silently ensure this device is subscribed and registered in Supabase!
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      subscribeDeviceToPush().catch(() => {});
      return;
    }

    if (shouldSuppressPrompt()) {
      return;
    }

    // Gentle 2.5-second delay so the app UI loads smoothly first
    const timer = setTimeout(() => {
      // Re-verify suppression before opening
      if (!shouldSuppressPrompt()) {
        setIsOpen(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  const handleAllow = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await subscribeDeviceToPush();
    } finally {
      setSubmitting(false);
      setIsOpen(false);
    }
  };

  const handleDontAllow = () => {
    markPushDontAllow();
    setIsOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-dialog-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
    >
      <div className="w-full max-w-[272px] sm:max-w-[285px] bg-[#f2f2f7]/95 dark:bg-[#1e1e24]/95 backdrop-blur-2xl rounded-[18px] shadow-2xl border border-white/50 dark:border-white/10 overflow-hidden transform scale-100 transition-all text-center select-none animate-in zoom-in-95 duration-150">
        {/* Content Section */}
        <div className="px-5 pt-5 pb-4">
          <h3
            id="ios-dialog-title"
            className="text-[17px] font-semibold text-slate-900 dark:text-white leading-snug tracking-tight"
          >
            &ldquo;JobNews.lk&rdquo; Would Like to Send You Notifications
          </h3>
          <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-1.5 leading-normal tracking-tight">
            Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.
          </p>
        </div>

        {/* Action Buttons with Hairline Separators (Authentic System Alert Layout) */}
        <div className="border-t border-slate-300/80 dark:border-slate-700/80 flex flex-col">
          <button
            type="button"
            onClick={handleAllow}
            disabled={submitting}
            className="w-full py-3 px-4 text-[17px] font-semibold text-[#007aff] dark:text-[#0a84ff] hover:bg-slate-200/50 dark:hover:bg-slate-800/50 active:bg-slate-300/60 dark:active:bg-slate-700/60 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Allowing...' : 'Allow'}
          </button>
          <div className="border-t border-slate-300/80 dark:border-slate-700/80" />
          <button
            type="button"
            onClick={handleDontAllow}
            disabled={submitting}
            className="w-full py-3 px-4 text-[17px] font-normal text-[#007aff] dark:text-[#0a84ff] hover:bg-slate-200/50 dark:hover:bg-slate-800/50 active:bg-slate-300/60 dark:active:bg-slate-700/60 transition-colors disabled:opacity-60"
          >
            Don&apos;t Allow
          </button>
        </div>
      </div>
    </div>
  );
};
