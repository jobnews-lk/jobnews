import React from 'react';

export default function VacancyCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-pulse flex flex-col h-full">
      {/* Aspect Ratio Image Container */}
      <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800 w-full relative" />

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mb-2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2 mb-4" />

        {/* Badges */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
          <div className="h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
}
