import { useEffect, useState } from 'react';
import { supabase, type Job } from '../lib/supabase';
import { useSavedJobs } from '../hooks/useSavedJobs';
import LatestJobFeed from '../components/LatestJobFeed';
import { Heart, Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SavedJobs() {
  const { savedJobIds } = useSavedJobs();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedJobs() {
      if (savedJobIds.length === 0) {
        setJobs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from('jobs')
        .select('*, countries(*), categories(*), job_images(*), job_pdfs(*)')
        .in('id', savedJobIds)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (data) {
        setJobs(data as Job[]);
      }
      setLoading(false);
    }

    loadSavedJobs();
  }, [savedJobIds]);

  return (
    <div className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Saved Jobs</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Jobs you have saved to view later.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
                <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No saved jobs yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              When you see a job you like, click the heart icon to save it here for later.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              <Search className="w-5 h-5" />
              Browse Jobs
            </Link>
          </div>
        ) : (
          <LatestJobFeed jobs={jobs} />
        )}
      </div>
    </div>
  );
}
