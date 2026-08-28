import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, FolderOpen, ArrowRight, FileText, Landmark, Plane, Briefcase, TrendingUp } from 'lucide-react';
import { supabase, type Job, type Country, type Category } from '../lib/supabase';
import LatestJobFeed from '../components/LatestJobFeed';
import VacancyCardSkeleton from '../components/VacancyCardSkeleton';

const SUPABASE_URL = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

export default function Home() {
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [searchCountry, setSearchCountry] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [newJobsCount, setNewJobsCount] = useState<number>(0);
  const [pendingNewJobs, setPendingNewJobs] = useState<Job[]>([]);

  useEffect(() => {
    // Clear legacy localStorage cache keys to prevent mobile tab freezes
    try {
      localStorage.removeItem('jn_home_jobs');
      localStorage.removeItem('jn_home_closing');
      localStorage.removeItem('jn_v2_home_jobs');
      localStorage.removeItem('jn_v2_home_closing');
    } catch (e) {}

    let isMounted = true;

    async function loadFreshJobsWithRetry(attempt = 1) {
      if (!isMounted) return;
      
      try {
        // Tier 1: Primary Supabase JS SDK fetch
        const { data: jobsData, error: jobsErr } = await supabase
          .from('jobs')
          .select('id, title, company, post_type, is_government, is_overseas, closing_date, created_at, location, salary, thumbnail_url')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(30);

        if (jobsData && jobsData.length > 0 && isMounted) {
          setLatestJobs(jobsData as Job[]);
          setLoading(false);
          return;
        }

        // Tier 2: Direct HTTP Fetch fallback if SDK returns empty or error
        if (attempt <= 3 && isMounted) {
          console.warn(`Jobs query returned 0 rows or error on attempt ${attempt}. Retrying via direct HTTP...`, jobsErr);
          
          const rawEndpoint = `${SUPABASE_URL}/rest/v1/jobs?select=id,title,company,post_type,is_government,is_overseas,closing_date,created_at,location,salary,thumbnail_url&status=eq.published&order=created_at.desc&limit=30`;
          
          const res = await fetch(rawEndpoint, {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            }
          });

          if (res.ok) {
            const rawData = await res.json();
            if (Array.isArray(rawData) && rawData.length > 0 && isMounted) {
              setLatestJobs(rawData as Job[]);
              setLoading(false);
              return;
            }
          }

          // Retry after delay if still empty
          setTimeout(() => {
            if (isMounted) loadFreshJobsWithRetry(attempt + 1);
          }, 800 * attempt);
          return;
        }

        if (isMounted) setLoading(false);
      } catch (err) {
        console.error(`Home page load exception on attempt ${attempt}:`, err);
        if (attempt <= 3 && isMounted) {
          setTimeout(() => {
            if (isMounted) loadFreshJobsWithRetry(attempt + 1);
          }, 1000 * attempt);
        } else if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Load filter options asynchronously
    Promise.all([
      supabase.from('countries').select('id, name, slug').order('name'),
      supabase.from('categories').select('id, name, slug').order('name')
    ]).then(([ctsRes, catsRes]) => {
      if (ctsRes.data && isMounted) setCountries(ctsRes.data as Country[]);
      if (catsRes.data && isMounted) setCategories(catsRes.data as Category[]);
    }).catch(e => console.warn('Secondary options fetch error:', e));

    loadFreshJobsWithRetry();

    // Mobile Chrome BFCache / Tab Focus Restoration Engine
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        loadFreshJobsWithRetry();
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadFreshJobsWithRetry();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Smart Background Revalidation (Every 90s, active tab only)
  useEffect(() => {
    let timer: any;

    async function checkNewJobs() {
      if (document.hidden || latestJobs.length === 0) return;
      try {
        const latestCreatedAt = latestJobs[0]?.created_at;
        if (!latestCreatedAt) return;

        const { data } = await supabase
          .from('jobs')
          .select('id, title, company, post_type, is_government, is_overseas, closing_date, created_at, location, salary, thumbnail_url')
          .eq('status', 'published')
          .gt('created_at', latestCreatedAt)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const existingIds = new Set(latestJobs.map(j => j.id));
          const freshItems = (data as Job[]).filter(j => !existingIds.has(j.id));

          if (freshItems.length > 0) {
            setPendingNewJobs(freshItems);
            setNewJobsCount(freshItems.length);
          }
        }
      } catch (err) {
        console.warn('Background job check error:', err);
      }
    }

    timer = setInterval(checkNewJobs, 90000);
    return () => clearInterval(timer);
  }, [latestJobs]);

  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (searchCountry) params.set('country', searchCountry);
    if (searchCategory) params.set('category', searchCategory);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="relative">
      {/* 🔔 Floating New Jobs Notification Pill */}
      {newJobsCount > 0 && (
        <div className="fixed top-16 md:top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce transition-all duration-300">
          <button
            onClick={() => {
              setLatestJobs(prev => [...pendingNewJobs, ...prev]);
              setNewJobsCount(0);
              setPendingNewJobs([]);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg text-xs md:text-sm font-bold flex items-center gap-2 border-2 border-white cursor-pointer active:scale-95"
          >
            <span>✨ {newJobsCount} New Jobs Available</span>
            <span className="bg-white text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full font-black uppercase">Refresh</span>
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-12 md:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-xs font-semibold mb-4 backdrop-blur-sm border border-white/10">
            <FileText className="w-3.5 h-3.5 text-yellow-300" />
            Official Job Vacancy Announcements
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            Latest Job Vacancies
            <span className="block text-xl md:text-3xl font-semibold text-blue-200 mt-1 font-sans">
              නවතම රැකියා පුරප්පාඩු
            </span>
          </h1>
          <p className="text-base md:text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Browse official job notices from government, private sector, and overseas employers. Stay updated with the latest career opportunities.
          </p>
          <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 rounded-2xl p-3 max-w-3xl mx-auto shadow-lg border border-transparent dark:border-slate-800 transition-colors">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search job notices, titles, organizations..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-slate-700 transition-colors"
                />
              </div>
              <div className="relative md:w-44">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={searchCountry}
                  onChange={(e) => setSearchCountry(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors"
                >
                  <option value="">All Countries</option>
                  {countries.map(ct => <option key={ct.id} value={ct.slug}>{ct.name}</option>)}
                </select>
              </div>
              <div className="relative md:w-48">
                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
                </select>
              </div>
              <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors md:w-auto">
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-10 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/jobs" className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Latest Jobs</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">New announcements</p>
              </div>
            </div>
          </Link>
          <Link to="/government-jobs" className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Government</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Public sector</p>
              </div>
            </div>
          </Link>
          <Link to="/overseas-jobs" className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Overseas</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">International</p>
              </div>
            </div>
          </Link>
          <Link to="/private-jobs" className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Private Sector</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Companies & NGOs</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Main Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Latest Job Notices
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              All official job announcements in chronological order
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 group"
          >
            <span>View All Job Notices ({latestJobs.length})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading && latestJobs.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <VacancyCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <LatestJobFeed jobs={latestJobs} />
        )}
      </section>
    </div>
  );
}
