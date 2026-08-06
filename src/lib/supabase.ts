import { createClient } from '@supabase/supabase-js';

export type Country = {
  id: string;
  name: string;
  slug: string;
  code: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type JobImage = {
  id: string;
  job_id: string;
  url: string;
  sort_order: number;
};

export type JobPdf = {
  id: string;
  job_id: string;
  url: string;
  filename: string | null;
  page_count: number | null;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  salary: string | null;
  location: string;
  description: string;
  requirements: string | null;
  closing_date: string;
  posted_date: string;
  post_type: 'text' | 'image' | 'pdf';
  apply_method: 'online' | 'email' | 'in_person' | 'phone';
  apply_url: string | null;
  apply_email: string | null;
  apply_phone: string | null;
  is_government: boolean;
  is_overseas: boolean;
  is_private_sector: boolean;
  category_id: string | null;
  country_id: string | null;
  status: 'draft' | 'published';
  thumbnail_url: string | null;
  official_pdf_url: string | null;
  created_at: string;
  updated_at: string;
  countries?: Country | null;
  categories?: Category | null;
  job_images?: JobImage[];
  job_pdfs?: JobPdf[];
};

export type Profile = {
  id: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

export async function adminApiCall(method: string, body?: Record<string, unknown>, jobId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: admin role required');
  }

  if (method === 'POST' && body) {
    const { images, pdfs, thumbnail_url, official_pdf_url, replaceImages, replacePdfs, postToFacebook, postToWhatsApp, ...jobData } = body;
    
    const { data: job, error } = await supabase.from('jobs').insert({
      ...jobData,
      thumbnail_url: thumbnail_url || null,
      official_pdf_url: official_pdf_url || null,
    }).select().single();
    
    if (error) throw new Error(error.message);

    if (images && Array.isArray(images) && images.length > 0) {
      const imageRecords = images.map((url: string, idx: number) => ({
        job_id: job.id,
        url,
        sort_order: idx,
      }));
      await supabase.from('job_images').insert(imageRecords);
    }

    if (pdfs && Array.isArray(pdfs) && pdfs.length > 0) {
      const pdfRecords = pdfs.map((pdf: any) => ({
        job_id: job.id,
        url: pdf.url,
        filename: pdf.filename,
        page_count: pdf.page_count || null,
      }));
      await supabase.from('job_pdfs').insert(pdfRecords);
    }

    return { data: job };
  }

  if (method === 'PUT' && jobId && body) {
    const { images, pdfs, thumbnail_url, official_pdf_url, replaceImages, replacePdfs, postToFacebook, postToWhatsApp, ...jobData } = body;
    
    const { data: job, error } = await supabase.from('jobs').update({
      ...jobData,
      thumbnail_url: thumbnail_url || null,
      official_pdf_url: official_pdf_url || null,
    }).eq('id', jobId).select().single();
    
    if (error) throw new Error(error.message);

    if (replaceImages && images && Array.isArray(images)) {
      await supabase.from('job_images').delete().eq('job_id', jobId);
      if (images.length > 0) {
        const imageRecords = images.map((url: string, idx: number) => ({
          job_id: jobId,
          url,
          sort_order: idx,
        }));
        await supabase.from('job_images').insert(imageRecords);
      }
    }

    if (replacePdfs && pdfs && Array.isArray(pdfs)) {
      await supabase.from('job_pdfs').delete().eq('job_id', jobId);
      if (pdfs.length > 0) {
        const pdfRecords = pdfs.map((pdf: any) => ({
          job_id: jobId,
          url: pdf.url,
          filename: pdf.filename,
          page_count: pdf.page_count || null,
        }));
        await supabase.from('job_pdfs').insert(pdfRecords);
      }
    }

    return { data: job };
  }

  if (method === 'DELETE' && jobId) {
    await supabase.from('job_images').delete().eq('job_id', jobId);
    await supabase.from('job_pdfs').delete().eq('job_id', jobId);
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  throw new Error('Invalid operation');
}
