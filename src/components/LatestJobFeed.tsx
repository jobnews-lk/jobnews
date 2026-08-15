import React, { useState, useEffect, useRef } from 'react';
import type { Job } from '../lib/supabase';
import ImageNoticeCard from './ImageNoticeCard';
import PdfNoticeCard from './PdfNoticeCard';
import TextNoticeCard from './TextNoticeCard';
import { Loader2, ArrowDown } from 'lucide-react';

interface LatestJobFeedProps {
  jobs: Job[];
  initialCount?: number;
  batchSize?: number;
}

export default function LatestJobFeed({ jobs, initialCount = 6, batchSize = 6 }: LatestJobFeedProps) {
  const [displayCount, setDisplayCount] = useState<number>(initialCount);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Reset display count whenever the jobs list changes (e.g. search/filter applied)
  useEffect(() => {
    setDisplayCount(initialCount);
  }, [jobs, initialCount]);

  // Infinite scroll observer to progressively load more cards as user scrolls down
  useEffect(() => {
    if (displayCount >= jobs.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prev) => Math.min(prev + batchSize, jobs.length));
        }
      },
      { rootMargin: '300px' }
    );

    const currentTarget = observerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [displayCount, jobs.length, batchSize]);

  const visibleJobs = jobs.slice(0, displayCount);
  const hasMore = displayCount < jobs.length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleJobs.map((job) => {
          if (job.post_type === 'image') {
            return <ImageNoticeCard key={job.id} job={job} />;
          } else if (job.post_type === 'pdf') {
            return <PdfNoticeCard key={job.id} job={job} />;
          } else {
            return <TextNoticeCard key={job.id} job={job} />;
          }
        })}
      </div>

      {/* Infinite Scroll Sentinel / Load More CTA */}
      {hasMore && (
        <div ref={observerRef} className="pt-4 pb-8 flex flex-col items-center justify-center">
          <button
            onClick={() => setDisplayCount((prev) => Math.min(prev + batchSize, jobs.length))}
            className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-full font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            Loading more job notices ({jobs.length - displayCount} remaining)...
          </button>
        </div>
      )}
    </div>
  );
}
