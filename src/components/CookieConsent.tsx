import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user already accepted/declined cookies
    const consent = localStorage.getItem('jn_cookie_consent');
    if (!consent) {
      // Small delay for smooth entry after initial page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('jn_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('jn_cookie_consent', 'essential');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-[74px] left-3 right-3 sm:bottom-[82px] sm:left-4 sm:right-4 md:bottom-6 md:left-6 md:right-auto md:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
      role="region"
      aria-label="Cookie Consent Banner"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl text-slate-800 dark:text-slate-100 transition-colors">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Cookie & Privacy Preferences
            </h3>
          </div>
          <button
            onClick={handleDecline}
            aria-label="Dismiss cookie notice"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 -mr-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3.5">
          JobNews uses cookies to optimize website performance, measure traffic analytics, and personalize content and advertisements in accordance with our{' '}
          <Link 
            to="/privacy-policy" 
            className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-700"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Accept All Cookies</span>
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl transition-all"
          >
            Necessary Only
          </button>
        </div>
      </div>
    </div>
  );
}
