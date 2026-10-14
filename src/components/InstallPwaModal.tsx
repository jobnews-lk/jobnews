import { useState, useEffect } from 'react';
import { X, Smartphone, Share2, PlusSquare, CheckCircle2 } from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallPwaModal({ isOpen, onClose }: InstallPwaModalProps) {
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Check if already in standalone (installed) mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Listen for beforeinstallprompt (Android / Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
              JobNews.lk මුල් තිරයට
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Add to Home Screen
            </p>
          </div>
        </div>

        {/* Friendly explanation */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          සෑමදාම අලුත් රැකියා තොරතුරු පහසුවෙන් බැලීමට ඔබගේ දුරකථනයේ මුල් තිරයට (Home Screen) කෙටිමඟක් එකතු කරගන්න.
        </p>

        {/* Already Installed State */}
        {isInstalled ? (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>JobNews.lk දැනටමත් ඔබගේ මුල් තිරයේ ඇත!</span>
          </div>
        ) : isIos ? (
          /* iOS Safari Friendly Steps */
          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                1
              </span>
              <span>
                Safari බ්‍රවුසරයේ පහළ ඇති <strong>Share</strong> (<Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />) අයිකනය ඔබන්න.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                2
              </span>
              <span>
                මෙනුවේ පහළට ගොස් <strong>'Add to Home Screen'</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />) තෝරන්න.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                3
              </span>
              <span>
                ඉහළ දකුණු පස ඇති <strong>'Add'</strong> ඔබන්න. එච්චරයි!
              </span>
            </div>
          </div>
        ) : deferredPrompt ? (
          /* Android / Chrome One-Click Install */
          <button
            onClick={handleInstallClick}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            <span>මුල් තිරයට එක්කරන්න (Add)</span>
          </button>
        ) : (
          /* Android / Generic Browser Steps */
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
            <p>
              Chrome බ්‍රවුසරයේ ඉහළ දකුණු කෙළවරේ ඇති <strong>( ⋮ )</strong> ඔබා <strong>'Add to Home screen'</strong> හෝ <strong>'Install app'</strong> තෝරාගන්න.
            </p>
          </div>
        )}

        {/* Bottom Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          තේරුණා 👍
        </button>
      </div>
    </div>
  );
}
