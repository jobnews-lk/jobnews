import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, FolderOpen, ArrowRight, FileText, Landmark, Plane, Briefcase, TrendingUp, Loader2, ChevronDown } from 'lucide-react';
import { supabase, type Job, type Country, type Category } from '../lib/supabase';
import { getCachedCategories, getCachedCountries, fetchFreshCategories, fetchFreshCountries } from '../lib/categoriesService';
import LatestJobFeed from '../components/LatestJobFeed';
import VacancyCardSkeleton from '../components/VacancyCardSkeleton';
import { syncUnreadJobsCount, setNativeAppBadge, markJobsAsSeen } from '../lib/appBadgeService';

const SUPABASE_URL = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

export default function Home() {
  // Instant 0ms cache hydration from localStorage
  const [latestJobs, setLatestJobs] = useState<Job[]>(() => {
    try {
      const cached = localStorage.getItem('jn_v3_home_jobs');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const published = parsed.filter((j: Job) => j.status === 'published');
          if (published.length > 0) return published;
        }
      }
    } catch (e) {}
    return [];
  });

  const [countries, setCountries] = useState<Country[]>(getCachedCountries);
  const [categories, setCategories] = useState<Category[]>(getCachedCategories);
  const [search, setSearch] = useState('');
  const [searchCountry, setSearchCountry] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [loading, setLoading] = useState<boolean>(() => latestJobs.length === 0);
  const [newJobsCount, setNewJobsCount] = useState<number>(0);
  const [pendingNewJobs, setPendingNewJobs] = useState<Job[]>([]);
  const [openQuickDropdown, setOpenQuickDropdown] = useState<'gov' | 'pvt' | 'ovs' | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.quick-stats-dropdown-container')) {
        setOpenQuickDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadFreshJobsWithRetry(attempt = 1) {
      if (!isMounted) return;
      
      try {
        // Tier 1: Primary Supabase JS SDK fetch with job_images relation
        const { data: jobsData, error: jobsErr } = await supabase
          .from('jobs')
          .select('id, slug, title, company, post_type, is_government, is_overseas, closing_date, created_at, location, salary, thumbnail_url, job_images(id, url, sort_order)')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(30);

        if (jobsData && jobsData.length > 0 && isMounted) {
          setLatestJobs(jobsData as Job[]);
          syncUnreadJobsCount(jobsData as Job[]);
          try {
            localStorage.setItem('jn_v3_home_jobs', JSON.stringify(jobsData));
          } catch (e) {}
          setLoading(false);
          return;
        }

        // Tier 2: Direct HTTP Fetch fallback if SDK returns empty or error
        if (attempt <= 3 && isMounted) {
          console.warn(`Jobs query returned 0 rows or error on attempt ${attempt}. Retrying via direct HTTP...`, jobsErr);
          
          const rawEndpoint = `${SUPABASE_URL}/rest/v1/jobs?select=id,slug,title,company,post_type,is_government,is_overseas,closing_date,created_at,location,salary,thumbnail_url,job_images(id,url,sort_order)&status=eq.published&order=created_at.desc&limit=30`;
          
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
              syncUnreadJobsCount(rawData as Job[]);
              try {
                localStorage.setItem('jn_v3_home_jobs', JSON.stringify(rawData));
              } catch (e) {}
              setLoading(false);
              return;
            }
          }

          // Retry after delay if still empty
          setTimeout(() => {
            if (isMounted) loadFreshJobsWithRetry(attempt + 1);
          }, 600 * attempt);
          return;
        }

        if (isMounted) setLoading(false);
      } catch (err) {
        console.error(`Home page load exception on attempt ${attempt}:`, err);
        if (attempt <= 3 && isMounted) {
          setTimeout(() => {
            if (isMounted) loadFreshJobsWithRetry(attempt + 1);
          }, 800 * attempt);
        } else if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Load filter options asynchronously with resilient fallback and caching
    fetchFreshCountries().then(cts => {
      if (cts && isMounted) setCountries(cts);
    });
    fetchFreshCategories().then(cats => {
      if (cats && isMounted) setCategories(cats);
    });

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
          .select('id, slug, title, company, post_type, is_government, is_overseas, closing_date, created_at, location, salary, thumbnail_url, job_images(id, url, sort_order)')
          .eq('status', 'published')
          .gt('created_at', latestCreatedAt)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const existingIds = new Set(latestJobs.map(j => j.id));
          const freshItems = (data as Job[]).filter(j => !existingIds.has(j.id));

          if (freshItems.length > 0) {
            setPendingNewJobs(freshItems);
            setNewJobsCount(freshItems.length);
            setNativeAppBadge(freshItems.length);
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
              markJobsAsSeen();
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

      {/* Quick Stats with Floating Sectors Dropdowns */}
      <section className="py-10 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Card 1: Latest Jobs */}
          <Link to="/jobs" className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md transition-all group flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Latest Jobs</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">New announcements</p>
              </div>
            </div>
          </Link>

          {/* Card 2: Government (with Floating Dropdown) */}
          <div className="relative quick-stats-dropdown-container">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between group">
              <Link to="/government-jobs" className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors truncate">Government</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Public sector</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenQuickDropdown(prev => prev === 'gov' ? null : 'gov');
                }}
                className={`p-1.5 rounded-lg transition-all ml-1 shrink-0 ${
                  openQuickDropdown === 'gov'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200/70 dark:bg-slate-700/70 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300'
                }`}
                title="View Government Sectors"
                aria-label="View Government Sectors"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openQuickDropdown === 'gov' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Floating Dropdown: Government Sectors */}
            {openQuickDropdown === 'gov' && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2.5 z-40 min-w-[280px]">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-1">
                  <span>රාජ්‍ය අංශ (State Sectors)</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">150+ Total</span>
                </div>
                <div className="space-y-0.5 text-xs font-medium">
                  <Link to="/government-jobs?q=Bank" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    <span className="flex items-center gap-2"><span>🏦</span> <strong>රජයේ බැංකු</strong> (BOC, PB, NSB)</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-bold">9</span>
                  </Link>
                  <Link to="/government-jobs?q=Army" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    <span className="flex items-center gap-2"><span>🛡️</span> <strong>ආරක්ෂක අංශ</strong> (Army, Navy, Police)</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-bold">5</span>
                  </Link>
                  <Link to="/government-jobs?q=University" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    <span className="flex items-center gap-2"><span>🎓</span> <strong>විශ්වවිද්‍යාල</strong> (Colombo, Moratuwa)</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-bold">17</span>
                  </Link>
                  <Link to="/government-jobs?q=Ministry" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    <span className="flex items-center gap-2"><span>🏛️</span> <strong>අමාත්‍යාංශ</strong> (Ministries)</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-bold">25</span>
                  </Link>
                  <Link to="/government-jobs?q=Board" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    <span className="flex items-center gap-2"><span>⚡</span> <strong>සංස්ථා & මණ්ඩල</strong> (CEB, CPC, Water)</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-bold">35+</span>
                  </Link>
                  <Link to="/government-jobs?q=Department" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    <span className="flex items-center gap-2"><span>📑</span> <strong>දෙපාර්තමේන්තු</strong> (Customs, IRD, DMT)</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-bold">30+</span>
                  </Link>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link to="/government-jobs" onClick={() => setOpenQuickDropdown(null)} className="block text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors">
                    🏛️ සියලු රජයේ රැකියා බලන්න ➔
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Overseas (with Floating Dropdown) */}
          <div className="relative quick-stats-dropdown-container">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between group">
              <Link to="/overseas-jobs" className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Plane className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors truncate">Overseas</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">International</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenQuickDropdown(prev => prev === 'ovs' ? null : 'ovs');
                }}
                className={`p-1.5 rounded-lg transition-all ml-1 shrink-0 ${
                  openQuickDropdown === 'ovs'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200/70 dark:bg-slate-700/70 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300'
                }`}
                title="View Overseas Destinations"
                aria-label="View Overseas Destinations"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openQuickDropdown === 'ovs' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Floating Dropdown: Overseas Destinations */}
            {openQuickDropdown === 'ovs' && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2.5 z-40 min-w-[280px]">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-1">
                  <span>ප්‍රමුඛ රටවල් (Top Destinations)</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">Global</span>
                </div>
                <div className="space-y-0.5 text-xs font-medium">
                  <Link to="/overseas-jobs?country=united-arab-emirates" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    <span className="flex items-center gap-2"><span>🇦🇪</span> <strong>එක්සත් අරාබි එමීර්</strong> (UAE / Dubai)</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-bold">Gulf</span>
                  </Link>
                  <Link to="/overseas-jobs?country=maldives" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    <span className="flex items-center gap-2"><span>🇲🇻</span> <strong>මාලදිවයින</strong> (Maldives Resorts)</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-bold">Hotels</span>
                  </Link>
                  <Link to="/overseas-jobs?country=qatar" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    <span className="flex items-center gap-2"><span>🇶🇦</span> <strong>කටාර්</strong> (Qatar)</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-bold">Doha</span>
                  </Link>
                  <Link to="/overseas-jobs?country=saudi-arabia" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    <span className="flex items-center gap-2"><span>🇸🇦</span> <strong>සෞදි අරාබිය</strong> (Saudi Arabia)</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-bold">KSA</span>
                  </Link>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link to="/overseas-jobs" onClick={() => setOpenQuickDropdown(null)} className="block text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors">
                    ✈️ සියලු විදේශ රැකියා බලන්න ➔
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Private Sector (with Floating Dropdown) */}
          <div className="relative quick-stats-dropdown-container">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-between group">
              <Link to="/private-jobs" className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">Private Sector</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Companies & NGOs</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenQuickDropdown(prev => prev === 'pvt' ? null : 'pvt');
                }}
                className={`p-1.5 rounded-lg transition-all ml-1 shrink-0 ${
                  openQuickDropdown === 'pvt'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200/70 dark:bg-slate-700/70 hover:bg-emerald-600 hover:text-white text-slate-600 dark:text-slate-300'
                }`}
                title="View Corporate Industries"
                aria-label="View Corporate Industries"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openQuickDropdown === 'pvt' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Floating Dropdown: Private Corporate Industries */}
            {openQuickDropdown === 'pvt' && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2.5 z-40 min-w-[280px]">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-1">
                  <span>පුද්ගලික අංශ (Corporate Industries)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">Top Firms</span>
                </div>
                <div className="space-y-0.5 text-xs font-medium">
                  <Link to="/private-jobs?q=Software" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                    <span className="flex items-center gap-2"><span>💻</span> <strong>IT & Software</strong> (WSO2, IFS)</span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">Tech</span>
                  </Link>
                  <Link to="/private-jobs?q=Bank" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                    <span className="flex items-center gap-2"><span>🏦</span> <strong>පුද්ගලික බැංකු</strong> (ComBank, Sampath)</span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">Banks</span>
                  </Link>
                  <Link to="/private-jobs?q=Holdings" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                    <span className="flex items-center gap-2"><span>🏢</span> <strong>Conglomerates</strong> (JKH, Hayleys)</span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">Top 10</span>
                  </Link>
                  <Link to="/private-jobs?q=Apparel" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                    <span className="flex items-center gap-2"><span>🧵</span> <strong>ඇඟලුම් & නිෂ්පාදන</strong> (MAS, Brandix)</span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">Apparel</span>
                  </Link>
                  <Link to="/private-jobs?q=Hotels" onClick={() => setOpenQuickDropdown(null)} className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                    <span className="flex items-center gap-2"><span>🏨</span> <strong>හෝටල් & සංචාරක</strong> (Cinnamon, Jetwing)</span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">Hotels</span>
                  </Link>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link to="/private-jobs" onClick={() => setOpenQuickDropdown(null)} className="block text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors">
                    🏢 සියලු පුද්ගලික රැකියා බලන්න ➔
                  </Link>
                </div>
              </div>
            )}
          </div>

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
          
          {/* Smart Loading Header Indicator */}
          {loading && latestJobs.length === 0 ? (
            <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-3.5 py-1.5 rounded-full text-xs font-semibold animate-pulse border border-blue-200/60 dark:border-blue-900/60 shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
              <span>Loading Job Vacancies...</span>
            </span>
          ) : (
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 group"
            >
              <span>View All Job Notices ({latestJobs.length})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
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
