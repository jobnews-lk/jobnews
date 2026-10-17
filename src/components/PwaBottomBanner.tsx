import { useState, useEffect } from 'react';
import { X, Share2, PlusSquare, CheckCircle2, Smartphone } from 'lucide-react';

export default function PwaBottomBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect if running inside standalone mode (installed app)
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    // Check if user previously installed
    const hasInstalledFlag = localStorage.getItem('jobnews_pwa_installed') === 'true';
    setIsInstalled(checkStandalone || hasInstalledFlag);

    // Detect mobile device
    const ua = navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    const isMobile = isIosDevice || /android|blackberry|mobile/i.test(ua) || window.innerWidth <= 768;
    if (!isMobile) return;

    // Check dismissal cooldown (7 days)
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
      setShowTip(false);
    };
    window.addEventListener('open-pwa-install', handleManualOpen);

    // Sweet Spot Trigger: 3.2 seconds delay OR user scrolls (>120px)
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
    setShowTip(false);
    try {
      // Don't show again for 7 days if user dismisses with X
      localStorage.setItem('jobnews_pwa_banner_dismissed_until', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
    } catch (e) {}
  };

  const handleActionClick = async () => {
    // 1. If already installed, just acknowledge
    if (isInstalled) {
      handleDismiss();
      return;
    }

    // 2. If iOS Safari, show the crystal-clear 1-2-3 guide
    if (isIos) {
      setShowTip((prev) => !prev);
      return;
    }

    // 3. Android Chrome One-Click Native Install
    const promptEvent = deferredPrompt || window.__deferredPwaPrompt;
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          setIsVisible(false);
          try {
            localStorage.setItem('jobnews_pwa_installed', 'true');
            localStorage.setItem('jobnews_pwa_banner_dismissed_until', (Date.now() + 365 * 24 * 60 * 60 * 1000).toString());
          } catch (e) {}
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
      }
      setDeferredPrompt(null);
      window.__deferredPwaPrompt = null;
    } else {
      // If deferredPrompt is not yet ready, show friendly device-specific tip
      setShowTip((prev) => !prev);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md bottom-[74px] sm:bottom-6 z-40 transition-all duration-500 ease-out animate-in slide-in-from-bottom-5">
      {/* High-Contrast Frosted Tooltip (Never washes out on light or dark backgrounds) */}
      {showTip && !isInstalled && (
        <div className="mb-2 p-3.5 bg-[#0a0f1d]/98 text-white rounded-2xl shadow-2xl border border-slate-700/90 backdrop-blur-2xl text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between font-bold text-slate-100">
            <span className="flex items-center gap-1.5 text-[13px]">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>{isIos ? 'iPhone / Safari හි මුල් තිරයට එක්කරන්න:' : 'Android හි මුල් තිරයට එක්කරන්න:'}</span>
            </span>
            <button 
              onClick={() => setShowTip(false)}
              className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              aria-label="Close Tip"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isIos ? (
            <div className="space-y-2 text-slate-200 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">1</span>
                <span>Safari හි පහළ ඇති <strong>Share</strong> (<Share2 className="w-3 h-3 inline text-blue-400" />) ඔබන්න.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">2</span>
                <span><strong>'Add to Home Screen'</strong> (<PlusSquare className="w-3 h-3 inline text-blue-400" />) තෝරන්න.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">3</span>
                <span>ඉහළ දකුණේ <strong>'Add'</strong> ඔබන්න. එච්චරයි!</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 text-slate-200 font-medium">
              <p className="leading-relaxed">
                Chrome මෙනුවේ ඉහළ දකුණු කෙළවරේ ඇති <strong>( ⋮ )</strong> ඔබා <strong>'Install app'</strong> හෝ <strong>'Add to Home screen'</strong> තෝරාගන්න.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Google Weather Style Sleek Floating Banner */}
      <div className="bg-[#0a0f1d]/95 dark:bg-[#0a0f1d]/95 text-white backdrop-blur-xl rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3">
        {/* Left: App Logo Badge */}
        <div className="relative w-10 h-10 rounded-full bg-blue-600/20 border border-blue-400/40 p-1 flex items-center justify-center flex-shrink-0 shadow-md">
          <img 
            src="/pwa-icon-192.png" 
            alt="JobNews.lk Logo" 
            className="w-full h-full object-contain rounded-full drop-shadow" 
          />
          {isInstalled && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0a0f1d] flex items-center justify-center text-white">
              <CheckCircle2 className="w-3 h-3 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Center: Title & Subtitle */}
        <div className="flex-1 min-w-0 pr-1">
          {isInstalled ? (
            <>
              <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                JobNews.lk is installed
              </h4>
              <p className="text-[10px] sm:text-[11px] text-emerald-400 font-medium leading-snug mt-0.5">
                දැනටමත් ඔබගේ දුරකථනයේ ඇත ✓
              </p>
            </>
          ) : (
            <>
              <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                Add to home screen
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-300 dark:text-slate-300 leading-snug mt-0.5">
                For quick access to latest jobs, add shortcut
              </p>
            </>
          )}
        </div>

        {/* Right: Vibrant Pill Button & Close "X" */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isInstalled ? (
            <button
              onClick={handleActionClick}
              className="px-3 sm:px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md shadow-emerald-600/30 active:scale-95 transition-all flex items-center gap-1"
            >
              <span>Installed</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleActionClick}
              className="px-3.5 sm:px-4 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center"
            >
              Try it
            </button>
          )}

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
