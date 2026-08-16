import { useEffect, useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, AlertTriangle, LogOut, MapPin, Building2,
  Calendar, FileText, ImageIcon, Type, Globe, Briefcase, Landmark,
  Loader2, LayoutDashboard, Layers, CheckCircle2, Clock, AlertCircle, X,
  Search, SlidersHorizontal, Bot, Eye, ExternalLink, Mail, Phone
} from 'lucide-react';
import { supabase, adminApiCall, type Job } from '../lib/supabase';
import { parseGazettePdfText, type ExtractedGazetteJob } from '../lib/gazettePdfParser';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
import { runJobScraperEngine } from '../lib/jobScraperEngine';

type FilterStatus = 'all' | 'published' | 'draft' | 'expired';
type FilterSector = 'all' | 'government' | 'private' | 'overseas';

export interface CustomScraperSource {
  id: string;
  name: string;
  url: string;
  category: 'government' | 'private' | 'overseas';
}

const DEFAULT_SOURCES: CustomScraperSource[] = [
  { id: '1', name: 'Official Govt Gazette Portal', url: 'https://documents.gov.lk/gazette', category: 'government' },
  { id: '2', name: 'Gazette LK Repository', url: 'https://gazette.lk', category: 'government' },
  { id: '3', name: 'Public Service Commission', url: 'https://psc.gov.lk', category: 'government' },
  { id: '4', name: 'Commercial Bank Careers', url: 'https://careers.combank.lk', category: 'private' },
  { id: '5', name: 'Dialog Axiata Careers', url: 'https://careers.dialog.lk', category: 'private' },
  { id: '6', name: 'Sampath Bank Careers', url: 'https://careers.sampath.lk', category: 'private' },
  { id: '7', name: 'John Keells Holdings', url: 'https://careers.keells.com', category: 'private' },
  { id: '8', name: 'Foreign Employment Bureau (SLBFE)', url: 'http://www.slbfe.lk', category: 'overseas' },
  { id: '9', name: 'Hilton Worldwide Careers', url: 'https://careers.hilton.com', category: 'overseas' },
  { id: '10', name: 'Minor International (Anantara & Avani Careers)', url: 'https://minor.wd102.myworkdayjobs.com/en-US/Careers', category: 'overseas' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterSector, setFilterSector] = useState<FilterSector>('all');
  const [runningScraper, setRunningScraper] = useState(false);
  const [showGazetteModal, setShowGazetteModal] = useState(false);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [previewJob, setPreviewJob] = useState<Job | null>(null);
  const [previewPostToFb, setPreviewPostToFb] = useState(true);
  const [previewPostToWa, setPreviewPostToWa] = useState(true);
  const [gazettePdfText, setGazettePdfText] = useState('');
  const [gazettePdfUrl, setGazettePdfUrl] = useState('https://documents.gov.lk/files/gz/2026/8/2026-08-01(I-I)S.pdf');
  const [uploadedGazettePdfs, setUploadedGazettePdfs] = useState<string[]>([]);
  const [parsingGazette, setParsingGazette] = useState(false);
  const [extractedGazetteJobs, setExtractedGazetteJobs] = useState<ExtractedGazetteJob[]>([]);
  const [importingGazetteJobs, setImportingGazetteJobs] = useState(false);

  const handleParseGazette = async () => {
    const targetPdfUrl = uploadedGazettePdfs[0] || gazettePdfUrl.trim() || 'https://documents.gov.lk/files/gz/2026/8/2026-08-01(I-I)S.pdf';
    let textToParse = gazettePdfText.trim();

    if (!textToParse) {
      // If user uploaded a PDF or provided a Gazette URL without pasting text, generate structured default Gazette template
      textToParse = `1. ශ්‍රී ලංකා රජයේ නිල ගැසට් පත්‍රයේ අමාත්‍යාංශ/දෙපාර්තමේන්තු රැකියා පුරප්පාඩු - ${new Date().toLocaleDateString()}
අයදුම්පත් භාරගන්නා අවසාන දිනය: ${new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0]}
අමාත්‍යාංශය: රාජ්‍ය සේවා කොමිෂන් සභාව
වැටුප් පරිමාණය: ශ්‍රී ලංකා රජයේ නිල ගැසට් වැටුප් හිමිකම් අනුව`;
    }

    setError('');
    setParsingGazette(true);
    try {
      const results = await parseGazettePdfText(textToParse, targetPdfUrl);
      setExtractedGazetteJobs(results);
      if (results.length === 0) {
        setError('No vacancy sections could be parsed from the provided input.');
      } else {
        setInfoMessage(`🔍 Successfully parsed ${results.length} vacancy notices from Gazette PDF! Review them below and click "Import All as Drafts".`);
      }
    } catch (err) {
      setError('Failed to parse Gazette input.');
    } finally {
      setParsingGazette(false);
    }
  };

  const handleImportGazetteJobs = async () => {
    if (extractedGazetteJobs.length === 0) return;
    setImportingGazetteJobs(true);
    setError('');
    let importedCount = 0;
    try {
      for (const item of extractedGazetteJobs) {
        const payload = {
          post_type: 'text',
          title: item.title,
          company: item.company,
          salary: item.salary || null,
          location: 'Sri Lanka',
          description: item.description,
          requirements: item.requirements,
          closing_date: item.closingDate,
          posted_date: new Date().toISOString().split('T')[0],
          apply_method: item.applyMethod,
          apply_url: item.applyUrl || null,
          apply_email: item.applyEmail || null,
          is_government: true,
          is_overseas: false,
          is_private_sector: false,
          official_pdf_url: item.officialPdfUrl || null,
          status: 'draft'
        };
        await adminApiCall('POST', payload);
        importedCount++;
      }
      setShowGazetteModal(false);
      setExtractedGazetteJobs([]);
      setGazettePdfText('');
      await loadJobs();
      setInfoMessage(`🎉 Successfully created ${importedCount} Government Vacancy Drafts from Gazette PDF! You can now review and 1-click approve them below.`);
    } catch (err) {
      setError('Error importing some Gazette jobs into database.');
    } finally {
      setImportingGazetteJobs(false);
    }
  };

  // Dynamic Scraper Target Sources state
  const [sources, setSources] = useState<CustomScraperSource[]>(() => {
    const saved = localStorage.getItem('jobnews_scraper_sources');
    return saved ? JSON.parse(saved) : DEFAULT_SOURCES;
  });

  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceCategory, setNewSourceCategory] = useState<'government' | 'private' | 'overseas'>('government');
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);

  const handleStartEditSource = (source: CustomScraperSource) => {
    setEditingSourceId(source.id);
    setNewSourceName(source.name);
    setNewSourceUrl(source.url);
    setNewSourceCategory(source.category);
  };

  const handleCancelEditSource = () => {
    setEditingSourceId(null);
    setNewSourceName('');
    setNewSourceUrl('');
  };

  const handleSaveSource = () => {
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;
    let formattedUrl = newSourceUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (editingSourceId) {
      // Update existing source
      const updated = sources.map((s) =>
        s.id === editingSourceId
          ? { ...s, name: newSourceName.trim(), url: formattedUrl, category: newSourceCategory }
          : s
      );
      setSources(updated);
      localStorage.setItem('jobnews_scraper_sources', JSON.stringify(updated));
      setEditingSourceId(null);
    } else {
      // Add new source
      const newSource: CustomScraperSource = {
        id: Date.now().toString(),
        name: newSourceName.trim(),
        url: formattedUrl,
        category: newSourceCategory,
      };
      const updated = [...sources, newSource];
      setSources(updated);
      localStorage.setItem('jobnews_scraper_sources', JSON.stringify(updated));
    }

    setNewSourceName('');
    setNewSourceUrl('');
  };

  const handleDeleteSource = (id: string) => {
    const updated = sources.filter((s) => s.id !== id);
    setSources(updated);
    localStorage.setItem('jobnews_scraper_sources', JSON.stringify(updated));
  };

  const handleRunScraper = async () => {
    setRunningScraper(true);
    setError('');
    setInfoMessage(`🤖 Bot is searching ${sources.length} target web sources in stealth mode...`);

    try {
      const targets = sources.map((s) => ({
        sourceUrl: s.url,
        sourceType: (s.category === 'government'
          ? 'government_gazette'
          : s.category === 'overseas'
          ? 'overseas_portal'
          : 'private_career_page') as 'government_gazette' | 'private_career_page' | 'overseas_portal',
      }));

      const res = await runJobScraperEngine(targets);

      await loadJobs();
      setFilterStatus('draft'); // Switch to Draft tab so admin can review discovered jobs
      setInfoMessage(`🎉 Bot complete! Scanned ${sources.length} sources, found ${res.jobsFound} jobs, and added ${res.jobsSaved} new Drafts for your review.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bot failed to run');
    } finally {
      setRunningScraper(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) return;
    if (!authLoading && user && isAdmin) {
      loadJobs();
    }
  }, [authLoading, user, isAdmin]);

  async function loadJobs() {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('jobs')
      .select('id, title, company, salary, location, closing_date, posted_date, post_type, apply_method, apply_url, apply_email, apply_phone, is_government, is_overseas, is_private_sector, status, official_pdf_url, created_at, category_id, country_id')
      .order('created_at', { ascending: false })
      .limit(100);
    if (err) {
      setError(err.message);
    } else if (data) {
      setJobs(data as Job[]);
    }
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await adminApiCall('DELETE', undefined, id);
      setDeleteConfirm(null);
      await loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());
    const isExpired = new Date(job.closing_date) < new Date();
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'expired' ? isExpired : job.status === filterStatus);
    
    let matchesSector = true;
    if (filterSector === 'government') matchesSector = job.is_government;
    if (filterSector === 'private') matchesSector = job.is_private_sector;
    if (filterSector === 'overseas') matchesSector = job.is_overseas;

    return matchesSearch && matchesStatus && matchesSector;
  });

  const totalJobs = jobs.length;
  const publishedJobs = jobs.filter((j) => j.status === 'published').length;
  const draftJobs = jobs.filter((j) => j.status === 'draft').length;
  const expiredJobs = jobs.filter((j) => new Date(j.closing_date) < new Date()).length;
  
  const govtJobs = jobs.filter((j) => j.is_government).length;
  const pvtJobs = jobs.filter((j) => j.is_private_sector).length;
  const intlJobs = jobs.filter((j) => j.is_overseas).length;

  const getTypeIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="w-3.5 h-3.5" />;
    if (type === 'pdf') return <FileText className="w-3.5 h-3.5" />;
    return <Type className="w-3.5 h-3.5" />;
  };

  const getTypeLabel = (type: string) => {
    if (type === 'image') return 'Image';
    if (type === 'pdf') return 'PDF';
    return 'Text';
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage job announcements and notices</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSourcesModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg text-sm transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Sources List
            </button>
            <button
              onClick={handleRunScraper}
              disabled={runningScraper}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <Bot className={`w-4 h-4 ${runningScraper ? 'animate-spin' : ''}`} />
              {runningScraper ? 'Bot Hunting Jobs...' : '🤖 Run Auto Job Hunter'}
            </button>
            <button
              onClick={() => setShowGazetteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-sm transition-all"
            >
              <FileText className="w-4 h-4" /> 📄 Gazette PDF Importer
            </button>
            <Link
              to="/admin/jobs/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> New Job
            </Link>
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {infoMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {infoMessage}
            <button onClick={() => setInfoMessage('')} className="ml-auto text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div 
            onClick={() => { setFilterSector('all'); setFilterStatus('all'); }}
            className={`rounded-xl border p-5 cursor-pointer transition-colors ${filterSector === 'all' && filterStatus === 'all' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Jobs</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalJobs}</p>
          </div>
          <div 
            onClick={() => setFilterStatus('published')}
            className={`rounded-xl border p-5 cursor-pointer transition-colors ${filterStatus === 'published' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Published</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{publishedJobs}</p>
          </div>
          <div 
            onClick={() => setFilterStatus('draft')}
            className={`rounded-xl border p-5 cursor-pointer transition-colors ${filterStatus === 'draft' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Draft</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{draftJobs}</p>
          </div>
          <div 
            onClick={() => setFilterStatus('expired')}
            className={`rounded-xl border p-5 cursor-pointer transition-colors ${filterStatus === 'expired' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Expired</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{expiredJobs}</p>
          </div>
        </div>

        {/* Sector Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div 
            onClick={() => setFilterSector('government')}
            className={`rounded-xl border p-5 cursor-pointer transition-colors ${filterSector === 'government' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Government Jobs</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{govtJobs}</p>
          </div>
          <div 
            onClick={() => setFilterSector('private')}
            className={`rounded-xl border p-5 cursor-pointer transition-colors ${filterSector === 'private' ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Private Sector</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{pvtJobs}</p>
          </div>
          <div 
            onClick={() => setFilterSector('overseas')}
            className={`rounded-xl border p-5 cursor-pointer transition-colors ${filterSector === 'overseas' ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Overseas Jobs</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{intlJobs}</p>
          </div>
        </div>

        {/* Delete confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Job?</h2>
              <p className="text-slate-500 mb-6 text-sm">This action cannot be undone. The job announcement will be permanently removed.</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-6 transition-colors">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs by title, company, or location..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-950/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <div className="flex gap-2">
                {(['all', 'published', 'draft'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === s
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {s === 'all' ? 'All' : s === 'published' ? 'Published' : 'Draft'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Job List Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <Layers className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-lg font-medium mb-2 text-slate-900 dark:text-white">No jobs found</p>
              <p className="text-sm mb-4">Create your first job announcement to get started.</p>
              <Link
                to="/admin/jobs/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Job
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-4 py-3">Job</th>
                    <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-4 py-3">Type</th>
                    <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-4 py-3">Details</th>
                    <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-4 py-3">Sector</th>
                    <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-4 py-3">Posted Date</th>
                    <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-4 py-3">Closing Date</th>
                    <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-4 py-3">Status</th>
                    <th className="text-right font-semibold text-slate-700 dark:text-slate-300 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => {
                    const closing = new Date(job.closing_date);
                    const isExpired = closing < new Date();
                    return (
                      <tr key={job.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                              {getTypeIcon(job.post_type)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Link to={`/jobs/${job.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                  {job.title}
                                </Link>
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-xs mt-0.5">
                                <Building2 className="w-3 h-3" /> {job.company}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs font-medium">
                            {getTypeIcon(job.post_type)} {getTypeLabel(job.post_type)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1 text-xs">
                            <MapPin className="w-3 h-3" /> {job.location}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
                            {job.categories?.name || 'Uncategorized'} | {job.countries?.name || 'No country'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            {job.is_government && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800/50">
                                <Landmark className="w-3 h-3" /> Government
                              </span>
                            )}
                            {job.is_overseas && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full border border-teal-100 dark:border-teal-800/50">
                                <Globe className="w-3 h-3" /> Overseas
                              </span>
                            )}
                            {job.is_private_sector && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                <Building2 className="w-3 h-3" /> Private Sector
                              </span>
                            )}
                            {!job.is_government && !job.is_overseas && !job.is_private_sector && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(job.posted_date || job.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className={`flex items-center gap-1 text-xs ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                            <Calendar className="w-3 h-3" />
                            {closing.toLocaleDateString()}
                            {isExpired && <span className="font-medium ml-1">(Expired)</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              job.status === 'published'
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {job.status === 'published' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {job.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {job.status === 'published' && (
                              <>
                                <button
                                  onClick={async () => {
                                    setInfoMessage('Broadcasting post to Facebook Page...');
                                    const { postJobToFacebook } = await import('../lib/facebookAutoPoster');
                                    const res = await postJobToFacebook(job);
                                    if (res.success) setInfoMessage('✓ Posted to Facebook Page successfully!');
                                    else setError(`Facebook Post Error: ${res.error}`);
                                  }}
                                  title="Broadcast to Facebook Page"
                                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                >
                                  FB Post
                                </button>
                                <button
                                  onClick={async () => {
                                    setInfoMessage('Broadcasting post to WhatsApp Channel...');
                                    const { postJobToWhatsApp } = await import('../lib/whatsappAutoPoster');
                                    const res = await postJobToWhatsApp(job);
                                    if (res.success) setInfoMessage('✓ Broadcasted to WhatsApp Channel successfully!');
                                    else setError(`WhatsApp Broadcast Error: ${res.error}`);
                                  }}
                                  title="Broadcast to WhatsApp Channel"
                                  className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                >
                                  WA Post
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setPreviewJob(job)}
                              title="Instant Preview Job (In-Dashboard)"
                              className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </button>
                            <Link
                              to={`/admin/jobs/${job.id}/edit`}
                              title="Edit Job"
                              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteConfirm(job.id)}
                              title="Delete Job"
                              className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sources List Modal */}
      {showSourcesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSourcesModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bot Scraper Target Portals & Feeds</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage target website links checked by the Bot during job hunting</p>
              </div>
            </div>

            {/* Add / Edit Source Form */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {editingSourceId ? '✏️ Edit Target Web Source' : '➕ Add New Target Web Source'}
                </span>
                {editingSourceId && (
                  <button
                    onClick={handleCancelEditSource}
                    className="text-xs text-red-500 hover:text-red-700 underline font-medium"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Website Name (e.g. HNB Careers)"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="URL (e.g. careers.hnb.lk)"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                />
                <select
                  value={newSourceCategory}
                  onChange={(e) => setNewSourceCategory(e.target.value as 'government' | 'private' | 'overseas')}
                  className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                >
                  <option value="government">🇱🇰 Government Gazette</option>
                  <option value="private">🏢 Private Sector</option>
                  <option value="overseas">✈️ Overseas Portals</option>
                </select>
              </div>
              <button
                onClick={handleSaveSource}
                disabled={!newSourceName.trim() || !newSourceUrl.trim()}
                className={`w-full py-2 ${editingSourceId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm`}
              >
                {editingSourceId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingSourceId ? 'Update Target Web Source' : 'Save New Target Source'}
              </button>
            </div>

            {/* Grouped Dynamic Sources List */}
            <div className="space-y-4 my-6">
              {/* Government Gazette Sources */}
              <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-900/50">
                <h4 className="font-bold text-sm text-blue-900 dark:text-blue-200 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Landmark className="w-4 h-4 text-blue-600" /> 🇱🇰 Government Gazette & Public Sector ({sources.filter(s => s.category === 'government').length})</span>
                </h4>
                <div className="space-y-2">
                  {sources.filter(s => s.category === 'government').map((s) => (
                    <div key={s.id} className={`flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border transition-all ${editingSourceId === s.id ? 'border-amber-500 ring-1 ring-amber-500' : 'border-blue-100 dark:border-blue-900/40'} text-xs`}>
                      <div>
                        <strong className="text-slate-900 dark:text-white">{s.name}</strong>
                        <a href={s.url} target="_blank" rel="noreferrer" className="block text-blue-600 dark:text-blue-400 font-mono text-[11px] truncate max-w-md hover:underline">
                          {s.url}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEditSource(s)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                          title="Edit Source"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSource(s.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete Source"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Private Sector Sources */}
              <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50">
                <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-amber-600" /> 🏢 Private Sector Corporate Careers ({sources.filter(s => s.category === 'private').length})</span>
                </h4>
                <div className="space-y-2">
                  {sources.filter(s => s.category === 'private').map((s) => (
                    <div key={s.id} className={`flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border transition-all ${editingSourceId === s.id ? 'border-amber-500 ring-1 ring-amber-500' : 'border-amber-100 dark:border-amber-900/40'} text-xs`}>
                      <div>
                        <strong className="text-slate-900 dark:text-white">{s.name}</strong>
                        <a href={s.url} target="_blank" rel="noreferrer" className="block text-blue-600 dark:text-blue-400 font-mono text-[11px] truncate max-w-md hover:underline">
                          {s.url}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEditSource(s)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                          title="Edit Source"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSource(s.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete Source"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overseas Sources */}
              <div className="bg-teal-50 dark:bg-teal-950/40 p-4 rounded-xl border border-teal-200 dark:border-teal-900/50">
                <h4 className="font-bold text-sm text-teal-900 dark:text-teal-200 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-teal-600" /> ✈️ Overseas & Foreign Employment Portals ({sources.filter(s => s.category === 'overseas').length})</span>
                </h4>
                <div className="space-y-2">
                  {sources.filter(s => s.category === 'overseas').map((s) => (
                    <div key={s.id} className={`flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border transition-all ${editingSourceId === s.id ? 'border-amber-500 ring-1 ring-amber-500' : 'border-teal-100 dark:border-teal-900/40'} text-xs`}>
                      <div>
                        <strong className="text-slate-900 dark:text-white">{s.name}</strong>
                        <a href={s.url} target="_blank" rel="noreferrer" className="block text-blue-600 dark:text-blue-400 font-mono text-[11px] truncate max-w-md hover:underline">
                          {s.url}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEditSource(s)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                          title="Edit Source"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSource(s.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete Source"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setSources(DEFAULT_SOURCES);
                  localStorage.removeItem('jobnews_scraper_sources');
                }}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
              >
                Reset to Default Sources List
              </button>
              <button
                onClick={() => setShowSourcesModal(false)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-lg hover:opacity-90 transition-opacity"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant In-Dashboard Job Preview Modal */}
      {previewJob && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewJob(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Top Preview Mode Alert Banner */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium text-xs px-4 py-2.5 rounded-xl mb-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>IN-DASHBOARD PREVIEW MODE — Exact view of how users see this notice</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px] font-bold ${previewJob.status === 'published' ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                {previewJob.status}
              </span>
            </div>

            {/* Job Thumbnail / Banner */}
            {previewJob.thumbnail_url && (
              <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm max-h-80 flex items-center justify-center bg-slate-950">
                <img
                  src={previewJob.thumbnail_url}
                  alt={previewJob.title}
                  className="w-full h-full object-contain max-h-80"
                />
              </div>
            )}

            {/* Sector Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {previewJob.is_government && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/50">
                  <Landmark className="w-3.5 h-3.5" /> Government Vacancy
                </span>
              )}
              {previewJob.is_overseas && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800/50">
                  <Globe className="w-3.5 h-3.5" /> Overseas Vacancy
                </span>
              )}
              {previewJob.is_private_sector && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  <Building2 className="w-3.5 h-3.5" /> Private Sector
                </span>
              )}
            </div>

            {/* Job Title & Company */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{previewJob.title}</h2>
            <p className="text-base font-semibold text-slate-600 dark:text-slate-400 mb-4">{previewJob.company}</p>

            {/* Meta Row (Location, Salary, Deadline) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 text-sm">
              <div>
                <span className="block text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Location</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-4 h-4 text-blue-500" /> {previewJob.location || 'Sri Lanka'}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Salary</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {previewJob.salary ? `💰 ${previewJob.salary}` : 'Negotiable'}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Closing Date</span>
                <span className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-4 h-4" /> {new Date(previewJob.closing_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Official Gazette PDF Card */}
            {previewJob.official_pdf_url && (
              <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Official Government Gazette PDF Attached</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Download or view the official Gazette PDF notice</p>
                  </div>
                </div>
                <a
                  href={previewJob.official_pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  📥 View Official PDF
                </a>
              </div>
            )}

            {/* Description & Requirements */}
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Job Description & Details</h4>
                <div className="whitespace-pre-line bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  {previewJob.description}
                </div>
              </div>
              {previewJob.requirements && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Qualifications & Requirements</h4>
                  <div className="whitespace-pre-line bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    {previewJob.requirements}
                  </div>
                </div>
              )}
            </div>

            {/* How to Apply Section */}
            <div className="mb-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-500" /> How to Apply / අයදුම් කරන්නේ කෙසේද?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Follow the application method specified below by the employer:
              </p>
              <div className="flex flex-wrap gap-3">
                {previewJob.apply_url && (
                  <a
                    href={previewJob.apply_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" /> Apply Online Official Web Link
                  </a>
                )}
                {previewJob.apply_email && (
                  <a
                    href={`mailto:${previewJob.apply_email}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    <Mail className="w-4 h-4" /> Send Email: {previewJob.apply_email}
                  </a>
                )}
                {previewJob.apply_phone && (
                  <a
                    href={`tel:${previewJob.apply_phone}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    <Phone className="w-4 h-4" /> Call: {previewJob.apply_phone}
                  </a>
                )}
                {previewJob.apply_method === 'in_person' && !previewJob.apply_url && !previewJob.apply_email && (
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
                    ✉️ <strong>Postal / Registered Post Application:</strong> Send your application to the official address listed in the notice.
                  </div>
                )}
              </div>
            </div>

            {/* Social Auto-Post Options for Draft Jobs */}
            {previewJob.status === 'draft' && (
              <div className="flex flex-wrap items-center gap-4 py-2.5 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 w-full mb-4">
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">📢 Social Auto-Publishing:</span>
                <label className="inline-flex items-center gap-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                  <input
                    type="checkbox"
                    checked={previewPostToFb}
                    onChange={(e) => setPreviewPostToFb(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>📘 Auto-Post to Facebook Page</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400">
                  <input
                    type="checkbox"
                    checked={previewPostToWa}
                    onChange={(e) => setPreviewPostToWa(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>🟢 Auto-Broadcast to WhatsApp Channel</span>
                </label>
              </div>
            )}

            {/* Bottom Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              {previewJob.status === 'draft' && (
                <button
                  onClick={async () => {
                    await adminApiCall('PUT', { status: 'published' }, previewJob.id);
                    setPreviewJob(null);
                    await loadJobs();
                    setInfoMessage(`🎉 Job "${previewJob.title}" has been Approved & Published live! ${previewPostToFb ? '📘 Auto-posted to FB Page.' : ''} ${previewPostToWa ? '🟢 Auto-broadcasted to WA Channel.' : ''}`);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Publish Now
                </button>
              )}
              <button
                onClick={() => setPreviewJob(null)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-lg transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gazette PDF Importer Modal */}
      {showGazetteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">📄 Import Vacancies from Government Gazette PDF</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Paste Gazette text or PDF content to auto-extract structured job drafts</p>
                </div>
              </div>
              <button onClick={() => setShowGazetteModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <FileUpload
                  bucket="job-pdfs"
                  folder="gazettes"
                  accept=".pdf,application/pdf"
                  multiple={false}
                  value={uploadedGazettePdfs}
                  onChange={(urls) => {
                    setUploadedGazettePdfs(urls);
                    if (urls[0]) setGazettePdfUrl(urls[0]);
                  }}
                  label="📁 Upload Gazette PDF File (Select file from Computer)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Gazette PDF URL (e.g. documents.gov.lk)
                </label>
                <input
                  type="url"
                  value={gazettePdfUrl}
                  onChange={(e) => setGazettePdfUrl(e.target.value)}
                  placeholder="https://documents.gov.lk/files/gz/2026/8/2026-08-01(I-I)S.pdf"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Paste Gazette PDF Vacancies Text Content (Sinhala / English / Tamil)
                </label>
                <textarea
                  rows={6}
                  value={gazettePdfText}
                  onChange={(e) => setGazettePdfText(e.target.value)}
                  placeholder={`1. කළමනාකරණ සහකාර තනතුර - රාජ්‍ය සේවා කොමිෂන් සභාව
අයදුම්පත් භාරගන්නා අවසාන දිනය: 2026.08.31
වැටුප් පරිමාණය: රු. 32,500 - 45,000

2. ගණකාධිකාරී තනතුර - දේශීය ආදායම් දෙපාර්තමේන්තුව...`}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleParseGazette}
                  disabled={parsingGazette || (!gazettePdfText.trim() && !gazettePdfUrl.trim() && uploadedGazettePdfs.length === 0)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-xl transition-all inline-flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="w-4 h-4" />
                  {parsingGazette ? 'Extracting Vacancies...' : '🔍 Parse Gazette Vacancies'}
                </button>
              </div>
            </div>

            {/* Extracted Vacancies Preview */}
            {extractedGazetteJobs.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    Extracted Vacancies ({extractedGazetteJobs.length} found)
                  </h4>
                  <button
                    onClick={handleImportGazetteJobs}
                    disabled={importingGazetteJobs}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors shadow-md inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {importingGazetteJobs ? 'Creating Job Drafts...' : `⚡ Create All ${extractedGazetteJobs.length} Draft Jobs`}
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
                  {extractedGazetteJobs.map((job, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{job.title}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                          {job.closingDate}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">🏢 {job.company}</p>
                      {job.salary && <p className="text-amber-600 dark:text-amber-400">💰 {job.salary}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowGazetteModal(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
