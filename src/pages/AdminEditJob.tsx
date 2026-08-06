import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminJobForm from '../components/AdminJobForm';
import ErrorBoundary from '../components/ErrorBoundary';
import { adminApiCall, supabase } from '../lib/supabase';
import type { Country, Category, Job } from '../lib/supabase';

export default function AdminEditJob() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const [{ data: c }, { data: cat }, { data: j }] = await Promise.all([
        supabase.from('countries').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('jobs').select('*, countries(*), categories(*), job_images(*), job_pdfs(*)').eq('id', id).maybeSingle(),
      ]);
      if (c) setCountries(c);
      if (cat) setCategories(cat);
      if (j) setJob(j as Job);
      else setError('Job not found');
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!id) return;
    setError('');
    setSubmitting(true);
    const { postToFacebook, postToWhatsApp, ...jobData } = data;
    try {
      const result = await adminApiCall('PUT', jobData, id);
      const updatedJob = (result?.data || { ...jobData, id }) as Job;

      if (updatedJob && updatedJob.status === 'published') {
        if (postToFacebook) {
          const { postJobToFacebook } = await import('../lib/facebookAutoPoster');
          postJobToFacebook(updatedJob).catch((e) => console.error('FB AutoPost Error:', e));
        }
        if (postToWhatsApp) {
          const { postJobToWhatsApp } = await import('../lib/whatsappAutoPoster');
          postJobToWhatsApp(updatedJob).catch((e) => console.error('WA AutoPost Error:', e));
        }
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 bg-slate-200 rounded" />
            <div className="h-96 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Job</h1>
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
          <ErrorBoundary>
            <AdminJobForm
              job={job}
              countries={countries}
              categories={categories}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admin/dashboard')}
              submitting={submitting}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
