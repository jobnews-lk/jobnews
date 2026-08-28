import { useState, useEffect } from 'react';
import { supabase, type Job } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

function getDaysRemaining(closingDateStr?: string): number {
  if (!closingDateStr) return 7;
  try {
    const cleanStr = closingDateStr.split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const target = new Date(year, month, day);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return isNaN(diffDays) ? 7 : diffDays;
    }
  } catch (e) {}
  return 7;
}

export default function TopTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const [closingJobs, setClosingJobs] = useState<Job[]>(() => {
    try {
      const cached = localStorage.getItem('jn_v2_home_closing') || localStorage.getItem('jn_v2_home_jobs');
      const parsed = cached ? JSON.parse(cached) : [];
      return Array.isArray(parsed) ? parsed.filter((j: Job) => j.status === 'published') : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    async function loadTickerJobs() {
      try {
        let { data } = await supabase
          .from('jobs')
          .select('id, title, company, closing_date, status')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10);

        if (data && data.length > 0) {
          setClosingJobs(data as Job[]);
          try {
            localStorage.setItem('jn_v2_home_closing', JSON.stringify(data));
          } catch (e) {}
        }
      } catch (err) {
        console.warn('TopTicker fetch error:', err);
      }
    }

    loadTickerJobs();
  }, []);

  if (closingJobs.length === 0) return null;

  return (
    <div className="bg-red-600 text-white text-xs md:text-sm font-medium py-2 relative flex items-center w-full z-50 group shadow-sm overflow-hidden select-none">
      <!-- Fixed Left Header Badge -->
      <div className="px-3 flex items-center gap-1.5 z-10 bg-red-600 shadow-[12px_0_12px_#dc2626]">
        <AlertCircle className="w-4 h-4 animate-pulse text-yellow-300" />
        <span className="whitespace-nowrap font-extrabold tracking-wider uppercase text-yellow-300">
          CLOSING SOON:
        </span>
      </div>

      <!-- Smooth Marquee Container -->
      <div className="flex-1 overflow-hidden flex items-center relative">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onTouchCancel={() => setIsPaused(false)}
          className={`animate-[marquee_130s_linear_infinite] md:animate-[marquee_90s_linear_infinite] group-hover:[animation-play-state:paused] whitespace-nowrap inline-block ${
            isPaused ? '[animation-play-state:paused]' : '[animation-play-state:running]'
          }`}
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {closingJobs.map((job, idx) => {
            const daysLeft = getDaysRemaining(job.closing_date);
            return (
              <span key={job.id} className="mx-4 md:mx-6">
                <Link to={`/jobs/${job.id}`} className="hover:underline hover:text-yellow-200 transition-colors">
                  <span className="font-semibold">{job.title}</span> {job.company ? `(${job.company})` : ''} 
                  <span className="ml-2 bg-white/20 text-white px-2 py-0.5 rounded-full text-[11px] font-bold">
                    {daysLeft <= 0 ? 'Closes Today!' : daysLeft === 1 ? 'Closing Tomorrow' : `in ${daysLeft} Days`}
                  </span>
                </Link>
                {idx < closingJobs.length - 1 && <span className="ml-4 md:ml-6 opacity-40">•</span>}
              </span>
            );
          })}

          {/* Seamless Duplicate Loop */}
          {closingJobs.map((job, idx) => {
            const daysLeft = getDaysRemaining(job.closing_date);
            return (
              <span key={job.id + '_dup'} className="mx-4 md:mx-6">
                <Link to={`/jobs/${job.id}`} className="hover:underline hover:text-yellow-200 transition-colors">
                  <span className="font-semibold">{job.title}</span> {job.company ? `(${job.company})` : ''} 
                  <span className="ml-2 bg-white/20 text-white px-2 py-0.5 rounded-full text-[11px] font-bold">
                    {daysLeft <= 0 ? 'Closes Today!' : daysLeft === 1 ? 'Closing Tomorrow' : `in ${daysLeft} Days`}
                  </span>
                </Link>
                {idx < closingJobs.length - 1 && <span className="ml-4 md:ml-6 opacity-40">•</span>}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
