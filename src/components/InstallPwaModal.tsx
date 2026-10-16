import { useState, useEffect } from 'react';
import { X, Smartphone, Share2, PlusSquare, CheckCircle2, Sparkles } from 'lucide-react';

// Declare global for window beforeinstallprompt
declare global {
  interface Window {
    __deferredPwaPrompt?: any;
  }
}

// Pre-capture beforeinstallprompt event as early as possible
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__deferredPwaPrompt = e;
  });
}

interface InstallPwaModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function InstallPwaModal({ isOpen: controlledIsOpen, onClose: controlledOnClose }: InstallPwaModalProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // If controlled from props, use that; otherwise use internal state
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleClose = () => {
    // Save dismissal to localStorage for 7 days so recurring visitors aren't annoyed
    try {
      localStorage.setItem('jobnews_pwa_prompt_dismissed_until', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
    } catch (e) {}

    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    // Detect if already installed/standalone
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Pick up pre-captured deferred prompt if available
    if (window.__deferredPwaPrompt) {
      setDeferredPrompt(window.__deferredPwaPrompt);
    }

    // Also listen for future beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.__deferredPwaPrompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for manual trigger event from any menu / button
    const handleManualOpen = () => {
      if (isControlled && controlledOnClose) {
        // If controlled, parent handles it
      } else {
        setInternalIsOpen(true);
      }
    };
    window.addEventListener('open-pwa-install', handleManualOpen);

    // SMART AUTO-PROMPT LOGIC FOR MOBILE VISITORS:
    // Only auto-trigger if uncontrolled (mounted globally in Layout)
    if (!isControlled) {
      const isMobile = /iphone|ipad|ipod|android|blackberry|mobile/i.test(userAgent) || window.innerWidth <= 768;
      
      let isDismissed = false;
      try {
        const dismissedUntil = localStorage.getItem('jobnews_pwa_prompt_dismissed_until');
        if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
          isDismissed = true;
        }
      } catch (e) {}

      // If mobile, not standalone, and not dismissed recently: show after 3.2 seconds
      if (isMobile && !isStandalone && !isDismissed) {
        const autoTimer = setTimeout(() => {
          setInternalIsOpen(true);
        }, 3200);

        return () => {
          clearTimeout(autoTimer);
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
          window.removeEventListener('open-pwa-install', handleManualOpen);
        };
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install', handleManualOpen);
    };
  }, [isControlled, controlledOnClose]);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.__deferredPwaPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        try {
          // Never bother again once successfully installed
          localStorage.setItem('jobnews_pwa_prompt_dismissed_until', (Date.now() + 365 * 24 * 60 * 60 * 1000).toString());
        } catch (e) {}
      }
      setDeferredPrompt(null);
      window.__deferredPwaPrompt = null;
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with JobNews Branded Icon */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-2 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 flex-shrink-0 border border-white/20">
            <img src="/pwa-icon-192.png" alt="JobNews.lk Logo" className="w-full h-full object-contain drop-shadow" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
              <span>JobNews.lk මුල් තිරයට</span>
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold tracking-wide mt-0.5">
              Add to Home Screen
            </p>
          </div>
        </div>

        {/* Friendly explanation */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          සෑමදාම අලුත් රැකියා තොරතුරු පහසුවෙන් බැලීමට ඔබගේ දුරකථනයේ මුල් තිරයට (Home Screen) කෙටිමඟක් එකතු කරගන්න.
        </p>

        {/* Dynamic State: Already Installed vs iOS vs Android */}
        {isInstalled ? (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>JobNews.lk දැනටමත් ඔබගේ මුල් තිරයේ ඇත!</span>
          </div>
        ) : isIos ? (
          /* iOS Safari Friendly 1-2-3 Steps */
          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                1
              </span>
              <span className="leading-snug">
                Safari බ්‍රවුසරයේ පහළ ඇති <strong>Share</strong> (<Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />) අයිකනය ඔබන්න.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                2
              </span>
              <span className="leading-snug">
                මෙනුවේ පහළට ගොස් <strong>'Add to Home Screen'</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />) තෝරන්න.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                3
              </span>
              <span className="leading-snug">
                ඉහළ දකුණු පස ඇති <strong>'Add'</strong> ඔබන්න. එච්චරයි!
              </span>
            </div>
          </div>
        ) : (deferredPrompt || window.__deferredPwaPrompt) ? (
          /* Android / Chrome One-Click Install */
          <button
            onClick={handleInstallClick}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.98] text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4.5 h-4.5" />
            <span>මුල් තිරයට එක්කරන්න (Add to Home Screen)</span>
          </button>
        ) : (
          /* Android / Generic Browser Steps */
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
            <p className="leading-relaxed">
              Chrome හෝ ඔබගේ Browser මෙනුවේ ඉහළ දකුණු කෙළවරේ ඇති <strong>( ⋮ )</strong> ඔබා <strong>'Add to Home screen'</strong> හෝ <strong>'Install app'</strong> තෝරාගන්න.
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-1 flex gap-2">
          {!(deferredPrompt || window.__deferredPwaPrompt) && !isIos && !isInstalled && (
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl transition-colors text-center"
            >
              තේරුණා 👍
            </button>
          )}

          {isIos && (
            <button
              onClick={handleClose}
              className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-colors shadow-md shadow-blue-600/20 text-center"
            >
              තේරුණා 👍
            </button>
          )}

          {(deferredPrompt || window.__deferredPwaPrompt) && !isInstalled && (
            <button
              onClick={handleClose}
              className="w-full py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-center"
            >
              පසුවට (Maybe Later)
            </button>
          )}

          {isInstalled && (
            <button
              onClick={handleClose}
              className="w-full py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-2xl transition-colors text-center"
            >
              හරි 👍
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
