import React, { useState } from 'react';
import { Share2, MessageCircle, Copy, Check, Send } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  company?: string;
  url?: string;
}

export default function ShareButtons({ title, company, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const companyStr = company ? ` at ${company}` : '';
  const shareText = `🔍 Job Notice: ${title}${companyStr}\n\nApply now via JobNews.lk:`;

  // Native Device Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Job Notice: ${title}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (e) {
        // Share cancelled by user or not supported
      }
    } else {
      handleCopyLink();
    }
  };

  // Copy URL to Clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp Share URL
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;

  // Facebook Share URL
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  // Telegram Share URL
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 uppercase tracking-wider">
        Share Vacancy:
      </span>

      {/* Native Mobile Share Button */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={handleNativeShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      )}

      {/* WhatsApp Direct Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
      >
        <MessageCircle className="w-3.5 h-3.5 fill-white" /> WhatsApp
      </a>

      {/* Facebook Button */}
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
      >
        <Share2 className="w-3.5 h-3.5" /> Facebook
      </a>

      {/* Telegram Button */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
      >
        <Send className="w-3.5 h-3.5" /> Telegram
      </a>

      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
          copied
            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
        }`}
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}
