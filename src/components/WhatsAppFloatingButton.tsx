import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppFloatingButton() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40 flex items-center gap-2 group animate-bounce-slow">
      {/* Tooltip badge */}
      <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 px-3 py-2 rounded-2xl shadow-xl text-xs font-semibold text-slate-800 dark:text-slate-100 transition-all">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span>Daily Job Alerts on WhatsApp</span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDismissed(true);
          }}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 p-0.5"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main WhatsApp Action Button */}
      <a
        href="https://whatsapp.com/channel/0029Vb8F3lw42DcjuB8vvQ1y"
        target="_blank"
        rel="noopener noreferrer"
        className="w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all relative"
        title="Join JobNews.lk WhatsApp Channel"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-950">
          NEW
        </span>
      </a>
    </div>
  );
}
