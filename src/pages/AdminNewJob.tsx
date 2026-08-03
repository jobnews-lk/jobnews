import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminJobForm from '../components/AdminJobForm';
import ErrorBoundary from '../components/ErrorBoundary';
import { adminApiCall, supabase } from '../lib/supabase';
import type { Country, Category, Job } from '../lib/supabase';
import { postJobToFacebook } from '../lib/facebookAutoPoster';
import { postJobToWhatsApp } from '../lib/whatsappAutoPoster';

export default function AdminNewJob() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from('countries').select('*').order('name');
      if (c) setCountries(c);
      const { data: cat } = await supabase.from('categories').select('*').order('name');
      if (cat) setCategories(cat);
    }
    load();
  }, []);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setError('');
    setSubmitting(true);
    const { postToFacebook, postToWhatsApp, ...jobData } = data;

    try {
      const result = await adminApiCall('POST', jobData);
      const createdJob = result?.data as Job;

      if (createdJob && createdJob.status === 'published') {
        if (postToFacebook) {
          postJobToFacebook(createdJob).catch((e) => console.error('FB AutoPost Error:', e));
        }
        if (postToWhatsApp) {
          postJobToWhatsApp(createdJob).catch((e) => console.error('WA AutoPost Error:', e));
        }
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
      setSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Create New Job</h1>
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
          <ErrorBoundary>
            <AdminJobForm
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
