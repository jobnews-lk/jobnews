import { useState, useEffect } from 'react';
import { supabase, type Job } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    // Delay network fetch slightly to allow main Home page jobs query top priority
    const timer = setTimeout(async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const futureWeek = new Date();
        futureWeek.setDate(futureWeek.getDate() + 21);
        const futureWeekStr = futureWeek.toISOString().split('T')[0];

        let { data } = await supabase
          .from('jobs')
          .select('id, title, company, closing_date')
          .eq('status', 'published')
          .gte('closing_date', today)
          .lte('closing_date', futureWeekStr)
          .order('closing_date', { ascending: true })
          .limit(8);

        if (!data || data.length === 0) {
          const fallbackRes = await supabase
            .from('jobs')
            .select('id, title, company, closing_date')
            .eq('status', 'published')
            .gte('closing_date', today)
            .order('closing_date', { ascending: true })
            .limit(8);
          data = fallbackRes.data;
        }

        if (!data || data.length === 0) {
          const fallbackRes2 = await supabase
            .from('jobs')
            .select('id, title, company, closing_date')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(8);
          data = fallbackRes2.data;
        }

        if (data && data.length > 0) {
          setClosingJobs(data as Job[]);
        }
      } catch (err) {
        console.warn('TopTicker fetch error:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  if (closingJobs.length === 0) return null;

  return (
    <div className="bg-red-600 text-white text-xs md:text-sm font-medium py-2 relative flex items-center w-full z-50 group">
      <div className="px-3 flex items-center gap-1.5 z-10 bg-red-600 shadow-[10px_0_10px_#dc2626]">
        <AlertCircle className="w-4 h-4 animate-pulse" />
        <span className="whitespace-nowrap font-bold tracking-wide">CLOSING SOON:</span>
      </div>
      <div className="flex-1 overflow-hidden flex items-center">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onTouchCancel={() => setIsPaused(false)}
          className={`animate-[marquee_95s_linear_infinite] md:animate-[marquee_60s_linear_infinite] group-hover:[animation-play-state:paused] whitespace-nowrap inline-block select-none ${
            isPaused ? '[animation-play-state:paused]' : '[animation-play-state:running]'
          }`}
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {closingJobs.map((job, idx) => {
            const daysLeft = job.closing_date ? Math.ceil((new Date(job.closing_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 7;
            return (
              <span key={job.id} className="mx-6">
                <Link to={`/jobs/${job.id}`} className="hover:underline hover:text-red-100 transition-colors">
                  {job.title} {job.company ? `(${job.company})` : ''} 
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {daysLeft <= 0 ? 'Closes Today!' : `in ${daysLeft} Days`}
                  </span>
                </Link>
                {idx < closingJobs.length - 1 && <span className="mx-6 opacity-40">•</span>}
              </span>
            );
          })}
          {/* Duplicate for seamless scrolling loop */}
          {closingJobs.map((job, idx) => {
            const daysLeft = job.closing_date ? Math.ceil((new Date(job.closing_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 7;
            return (
              <span key={job.id + 'dup'} className="mx-6">
                <Link to={`/jobs/${job.id}`} className="hover:underline hover:text-red-100 transition-colors">
                  {job.title} {job.company ? `(${job.company})` : ''} 
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {daysLeft <= 0 ? 'Closes Today!' : `in ${daysLeft} Days`}
                  </span>
                </Link>
                {idx < closingJobs.length - 1 && <span className="mx-6 opacity-40">•</span>}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
