import { useEffect, useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, AlertTriangle, LogOut, MapPin, Building2,
  Calendar, FileText, ImageIcon, Type, Globe, Briefcase, Landmark,
  Loader2, LayoutDashboard, Layers, CheckCircle2, Clock, AlertCircle, X,
  Search, SlidersHorizontal
} from 'lucide-react';
import { supabase, adminApiCall, type Job } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type FilterStatus = 'all' | 'published' | 'draft' | 'expired';
type FilterSector = 'all' | 'government' | 'private' | 'overseas';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterSector, setFilterSector] = useState<FilterSector>('all');

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
      .select('*, countries(*), categories(*), job_images(*), job_pdfs(*)')
      .order('created_at', { ascending: false });
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
          <div className="flex items-center gap-3">
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
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/jobs/${job.id}/edit`}
                              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteConfirm(job.id)}
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
    </div>
  );
}
