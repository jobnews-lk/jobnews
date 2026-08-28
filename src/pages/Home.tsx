import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, FolderOpen, ArrowRight, Building2, Calendar, FileText, ImageIcon, Type, Globe, Landmark, Plane, Briefcase, TrendingUp, Clock, Newspaper, ChevronRight } from 'lucide-react';
import { supabase, type Job, type Country, type Category } from '../lib/supabase';
import LatestJobFeed from '../components/LatestJobFeed';
import VacancyCardSkeleton from '../components/VacancyCardSkeleton';
import AdPlaceholder from '../components/AdPlaceholder';

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

export default function Home() {
  const [latestJobs, setLatestJobs] = useState<Job[]>(() => {
    try {
      const cached = localStorage.getItem('jn_v2_home_jobs');
      const parsed = cached ? JSON.parse(cached) : [];
      return Array.isArray(parsed) ? parsed.filter((j: Job) => j.status === 'published') : [];
    } catch (e) {
      return [];
    }
  });
  const [closingJobs, setClosingJobs] = useState<Job[]>(() => {
    try {
      const cached = localStorage.getItem('jn_v2_home_closing');
      const parsed = cached ? JSON.parse(cached) : [];
      return Array.isArray(parsed) ? parsed.filter((j: Job) => j.status === 'published') : [];
    } catch (e) {
      return [];
    }
  });
  const [countries, setCountries] = useState<Country[]>(() => {
    try {
      const cached = localStorage.getItem('jn_v2_home_countries');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const cached = localStorage.getItem('jn_v2_home_categories');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [search, setSearch] = useState('');
  const [searchCountry, setSearchCountry] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [fetchCompleted, setFetchCompleted] = useState(false);
  const [newJobsCount, setNewJobsCount] = useState<number>(0);
  const [pendingNewJobs, setPendingNewJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('jn_v2_home_jobs');
      const parsed = cached ? JSON.parse(cached) : [];
      const published = Array.isArray(parsed) ? parsed.filter((j: Job) => j.status === 'published') : [];
      return published.length === 0;
    } catch (e) {
      return true;
    }
  });
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Drag to scroll logic
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const [hasDragged, setHasDragged] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setHasDragged(false);
    if (carouselRef.current) {
      startX.current = e.pageX - carouselRef.current.offsetLeft;
      scrollLeftPos.current = carouselRef.current.scrollLeft;
      carouselRef.current.style.scrollSnapType = 'none';
      carouselRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    setIsHovered(false);
    if (carouselRef.current) {
      carouselRef.current.style.scrollSnapType = 'x mandatory';
      carouselRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (carouselRef.current) {
      carouselRef.current.style.scrollSnapType = 'x mandatory';
      carouselRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    if (Math.abs(walk) > 10) setHasDragged(true);
    carouselRef.current.scrollLeft = scrollLeftPos.current - walk;
  };
  
  useEffect(() => {
    try {
      localStorage.removeItem('jn_home_jobs');
      localStorage.removeItem('jn_home_closing');

      const cachedJobs = localStorage.getItem('jn_v2_home_jobs');
      if (cachedJobs) {
        const parsed = JSON.parse(cachedJobs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const published = parsed.filter((j: Job) => j.status === 'published');
          if (published.length > 0) {
            setLatestJobs(published);
            setLoading(false);
          }
        }
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }

    async function loadFreshJobs() {
      try {
        const latestRes = await supabase
          .from('jobs')
          .select('id, title, company, post_type, is_government, is_overseas, closing_date, created_at, location, salary, thumbnail_url, job_images(id, url)')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(24);

        if (latestRes.data && latestRes.data.length > 0) {
          setLatestJobs(latestRes.data as Job[]);
          try {
            localStorage.setItem('jn_v2_home_jobs', JSON.stringify(latestRes.data));
          } catch (e) {}
          setLoading(false);
          setFetchCompleted(true);
        } else {
          setLoading(false);
          setFetchCompleted(true);
        }

        Promise.all([
          supabase
            .from('jobs')
            .select('id, title, company, post_type, is_government, is_overseas, closing_date, created_at, location, salary, thumbnail_url, job_images(id, url), countries(name)')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(6),
          supabase.from('countries').select('id, name, slug').order('name'),
          supabase.from('categories').select('id, name, slug').order('name')
        ]).then(([closingRes, ctsRes, catsRes]) => {
          if (closingRes.data && closingRes.data.length > 0) {
            setClosingJobs(closingRes.data as Job[]);
          }
          if (ctsRes.data) setCountries(ctsRes.data as Country[]);
          if (catsRes.data) setCategories(catsRes.data as Category[]);
        }).catch(e => console.warn('Secondary fetch error:', e));

      } catch (err) {
        console.error('Home page load error:', err);
        setLoading(false);
        setFetchCompleted(true);
      }
    }

    loadFreshJobs();

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        loadFreshJobs();
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadFreshJobs();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(fallbackTimer);
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
          .select('id, title, company, post_type, is_government, is_overseas, closing_date, created_at, location, salary, thumbnail_url, job_images(id, url)')
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

  // Auto-scroll logic for mobile carousel
  useEffect(() => {
    if (!carouselRef.current || closingJobs.length <= 1 || isHovered) return;
    
    const interval = setInterval(() => {
      const container = carouselRef.current;
      if (!container) return;
      
      if (container.scrollWidth <= container.clientWidth) return;
      
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'auto' });
      } else {
        container.scrollBy({ left: container.clientWidth * 0.85, behavior: 'smooth' });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [closingJobs, isHovered]);

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
      {newJobsCount > 0 && (
        <div className="fixed top-16 md:top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce transition-all duration-300">
          <button
            onClick={() => {
              setLatestJobs(prev => {
                const updated = [...pendingNewJobs, ...prev];
                try {
                  localStorage.setItem('jn_v2_home_jobs', JSON.stringify(updated));
                } catch (e) {}
                return updated;
              });
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

      {/* ── CLOSING SOON SHOWCASE SECTION ── */}
      {closingJobs.length > 0 && !loading && (
        <section className="max-w-7xl mx-auto px-4 pt-10 pb-4">
          <div className="bg-red-50 dark:bg-red-950/60 border border-red-200/90 dark:border-red-900/60 rounded-2xl p-5 md:p-6 relative overflow-hidden transition-colors shadow-sm">
            <div className="absolute top-0 right-0 p-16 bg-red-100/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <h2 className="text-lg md:text-2xl font-bold text-red-700 dark:text-red-400 tracking-tight flex items-center gap-2">
                  <span>Closing Soon Vacancies</span>
                  <span className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 font-normal hidden sm:inline">(ළඟදීම අවසන් වන රැකියා)</span>
                </h2>
                <span className="ml-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">Urgent</span>
              </div>
              
              <button 
                onClick={() => {
                  if (carouselRef.current) {
                    const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
                    if (carouselRef.current.scrollLeft >= maxScroll - 10) {
                      carouselRef.current.scrollTo({ left: 0, behavior: 'auto' });
                    } else {
                      carouselRef.current.scrollBy({ left: carouselRef.current.clientWidth * 0.85, behavior: 'smooth' });
                    }
                  }
                }}
                className="flex md:hidden items-center gap-1 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 px-3 py-1 rounded-full transition-colors active:scale-95 text-xs font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div 
              ref={carouselRef} 
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={() => setIsHovered(true)}
              onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
              className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 xl:grid-cols-4 scrollbar-hide relative z-10 cursor-grab"
            >
              {closingJobs.map(job => {
                const daysLeft = getDaysRemaining(job.closing_date);
                const thumb = job.thumbnail_url || (job.job_images && job.job_images[0]?.url) || '';

                return (
                  <div key={job.id} className="min-w-[85vw] sm:min-w-[320px] md:min-w-0 snap-start flex-shrink-0">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="block bg-white dark:bg-slate-900 rounded-xl p-4 border border-red-200 dark:border-red-900/60 hover:shadow-md transition-all group h-full flex flex-col justify-between"
                    >
                      <div>
                        {thumb ? (
                          <div className="aspect-[16/9] rounded-lg overflow-hidden mb-3 bg-slate-100 relative">
                            <img src={thumb} alt={job.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                              {daysLeft <= 0 ? 'Closes Today!' : `Closing in ${daysLeft}d`}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between mb-2">
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                              {daysLeft <= 0 ? 'Closes Today!' : `Closing in ${daysLeft} Days`}
                            </span>
                            <span className="text-[11px] text-slate-400">Urgent</span>
                          </div>
                        )}
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 text-sm md:text-base">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium line-clamp-1">
                          🏢 {job.company || 'Official Vacancy'}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium truncate max-w-[150px]">
                          📍 {job.location || 'Sri Lanka'}
                        </span>
                        <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

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

        {loading ? (
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
