import { Megaphone } from 'lucide-react';

interface AdPlaceholderProps {
  className?: string;
}

export default function AdPlaceholder({ className = '' }: AdPlaceholderProps) {
  return (
    <div className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-slate-400 dark:text-slate-500 overflow-hidden relative group transition-colors ${className}`}>
      {/* Hover effect background */}
      <div className="absolute inset-0 bg-blue-50/50 dark:bg-slate-700/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      
      <Megaphone className="w-6 h-6 mb-2 opacity-50 group-hover:text-blue-500 group-hover:opacity-80 transition-all" />
      <span className="text-xs font-bold uppercase tracking-widest opacity-70 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        Advertisement Space
      </span>
      <span className="text-[10px] mt-1.5 opacity-50 max-w-[250px] text-center hidden sm:block leading-relaxed">
        Reserved for future sponsors or Google AdSense banners
      </span>
    </div>
  );
}
