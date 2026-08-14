import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppFloatingButton() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('wa_btn_dismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    localStorage.setItem('wa_btn_dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-24 md:bottom-6 right-3 sm:right-5 z-30 flex items-center gap-2 transition-all duration-300">
      {/* Tooltip badge */}
      <div className="hidden sm:flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-200 dark:border-emerald-800 px-3 py-2 rounded-2xl shadow-xl text-xs font-semibold text-slate-800 dark:text-slate-100">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span>Daily Job Alerts on WhatsApp</span>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 p-0.5"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main WhatsApp Action Button */}
      <div className="relative">
        <a
          href="https://whatsapp.com/channel/0029Vb8F3lw42DcjuB8vvQ1y"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all relative"
          title="Join JobNews.lk WhatsApp Channel"
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-950 shadow-sm">
            NEW
          </span>
        </a>

        {/* Mobile close icon on button corner for quick dismissal */}
        <button
          onClick={handleDismiss}
          className="sm:hidden absolute -top-1.5 -left-1.5 bg-slate-800/90 text-white rounded-full p-1 shadow-md hover:bg-slate-900 border border-white/30"
          title="Hide WhatsApp Button"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
}
