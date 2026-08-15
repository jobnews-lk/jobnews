import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plane, ArrowLeft, Search, MapPin, FolderOpen, X } from 'lucide-react';
import { supabase, type Job, type Country, type Category } from '../lib/supabase';
import LatestJobFeed from '../components/LatestJobFeed';

export default function OverseasJobs() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const cached = localStorage.getItem('jn_ovs_jobs');
      const parsed = cached ? JSON.parse(cached) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });
  const [countries, setCountries] = useState<Country[]>(() => {
    try {
      const cached = localStorage.getItem('jn_ovs_countries');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const cached = localStorage.getItem('jn_ovs_categories');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(jobs.length === 0);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // 300ms Debounce for ultra-fast typing without lag
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let isSubscribed = true;

    async function load() {
      const isFiltered = Boolean(search || selectedCountry || selectedCategory);
      if (isFiltered || jobs.length === 0) {
        setLoading(true);
      }

      try {
        let query = supabase
          .from('jobs')
          .select('id, title, company, post_type, is_government, is_overseas, closing_date, created_at, location, salary, thumbnail_url, countries(id, name, slug), categories(id, name, slug), job_images(id, url), job_pdfs(id, url)')
          .eq('is_overseas', true)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (selectedCountry) {
          const ct = countries.find(c => c.slug === selectedCountry);
          if (ct) query = query.eq('country_id', ct.id);
        }

        if (selectedCategory) {
          const cat = categories.find(c => c.slug === selectedCategory);
          if (cat) query = query.eq('category_id', cat.id);
        }

        if (search) {
          query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const [jobRes, ctsRes, catsRes] = await Promise.all([
          query,
          countries.length === 0 ? supabase.from('countries').select('id, name, slug').order('name') : Promise.resolve(null),
          categories.length === 0 ? supabase.from('categories').select('id, name, slug').order('name') : Promise.resolve(null)
        ]);

        if (isSubscribed) {
          if (ctsRes?.data) {
            setCountries(ctsRes.data as Country[]);
            localStorage.setItem('jn_ovs_countries', JSON.stringify(ctsRes.data));
          }
          if (catsRes?.data) {
            setCategories(catsRes.data as Category[]);
            localStorage.setItem('jn_ovs_categories', JSON.stringify(catsRes.data));
          }
          if (!jobRes.error && jobRes.data) {
            setJobs(jobRes.data as Job[]);
            if (!isFiltered) {
              localStorage.setItem('jn_ovs_jobs', JSON.stringify(jobRes.data));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching overseas jobs:', err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }
    load();

    return () => {
      isSubscribed = false;
    };
  }, [search, selectedCountry, selectedCategory]);

  const activeFilters = useMemo(() => {
    const list: { label: string; type: string }[] = [];
    if (search) list.push({ label: `Search: ${search}`, type: 'search' });
    const ct = countries.find(c => c.slug === selectedCountry);
    if (ct) list.push({ label: ct.name, type: 'country' });
    const cat = categories.find(c => c.slug === selectedCategory);
    if (cat) list.push({ label: cat.name, type: 'category' });
    return list;
  }, [search, selectedCountry, selectedCategory, countries, categories]);

  const clearFilter = (type: string) => {
    if (type === 'search') {
      setSearch('');
      setSearchInput('');
    }
    if (type === 'country') setSelectedCountry('');
    if (type === 'category') setSelectedCategory('');
  };

  return (
    <div className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
              <Plane className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Overseas Jobs</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">International and overseas employment opportunities</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-6 transition-colors shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search overseas jobs by title, resort, or country..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-48">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-slate-800 transition-colors"
                >
                  <option value="">All Countries</option>
                  {countries.map(ct => <option key={ct.id} value={ct.slug}>{ct.name}</option>)}
                </select>
              </div>
              <div className="relative w-full sm:w-48">
                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-slate-800 transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {activeFilters.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                {f.label}
                <button onClick={() => clearFilter(f.type)} className="hover:text-blue-900 dark:hover:text-blue-200"><X className="w-3.5 h-3.5" /></button>
              </span>
            ))}
            <button onClick={() => { setSearch(''); setSearchInput(''); setSelectedCountry(''); setSelectedCategory(''); }} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline">Clear all</button>
          </div>
        )}

        <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {loading ? 'Loading notices...' : `${jobs.length} notice${jobs.length !== 1 ? 's' : ''} found`}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
                <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No overseas job notices match your search.</p>
          </div>
        ) : (
          <LatestJobFeed jobs={jobs} />
        )}
      </div>
    </div>
  );
}
