import { useState, useEffect } from 'react';
import { supabase, type Job } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopTicker() {
  const [closingJobs, setClosingJobs] = useState<Job[]>([]);

  useEffect(() => {
    async function fetchJobs() {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const { data } = await supabase
        .from('jobs')
        .select('id, title, company_name, closing_date')
        .eq('status', 'published')
        .gte('closing_date', today)
        .lte('closing_date', nextWeekStr)
        .order('closing_date', { ascending: true })
        .limit(5);

      if (data) {
        setClosingJobs(data as Job[]);
      }
    }
    fetchJobs();
  }, []);

  if (closingJobs.length === 0) return null;

  return (
    <div className="bg-red-600 text-white text-xs md:text-sm font-medium py-2 relative flex items-center w-full z-50">
      <div className="px-3 flex items-center gap-1.5 z-10 bg-red-600 shadow-[10px_0_10px_#dc2626]">
        <AlertCircle className="w-4 h-4 animate-pulse" />
        <span className="whitespace-nowrap font-bold tracking-wide">CLOSING SOON:</span>
      </div>
      <div className="flex-1 overflow-hidden flex items-center">
        <div className="animate-[marquee_25s_linear_infinite] whitespace-nowrap inline-block">
          {closingJobs.map((job, idx) => {
             const daysLeft = Math.ceil((new Date(job.closing_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
             return (
              <span key={job.id} className="mx-6">
                <Link to={`/jobs/${job.id}`} className="hover:underline hover:text-red-100 transition-colors">
                  {job.title} {job.company_name ? `(${job.company_name})` : ''} 
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
             const daysLeft = Math.ceil((new Date(job.closing_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
             return (
              <span key={job.id + 'dup'} className="mx-6">
                <Link to={`/jobs/${job.id}`} className="hover:underline hover:text-red-100 transition-colors">
                  {job.title} {job.company_name ? `(${job.company_name})` : ''} 
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
