import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { Job } from '../lib/supabase';
import ImageNoticeCard from './ImageNoticeCard';
import PdfNoticeCard from './PdfNoticeCard';
import TextNoticeCard from './TextNoticeCard';
import { Loader2, ArrowUp, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LatestJobFeedProps {
  jobs: Job[];
  initialCount?: number;
  batchSize?: number;
}

export default function LatestJobFeed({ jobs, initialCount = 6, batchSize = 6 }: LatestJobFeedProps) {
  const location = useLocation();
  const storageKeyCount = `jn_feed_count_${location.pathname}`;
  const storageKeyScroll = `jn_feed_scroll_${location.pathname}`;

  // Restore initial display count from sessionStorage if returning via Back button
  const [displayCount, setDisplayCount] = useState<number>(() => {
    try {
      const savedCount = sessionStorage.getItem(storageKeyCount);
      if (savedCount) {
        const parsed = parseInt(savedCount, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch (e) {}
    return initialCount;
  });

  // Track checkpoint limit (auto-scroll pauses every 4 batches / 24 items)
  const [checkpointLimit, setCheckpointLimit] = useState<number>(() => {
    return Math.max(initialCount + batchSize * 3, displayCount);
  });

  const observerRef = useRef<HTMLDivElement | null>(null);

  // Save current scroll position on scroll & route change
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        sessionStorage.setItem(storageKeyScroll, window.scrollY.toString());
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [storageKeyScroll]);

  // Restore scroll position when returning via Back button
  useEffect(() => {
    try {
      const savedScroll = sessionStorage.getItem(storageKeyScroll);
      if (savedScroll) {
        const scrollY = parseInt(savedScroll, 10);
        if (!isNaN(scrollY) && scrollY > 0) {
          // Allow DOM to render restored cards first, then scroll
          requestAnimationFrame(() => {
            setTimeout(() => {
              window.scrollTo({ top: scrollY, behavior: 'instant' });
            }, 50);
          });
        }
      }
    } catch (e) {}
  }, [storageKeyScroll]);

  // Update sessionStorage whenever displayCount changes
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKeyCount, displayCount.toString());
    } catch (e) {}
  }, [displayCount, storageKeyCount]);

  // Reset display count if jobs list changes significantly (e.g. search/filter applied)
  const prevJobsLenRef = useRef(jobs.length);
  useEffect(() => {
    if (Math.abs(jobs.length - prevJobsLenRef.current) > 5) {
      setDisplayCount(initialCount);
      setCheckpointLimit(initialCount + batchSize * 3);
      sessionStorage.removeItem(storageKeyScroll);
    }
    prevJobsLenRef.current = jobs.length;
  }, [jobs.length, initialCount, batchSize, storageKeyScroll]);

  const hasMore = displayCount < jobs.length;
  const isAutoScrollPaused = displayCount >= checkpointLimit && hasMore;

  // IntersectionObserver to progressively load items until checkpoint limit is reached
  useEffect(() => {
    if (!hasMore || isAutoScrollPaused) return;

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
  }, [displayCount, jobs.length, batchSize, hasMore, isAutoScrollPaused]);

  const handleManualLoadMore = () => {
    const nextLimit = displayCount + batchSize * 4;
    setCheckpointLimit(nextLimit);
    setDisplayCount((prev) => Math.min(prev + batchSize, jobs.length));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const visibleJobs = jobs.slice(0, displayCount);

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

      {/* Auto-Scroll Sentinel & Checkpoint CTA */}
      {hasMore && (
        <div ref={observerRef} className="pt-6 pb-8 flex flex-col items-center justify-center gap-3">
          {isAutoScrollPaused ? (
            <div className="text-center space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm max-w-md w-full">
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                You've viewed {displayCount} of {jobs.length} job notices
              </p>
              <button
                onClick={handleManualLoadMore}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                <span>View More Job Notices (තවත් රැකියා බලන්න)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
              Loading more notices ({jobs.length - displayCount} remaining)...
            </div>
          )}
        </div>
      )}

      {/* End of Directory Completion & Back to Top */}
      {!hasMore && jobs.length > 0 && (
        <div className="pt-8 pb-12 text-center flex flex-col items-center justify-center gap-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>You've viewed all {jobs.length} active job notices!</span>
          </div>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold px-6 py-3 rounded-full text-sm shadow-md transition-all active:scale-95"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Back to Top (මුලට යන්න)</span>
          </button>
        </div>
      )}
    </div>
  );
}
