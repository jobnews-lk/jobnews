import { useState, useEffect } from 'react';
import { X, Share2, PlusSquare } from 'lucide-react';

export default function PwaBottomBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone / already installed
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    // Detect mobile device
    const ua = navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    const isMobile = isIosDevice || /android|blackberry|mobile/i.test(ua) || window.innerWidth <= 768;
    if (!isMobile) return;

    // Check dismissal memory (7 days)
    try {
      const dismissedUntil = localStorage.getItem('jobnews_pwa_banner_dismissed_until');
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
        return;
      }
    } catch (e) {}

    // Check pre-captured deferredPrompt
    if (window.__deferredPwaPrompt) {
      setDeferredPrompt(window.__deferredPwaPrompt);
    }

    const handlePromptReady = () => {
      if (window.__deferredPwaPrompt) {
        setDeferredPrompt(window.__deferredPwaPrompt);
      }
    };
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('beforeinstallprompt', handlePromptReady);

    // Listen for manual open trigger (from navbar/drawer menu)
    const handleManualOpen = () => {
      setIsVisible(true);
      setShowIosTip(false);
    };
    window.addEventListener('open-pwa-install', handleManualOpen);

    // Sweet Spot Trigger: 3 seconds delay OR first scroll (>120px)
    let triggered = false;
    const triggerBanner = () => {
      if (triggered) return;
      triggered = true;
      setIsVisible(true);
      window.removeEventListener('scroll', handleScroll);
    };

    const timer = setTimeout(triggerBanner, 3200);

    const handleScroll = () => {
      if (window.scrollY > 120) {
        clearTimeout(timer);
        triggerBanner();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('beforeinstallprompt', handlePromptReady);
      window.removeEventListener('open-pwa-install', handleManualOpen);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIosTip(false);
    try {
      // Don't show again for 7 days if user dismisses with X
      localStorage.setItem('jobnews_pwa_banner_dismissed_until', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
    } catch (e) {}
  };

  const handleActionClick = async () => {
    // 1. If iOS Safari, toggle the sleek 1-2-3 tip
    if (isIos) {
      setShowIosTip((prev) => !prev);
      return;
    }

    // 2. Android Chrome One-Click Native Install
    const promptEvent = deferredPrompt || window.__deferredPwaPrompt;
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setIsVisible(false);
          try {
            localStorage.setItem('jobnews_pwa_banner_dismissed_until', (Date.now() + 365 * 24 * 60 * 60 * 1000).toString());
          } catch (e) {}
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
      }
      setDeferredPrompt(null);
      window.__deferredPwaPrompt = null;
    } else {
      // If deferredPrompt is unavailable (fallback), show friendly instructions
      setShowIosTip(true);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md bottom-[74px] sm:bottom-6 z-40 transition-all duration-500 ease-out animate-in slide-in-from-bottom-5">
      {/* iOS Safari Interactive Tooltip (Slides up if Try it is clicked on iPhone) */}
      {showIosTip && (
        <div className="mb-2 p-3 bg-slate-900/98 dark:bg-slate-900/98 text-white rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-xs space-y-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between font-bold text-slate-100">
            <span>iPhone / Safari හි මුල් තිරයට එක්කරන්න:</span>
            <button 
              onClick={() => setShowIosTip(false)}
              className="p-1 text-slate-400 hover:text-white rounded-full"
              aria-label="Close Tip"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">1</span>
              <span>පහළ ඇති <strong>Share</strong> (<Share2 className="w-3 h-3 inline text-blue-400" />) ඔබන්න.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">2</span>
              <span><strong>'Add to Home Screen'</strong> (<PlusSquare className="w-3 h-3 inline text-blue-400" />) තෝරන්න.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">3</span>
              <span>ඉහළ <strong>'Add'</strong> ඔබන්න.</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Google Weather Style Sleek Floating Banner */}
      <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-slate-700/70 flex items-center justify-between gap-3">
        {/* Left: App Logo Badge */}
        <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-400/40 p-1 flex items-center justify-center flex-shrink-0 shadow-md">
          <img 
            src="/pwa-icon-192.png" 
            alt="JobNews.lk Logo" 
            className="w-full h-full object-contain rounded-full drop-shadow" 
          />
        </div>

        {/* Center: Title & Subtitle */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
            Add to home screen <span className="text-[11px] font-medium text-slate-300 opacity-90">(මුල් තිරයට)</span>
          </h4>
          <p className="text-[10px] sm:text-[11px] text-slate-300 dark:text-slate-400 leading-snug truncate mt-0.5">
            For quick access to latest jobs, add shortcut
          </p>
        </div>

        {/* Right: Vibrant Blue "Try it" Pill Button & Close "X" */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleActionClick}
            className="px-3.5 sm:px-4 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center"
          >
            Try it
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
