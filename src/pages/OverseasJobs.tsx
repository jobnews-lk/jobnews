import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, ArrowLeft } from 'lucide-react';
import { supabase, type Job } from '../lib/supabase';
import LatestJobFeed from '../components/LatestJobFeed';

export default function OverseasJobs() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const cached = localStorage.getItem('jn_ovs_jobs');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('jn_ovs_jobs');
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      const cached = localStorage.getItem('jn_ovs_jobs');
      if (cached) {
        setJobs(JSON.parse(cached));
        setLoading(false);
      }
    } catch (e) {}

    async function load() {
      const { data } = await supabase
        .from('jobs')
        .select('*, countries(id, name, slug), categories(id, name, slug), job_images(id, url), job_pdfs(id, url)')
        .eq('is_overseas', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (data) {
        setJobs(data as Job[]);
        localStorage.setItem('jn_ovs_jobs', JSON.stringify(data));
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
              <Plane className="w-5 h-5 text-teal-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Overseas Jobs</h1>
          </div>
          <p className="text-slate-500">International and overseas employment opportunities</p>
        </div>

        <div className="mb-4 text-sm text-slate-500">
          {loading ? 'Loading notices...' : `${jobs.length} notice${jobs.length !== 1 ? 's' : ''} found`}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
                <div className="h-8 w-full bg-slate-200 rounded mb-3" />
                <div className="h-4 w-2/3 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-1/2 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No overseas job notices currently available.</p>
          </div>
        ) : (
          <LatestJobFeed jobs={jobs} />
        )}
      </div>
    </div>
  );
}
