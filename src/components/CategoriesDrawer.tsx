import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FolderOpen, Smartphone, Search, Landmark, Building2, ExternalLink } from 'lucide-react';
import { type Category } from '../lib/supabase';
import { getCachedCategories, fetchFreshCategories } from '../lib/categoriesService';
import { 
  STATE_SECTORS, 
  STATE_INSTITUTIONS, 
  CORPORATE_SECTORS, 
  CORPORATE_COMPANIES,
  type StateInstitution,
  type CorporateCompany
} from '../data/institutionsData';

interface CategoriesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type DrawerTab = 'cats' | 'gov' | 'pvt';

export default function CategoriesDrawer({ isOpen, onClose }: CategoriesDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('cats');
  const [categories, setCategories] = useState<Category[]>(getCachedCategories);
  const [isStandalone, setIsStandalone] = useState(false);
  const navigate = useNavigate();

  // Government State Filter & Search
  const [govSector, setGovSector] = useState('all');
  const [govSearch, setGovSearch] = useState('');

  // Private Corporate Filter & Search
  const [pvtSector, setPvtSector] = useState('all');
  const [pvtSearch, setPvtSearch] = useState('');

  useEffect(() => {
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchFreshCategories().then(fresh => {
      if (fresh && fresh.length > 0) setCategories(fresh);
    });
  }, [isOpen]);

  // Filtered Government Institutions
  const filteredGov = useMemo(() => {
    const q = govSearch.toLowerCase().trim();
    return STATE_INSTITUTIONS.filter(item => {
      const matchSector = govSector === 'all' || item.sector === govSector;
      const matchQ = !q || 
        item.name_si.toLowerCase().includes(q) || 
        item.name_en.toLowerCase().includes(q) || 
        item.short_name.toLowerCase().includes(q) || 
        item.keywords.toLowerCase().includes(q);
      return matchSector && matchQ;
    });
  }, [govSector, govSearch]);

  // Filtered Private Companies
  const filteredPvt = useMemo(() => {
    const q = pvtSearch.toLowerCase().trim();
    return CORPORATE_COMPANIES.filter(item => {
      const matchSector = pvtSector === 'all' || item.sector === pvtSector;
      const matchQ = !q || 
        item.name.toLowerCase().includes(q) || 
        item.brand.toLowerCase().includes(q) || 
        item.sector_label.toLowerCase().includes(q) || 
        item.keywords.toLowerCase().includes(q);
      return matchSector && matchQ;
    });
  }, [pvtSector, pvtSearch]);

  const handleCategorySelect = (slug: string) => {
    onClose();
    navigate(slug ? `/jobs?category=${slug}` : '/jobs');
  };

  const handleInstitutionClick = (item: StateInstitution) => {
    onClose();
    // Search for vacancies from this institution
    navigate(`/government-jobs?q=${encodeURIComponent(item.short_name || item.name_si)}`);
  };

  const handleCompanyClick = (item: CorporateCompany) => {
    onClose();
    // Search for vacancies from this company
    navigate(`/private-jobs?q=${encodeURIComponent(item.brand || item.name)}`);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 md:hidden transition-opacity backdrop-blur-xs"
          onClick={onClose}
        />
      )}
      
      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 left-0 w-[88%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold shadow-xs">
              JN
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">Directory & Categories</h2>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">JobNews.lk Career Hub</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition-all"
            aria-label="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Modern Extensible Tabs */}
        <div className="p-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="flex rounded-xl bg-slate-200/90 dark:bg-slate-900 p-1 text-[11px] font-bold gap-1">
            
            {/* Tab 1: Fields */}
            <button
              onClick={() => setActiveTab('cats')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                activeTab === 'cats'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Fields</span>
            </button>

            {/* Tab 2: State / Government */}
            <button
              onClick={() => setActiveTab('gov')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                activeTab === 'gov'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>රාජ්‍ය</span>
            </button>

            {/* Tab 3: Corporate Private */}
            <button
              onClick={() => setActiveTab('pvt')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                activeTab === 'pvt'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>පුද්ගලික</span>
            </button>
          </div>
        </div>
        
        {/* ================= TAB 1: JOB CATEGORIES ================= */}
        {activeTab === 'cats' && (
          <div className="flex-1 overflow-y-auto p-3 pb-24">
            <div className="grid gap-1.5">
              <button
                onClick={() => handleCategorySelect('')}
                className="flex items-center justify-between w-full text-left p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-100 dark:border-blue-900/40 active:scale-98 transition-all"
              >
                <span>All Job Categories (සියලු ක්ෂේත්‍ර)</span>
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">All</span>
              </button>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className="flex items-center justify-between w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 active:bg-blue-50 dark:active:bg-blue-900/20"
                >
                  <span className="font-medium text-xs text-slate-800 dark:text-slate-200">{cat.name}</span>
                  <span className="text-slate-400 text-xs">›</span>
                </button>
              ))}

              {!isStandalone && (
                <>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                  <button
                    onClick={() => {
                      onClose();
                      window.dispatchEvent(new CustomEvent('open-pwa-install'));
                    }}
                    className="flex items-center gap-2.5 w-full text-left p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/60 dark:hover:to-indigo-900/60 transition-colors border border-blue-200/60 dark:border-blue-900/60 shadow-2xs"
                  >
                    <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="font-semibold text-xs">Add to Home Screen (මුල් තිරයට)</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: GOVERNMENT INSTITUTIONS ================= */}
        {activeTab === 'gov' && (
          <div className="flex-1 overflow-y-auto p-3 pb-24 space-y-2.5 bg-slate-50 dark:bg-slate-900/40">
            {/* Live Search inside drawer */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                value={govSearch}
                onChange={(e) => setGovSearch(e.target.value)}
                placeholder="ආයතනය සොයන්න (BOC, Customs, Navy)..." 
                className="w-full pl-8 pr-7 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {govSearch && (
                <button 
                  onClick={() => setGovSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Sector Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-[10px] no-scrollbar">
              {STATE_SECTORS.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setGovSector(sec.id)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                    govSector === sec.id
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {sec.icon} {sec.name_si}
                </button>
              ))}
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              <span>රාජ්‍ය ආයතන නාමාවලිය</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">
                {filteredGov.length} ආයතන
              </span>
            </div>

            {/* Institutions List */}
            <div className="space-y-1.5">
              {filteredGov.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  හමු නොවීය. වෙනත් නමක් සර්ච් කර බලන්න.
                </div>
              ) : (
                filteredGov.map(item => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/70 rounded-xl p-2.5 flex items-center justify-between shadow-2xs hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
                  >
                    <button
                      onClick={() => handleInstitutionClick(item)}
                      className="flex items-center gap-2 text-left flex-1 min-w-0"
                    >
                      <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-xs shrink-0">
                        {item.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.name_si}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {item.name_en} <span className="font-mono font-bold text-blue-600 dark:text-blue-400">({item.short_name})</span>
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0 ml-1.5">
                      <button
                        onClick={() => handleInstitutionClick(item)}
                        className="px-2 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-bold transition-colors"
                        title="රැකියා සොයන්න"
                      >
                        Jobs
                      </button>
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="නිල වෙබ් අඩවිය"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: PRIVATE SECTOR COMPANIES ================= */}
        {activeTab === 'pvt' && (
          <div className="flex-1 overflow-y-auto p-3 pb-24 space-y-2.5 bg-slate-50 dark:bg-slate-900/40">
            {/* Live Search inside drawer */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                value={pvtSearch}
                onChange={(e) => setPvtSearch(e.target.value)}
                placeholder="සමාගම සොයන්න (JKH, MAS, WSO2, Dialog)..." 
                className="w-full pl-8 pr-7 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {pvtSearch && (
                <button 
                  onClick={() => setPvtSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Sector Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-[10px] no-scrollbar">
              {CORPORATE_SECTORS.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setPvtSector(sec.id)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                    pvtSector === sec.id
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {sec.icon} {sec.name_si}
                </button>
              ))}
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              <span>ප්‍රමුඛ සමාගම් නාමාවලිය</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                {filteredPvt.length} සමාගම්
              </span>
            </div>

            {/* Companies List */}
            <div className="space-y-1.5">
              {filteredPvt.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  සමාගම හමු නොවීය. වෙනත් නමක් සර්ච් කර බලන්න.
                </div>
              ) : (
                filteredPvt.map(item => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/70 rounded-xl p-2.5 flex items-center justify-between shadow-2xs hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors group"
                  >
                    <button
                      onClick={() => handleCompanyClick(item)}
                      className="flex items-center gap-2 text-left flex-1 min-w-0"
                    >
                      <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center text-xs shrink-0">
                        {item.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {item.sector_label} <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">({item.brand})</span>
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0 ml-1.5">
                      <button
                        onClick={() => handleCompanyClick(item)}
                        className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-md text-[10px] font-bold transition-colors"
                        title="රැකියා සොයන්න"
                      >
                        Jobs
                      </button>
                      <a
                        href={item.careers_url || item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Official Careers Portal"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bottom Drawer Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span className="font-medium">🇱🇰 Sri Lanka Careers Master Hub</span>
          <span className="text-blue-600 dark:text-blue-400 font-extrabold">JobNews.lk</span>
        </div>
      </div>
    </>
  );
}
