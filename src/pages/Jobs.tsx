import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, MapPin, FolderOpen } from 'lucide-react';
import { supabase, type Job, type Country, type Category } from '../lib/supabase';
import LatestJobFeed from '../components/LatestJobFeed';

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const initialSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const activeFilters = useMemo(() => {
    const list: { label: string; type: string }[] = [];
    if (search) list.push({ label: `Search: ${search}`, type: 'search' });
    const c = countries.find(ct => ct.slug === selectedCountry);
    if (c) list.push({ label: c.name, type: 'country' });
    const cat = categories.find(c => c.slug === selectedCategory);
    if (cat) list.push({ label: cat.name, type: 'category' });
    return list;
  }, [search, selectedCountry, selectedCategory, countries, categories]);

  useEffect(() => {
    async function loadData() {
      const [ctsRes, catsRes] = await Promise.all([
        supabase.from('countries').select('*').order('name'),
        supabase.from('categories').select('*').order('name')
      ]);
      if (ctsRes.data) setCountries(ctsRes.data);
      if (catsRes.data) setCategories(catsRes.data);
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      let query = supabase.from('jobs').select('*, countries(*), categories(*), job_images(*), job_pdfs(*)').eq('status', 'published').order('created_at', { ascending: false });
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
      const { data } = await query;
      if (data) setJobs(data as Job[]);
      setLoading(false);
    }
    if (countries.length > 0 && categories.length > 0) {
      loadJobs();
    }
  }, [search, selectedCountry, selectedCategory, countries, categories]);

  useEffect(() => {
    const sp = new URLSearchParams();
    if (search) sp.set('search', search);
    if (selectedCountry) sp.set('country', selectedCountry);
    if (selectedCategory) sp.set('category', selectedCategory);
    setSearchParams(sp, { replace: true });
  }, [search, selectedCountry, selectedCategory]);

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">All Job Notices</h1>
          <p className="text-slate-500 dark:text-slate-400">Browse all official job announcements and vacancies</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-6 transition-colors">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by title, organization, or keyword..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
          <div className={`mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 ${showFilters ? '' : 'hidden sm:grid'}`}>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-slate-800 transition-colors">
                <option value="">All Countries</option>
                {countries.map(ct => <option key={ct.id} value={ct.slug}>{ct.name}</option>)}
              </select>
            </div>
            <div className="relative">
              <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-slate-800 transition-colors">
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {activeFilters.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                {f.label}
                <button onClick={() => clearFilter(f.type)} className="hover:text-blue-900"><X className="w-3.5 h-3.5" /></button>
              </span>
            ))}
            <button onClick={() => { setSearch(''); setSearchInput(''); setSelectedCountry(''); setSelectedCategory(''); }} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline">Clear all</button>
          </div>
        )}

        {/* Results count */}
        <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
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
            <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No job notices match your search</p>
          </div>
        ) : (
          <LatestJobFeed jobs={jobs} />
        )}
      </div>
    </div>
  );
}
