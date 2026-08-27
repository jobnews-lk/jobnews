import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, FolderOpen, ArrowRight, Building2, Calendar, FileText, ImageIcon, Type, Globe, Landmark, Plane, Briefcase, TrendingUp, Clock, Newspaper, ChevronRight } from 'lucide-react';
import { supabase, type Job, type Country, type Category } from '../lib/supabase';
import LatestJobFeed from '../components/LatestJobFeed';
import VacancyCardSkeleton from '../components/VacancyCardSkeleton';
import AdPlaceholder from '../components/AdPlaceholder';

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
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('jn_v2_home_jobs');
      const parsed = cached ? JSON.parse(cached) : [];
      return !Array.isArray(parsed) || parsed.length === 0;
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
      carouselRef.current.style.scrollSnapType = 'none'; // Disable snap during drag
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
    const walk = (x - startX.current) * 2; // scroll-fast speed
    if (Math.abs(walk) > 10) setHasDragged(true);
    carouselRef.current.scrollLeft = scrollLeftPos.current - walk;
  };
  
  useEffect(() => {
    // 1. Instant Initial Cache Hydration from localStorage
    try {
      // Purge old v1 legacy caches from user browser
      localStorage.removeItem('jn_home_jobs');
      localStorage.removeItem('jn_home_closing');

      const cachedJobs = localStorage.getItem('jn_v2_home_jobs');
      const cachedClosing = localStorage.getItem('jn_v2_home_closing');
      const cachedCountries = localStorage.getItem('jn_v2_home_countries');
      const cachedCategories = localStorage.getItem('jn_v2_home_categories');

      if (cachedJobs) {
        const parsed = JSON.parse(cachedJobs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const published = parsed.filter((j: Job) => j.status === 'published');
          setLatestJobs(published);
          if (published.length > 0) setLoading(false);
        }
      }
      if (cachedClosing) {
        const parsed = JSON.parse(cachedClosing);
        if (Array.isArray(parsed)) setClosingJobs(parsed.filter((j: Job) => j.status === 'published'));
      }
      if (cachedCountries) setCountries(JSON.parse(cachedCountries));
      if (cachedCategories) setCategories(JSON.parse(cachedCategories));

      if (cachedJobs) {
        setLoading(false);
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }

    // 2. Optimized Parallel Database Fetch for Ultra Speed (100-300ms)
    async function load() {
      const todayStr = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 21);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      async function fetchWithRetry(retries = 2) {
        try {
          // 1. TOP PRIORITY FETCH: Latest published jobs
          const latestRes = await supabase
            .from('jobs')
            .select('id, title, company, post_type, is_government, is_overseas, closing_date, created_at, location, salary, thumbnail_url, job_images(id, url)')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(24);

          if (latestRes.data && latestRes.data.length > 0) {
            setLatestJobs(latestRes.data as Job[]);
            localStorage.setItem('jn_v2_home_jobs', JSON.stringify(latestRes.data));
            setLoading(false);
            setFetchCompleted(true);
          } else if (retries > 0) {
            // Retry if empty response received
            setTimeout(() => fetchWithRetry(retries - 1), 800);
            return;
          } else {
            setLoading(false);
            setFetchCompleted(true);
          }

          // 2. SECONDARY ASYNC FETCH: Closing jobs, countries, categories (does not block latestJobs!)
          Promise.all([
            supabase
              .from('jobs')
              .select('id, title, company, post_type, is_government, is_overseas, closing_date, created_at, location, salary, thumbnail_url, job_images(id, url), countries(name)')
              .eq('status', 'published')
              .gte('closing_date', todayStr)
              .lte('closing_date', futureDateStr)
              .order('closing_date', { ascending: true })
              .limit(6),
            supabase.from('countries').select('id, name, slug').order('name'),
            supabase.from('categories').select('id, name, slug').order('name')
          ]).then(async ([closingRes, ctsRes, catsRes]) => {
            let finalClosing = closingRes.data || [];
            if (finalClosing.length === 0) {
              const fallbackClosing = await supabase
                .from('jobs')
                .select('id, title, company, post_type, is_government, is_overseas, closing_date, created_at, location, salary, thumbnail_url, job_images(id, url), countries(name)')
                .eq('status', 'published')
                .gte('closing_date', todayStr)
                .order('closing_date', { ascending: true })
                .limit(6);
              if (fallbackClosing.data) finalClosing = fallbackClosing.data;
            }

            if (finalClosing.length > 0) {
              setClosingJobs(finalClosing as Job[]);
              localStorage.setItem('jn_v2_home_closing', JSON.stringify(finalClosing));
            }
            if (ctsRes.data) {
              setCountries(ctsRes.data as Country[]);
              localStorage.setItem('jn_v2_home_countries', JSON.stringify(ctsRes.data));
            }
            if (catsRes.data) {
              setCategories(catsRes.data as Category[]);
              localStorage.setItem('jn_v2_home_categories', JSON.stringify(catsRes.data));
            }
          }).catch(e => console.warn('Secondary fetch error:', e));

        } catch (err) {
          console.error('Home page load error (retrying...):', err);
          if (retries > 0) {
            setTimeout(() => fetchWithRetry(retries - 1), 1000);
          } else {
            setLoading(false);
            setFetchCompleted(true);
          }
        }
      }

      fetchWithRetry();
    }

    load();
  }, []);

  // Auto-scroll logic for mobile carousel
  useEffect(() => {
    if (!carouselRef.current || closingJobs.length <= 1 || isHovered) return;
    
    const interval = setInterval(() => {
      const container = carouselRef.current;
      if (!container) return;
      
      // We only want this on mobile where scrollWidth > clientWidth
      if (container.scrollWidth <= container.clientWidth) return;
      
      const maxScroll = container.scrollWidth - container.clientWidth;
      // If we are at the end, jump back to the start instantly (no rewind animation)
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'auto' });
      } else {
        // Scroll one card width (85vw + gap roughly)
        container.scrollBy({ left: container.clientWidth * 0.85, behavior: 'smooth' });
      }
    }, 4000); // 4 seconds interval

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
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-blue-900 text-white py-14 md:py-20 px-4">
        {/* Vibrant Blended Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900"></div>
        <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/30 via-blue-600/10 to-transparent blur-3xl opacity-70"></div>
        <div className="absolute bottom-[-50%] right-[-20%] w-[100%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-300/20 via-transparent to-transparent blur-3xl opacity-60"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-[100px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Newspaper className="w-4 h-4" />
            <span>Official Job Vacancy Announcements</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 leading-tight">
            Latest Job Vacancies
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-blue-200/90 mb-5 leading-tight tracking-wide" style={{ fontFamily: "'Noto Sans Sinhala', sans-serif" }}>
            නවතම රැකියා පුරප්පාඩු
          </h2>
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

      {/* ── TOP AD BANNER (Hidden for now until real ads are ready) ── */}
      {/* <section className="max-w-7xl mx-auto px-4 pt-10">
        <AdPlaceholder className="h-28 md:h-32 w-full" />
      </section> */}

      {/* ── CLOSING SOON SHOWCASE SECTION (Position 02: Below Hero Search & Sector Buttons) ── */}
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
              
              {/* Swipe/Next Button (Mobile only) */}
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
            
            {/* Horizontal Scroll on Mobile, Grid on Desktop */}
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
                const daysLeft = job.closing_date ? Math.ceil((new Date(job.closing_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 7;
                return (
                  <Link 
                    key={job.id} 
                    to={`/jobs/${job.id}`} 
                    onClick={(e) => { if (hasDragged) e.preventDefault(); }}
                    className="shrink-0 w-[85vw] md:w-auto snap-center block bg-white dark:bg-slate-900 rounded-xl p-4 border border-red-100 dark:border-red-900/80 shadow-sm hover:shadow-md hover:border-red-300 dark:hover:border-red-500 transition-all group overflow-hidden select-none"
                  >
                    
                    {/* Scrolling Marquee Title Container with Hover Pause & 38s Smooth Speed */}
                    <div className="flex w-full overflow-hidden relative mb-4">
                      <div className="whitespace-nowrap animate-[marquee_38s_linear_infinite] group-hover:[animation-play-state:paused] hover:[animation-play-state:paused] active:[animation-play-state:paused] flex items-center text-sm">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{job.title}</span>
                        {job.countries?.name && (
                          <span className="text-slate-500 font-medium ml-2 border-l border-slate-300 pl-2">Location: {job.countries.name}</span>
                        )}
                        {job.company && (
                          <span className="text-slate-500 dark:text-slate-400 font-medium ml-2 border-l border-slate-300 dark:border-slate-700 pl-2">{job.company}</span>
                        )}
                        
                        {/* Duplicate for seamless loop */}
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors ml-8">{job.title}</span>
                        {job.countries?.name && (
                          <span className="text-slate-500 font-medium ml-2 border-l border-slate-300 pl-2">Location: {job.countries.name}</span>
                        )}
                        {job.company && (
                          <span className="text-slate-500 font-medium ml-2 border-l border-slate-300 pl-2">{job.company}</span>
                        )}
                        <span className="ml-8"></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        {daysLeft <= 0 ? 'Closes Today' : `${daysLeft} Days Left`}
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 uppercase">{job.post_type}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── LATEST JOB NOTICES ── single mixed timeline ── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Latest Job Notices</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All official job announcements in chronological order</p>
          </div>
          <Link to="/jobs" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {latestJobs.length > 0 ? (
          <LatestJobFeed jobs={latestJobs} />
        ) : loading || !fetchCompleted ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <VacancyCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No job notices yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">New announcements will appear here as soon as they are published.</p>
          </div>
        )}
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Popular Categories</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Browse vacancies by job category</p>
          </div>
          <Link to="/jobs" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map(cat => (
            <Link key={cat.id} to={`/jobs?category=${cat.slug}`} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500 rounded-xl p-4 text-center transition-all hover:shadow-md">
              <FolderOpen className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
