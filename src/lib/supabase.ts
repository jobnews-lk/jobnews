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

export type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read?: boolean;
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
  apply_method: 'online' | 'email' | 'in_person' | 'phone' | 'post';
  apply_url: string | null;
  apply_email: string | null;
  apply_phone: string | null;
  apply_address?: string | null;
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

export function clearPublicJobCaches() {
  try {
    const keys = [
      'jn_home_jobs',
      'jn_home_closing',
      'jn_home_countries',
      'jn_home_categories',
      'jn_all_jobs',
      'jn_jobs_countries',
      'jn_jobs_categories',
      'jn_gov_jobs',
      'jn_gov_categories',
      'jn_v2_home_jobs',
      'jn_v2_home_closing',
      'jn_v2_home_countries',
      'jn_v2_home_categories',
      'jn_v2_all_jobs',
      'jn_v2_jobs_countries',
      'jn_v2_jobs_categories',
      'jn_v2_gov_jobs',
      'jn_v2_gov_categories',
    ];
    keys.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    // ignore
  }
}

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
    const {
      images,
      pdfs,
      gallery_images,
      gallery_pdfs,
      thumbnail_url,
      official_pdf_url,
      replaceImages,
      replacePdfs,
      postToFacebook,
      post_to_facebook,
      postToWhatsApp,
      post_to_whatsapp,
      ...jobData
    } = body;
    
    const finalImages = (gallery_images || images) as string[] | undefined;
    const finalPdfs = (gallery_pdfs || pdfs) as any[] | undefined;

    const { data: job, error } = await supabase.from('jobs').insert({
      ...jobData,
      thumbnail_url: thumbnail_url || null,
      official_pdf_url: official_pdf_url || null,
    }).select().single();
    
    if (error) throw new Error(error.message);

    if (finalImages && Array.isArray(finalImages) && finalImages.length > 0) {
      const imageRecords = finalImages.map((url: string, idx: number) => ({
        job_id: job.id,
        url,
        sort_order: idx,
      }));
      await supabase.from('job_images').insert(imageRecords);
    }

    if (finalPdfs && Array.isArray(finalPdfs) && finalPdfs.length > 0) {
      const pdfRecords = finalPdfs.map((pdf: any) => ({
        job_id: job.id,
        url: typeof pdf === 'string' ? pdf : pdf.url,
        filename: typeof pdf === 'string' ? (pdf.split('/').pop() || null) : (pdf.filename || null),
        page_count: typeof pdf === 'string' ? null : (pdf.page_count || null),
      }));
      await supabase.from('job_pdfs').insert(pdfRecords);
    }

    clearPublicJobCaches();
    return { data: job };
  }

  if (method === 'PUT' && jobId && body) {
    const {
      images,
      pdfs,
      gallery_images,
      gallery_pdfs,
      thumbnail_url,
      official_pdf_url,
      replaceImages,
      replacePdfs,
      postToFacebook,
      post_to_facebook,
      postToWhatsApp,
      post_to_whatsapp,
      ...jobData
    } = body;
    
    const finalImages = (gallery_images || images) as string[] | undefined;
    const finalPdfs = (gallery_pdfs || pdfs) as any[] | undefined;

    const { data: job, error } = await supabase.from('jobs').update({
      ...jobData,
      thumbnail_url: thumbnail_url || null,
      official_pdf_url: official_pdf_url || null,
    }).eq('id', jobId).select().single();
    
    if (error) throw new Error(error.message);

    if (replaceImages) {
      await supabase.from('job_images').delete().eq('job_id', jobId);
    }
    if (finalImages && Array.isArray(finalImages) && finalImages.length > 0) {
      const imageRecords = finalImages.map((url: string, idx: number) => ({
        job_id: jobId,
        url,
        sort_order: idx,
      }));
      await supabase.from('job_images').insert(imageRecords);
    }

    if (replacePdfs) {
      await supabase.from('job_pdfs').delete().eq('job_id', jobId);
    }
    if (finalPdfs && Array.isArray(finalPdfs) && finalPdfs.length > 0) {
      const pdfRecords = finalPdfs.map((pdf: any) => ({
        job_id: jobId,
        url: typeof pdf === 'string' ? pdf : pdf.url,
        filename: typeof pdf === 'string' ? (pdf.split('/').pop() || null) : (pdf.filename || null),
        page_count: typeof pdf === 'string' ? null : (pdf.page_count || null),
      }));
      await supabase.from('job_pdfs').insert(pdfRecords);
    }

    clearPublicJobCaches();
    return { data: job };
  }

  if (method === 'DELETE' && jobId) {
    await supabase.from('job_images').delete().eq('job_id', jobId);
    await supabase.from('job_pdfs').delete().eq('job_id', jobId);
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (error) throw new Error(error.message);
    clearPublicJobCaches();
    return { success: true };
  }

  throw new Error('Invalid operation');
}

/**
 * Timezone-safe local calendar date helper (YYYY-MM-DD)
 * Prevents UTC offset bugs (where 12am-5:30am falls into previous UTC day).
 */
export function getLocalDateString(dateInput: Date = new Date()): string {
  const year = dateInput.getFullYear();
  const month = String(dateInput.getMonth() + 1).padStart(2, '0');
  const day = String(dateInput.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Determines whether a job was discovered automatically by the Bot vs manually entered by Admin.
 */
export function isBotDiscoveredJob(job?: Partial<Job> | null): boolean {
  if (!job || !job.apply_url) return false;
  
  const desc = (job.description || '').toLowerCase();
  const url = (job.apply_url || '').toLowerCase();
  
  // Explicit bot markers in description or title
  if (
    desc.includes('official job vacancy') ||
    desc.includes('discovered from') ||
    desc.includes('bot ingested') ||
    desc.includes('official career opportunity') ||
    desc.includes('ශ්‍රී ලංකා පාලන සේවයේ') ||
    desc.includes('රාජ්‍ය සේවා කොමිෂන් සභාව සඳහා ict')
  ) {
    return true;
  }

  // Known target bot scraper domains
  const botDomains = [
    'myworkdayjobs.com',
    'documents.gov.lk/gazette',
    'careers.combank.lk',
    'careers.dialog.lk',
    'careers.hilton.com',
    'careers.sampath.lk',
    'careers.keells.com',
    'slbfe.lk'
  ];

  return botDomains.some(d => url.includes(d));
}

/**
 * Formats and cleans long organization / ministry address strings for card displays.
 */
export function formatCleanCompany(company?: string | null): string {
  if (!company) return 'Official Hiring Organization';
  const trimmed = company.trim();
  
  // If company string contains long postal address with commas or street numbers
  if (trimmed.length > 45 || trimmed.includes('අංක') || trimmed.includes('මාවත') || trimmed.includes('පාර') || trimmed.includes('තැ.පෙ.')) {
    const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
    const orgPart = parts.find(p => 
      p.includes('අමාත්‍යාංශය') || 
      p.includes('දෙපාර්තමේන්තුව') || 
      p.includes('සභාව') || 
      p.includes('මණ්ඩලය') || 
      p.includes('හමුදාව') || 
      p.includes('දෙපාර්තමේන්තු') ||
      p.includes('PLC') || 
      p.includes('Ltd') || 
      p.includes('Bank') || 
      p.includes('Hotel') || 
      p.includes('Resort')
    );
    if (orgPart) return orgPart;
    if (parts.length > 1) return parts.slice(0, 2).join(' - ');
    return trimmed.substring(0, 42) + '...';
  }
  
  return trimmed;
}

/**
 * Parses Registered Post instructions vs postal address vs sourceUrl from apply_url text.
 */
export function parseRegisteredPostData(applyUrl?: string | null): { instructions: string; address: string; sourceUrl: string } {
  if (!applyUrl) return { instructions: '', address: '', sourceUrl: '' };
  
  const str = applyUrl.trim();
  let instructions = '';
  let address = '';
  let sourceUrl = '';

  if (str.includes('\n---\n')) {
    const blocks = str.split('\n---\n');
    for (const b of blocks) {
      const trimmed = b.trim();
      if (trimmed.startsWith('POSTAL_ADDRESS:\n')) {
        address = trimmed.replace('POSTAL_ADDRESS:\n', '').trim();
      } else if (trimmed.startsWith('SOURCE_URL:\n')) {
        sourceUrl = trimmed.replace('SOURCE_URL:\n', '').trim();
      } else {
        instructions = trimmed;
      }
    }
    return { instructions, address, sourceUrl };
  }

  if (str.includes('POSTAL_ADDRESS:\n')) {
    const parts = str.split('POSTAL_ADDRESS:\n');
    return { instructions: parts[0].trim(), address: parts[1].trim(), sourceUrl: '' };
  }

  // Legacy web URL check
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return { instructions: '', address: '', sourceUrl: str };
  }

  // If text contains application steps/notes
  if (str.includes('පියවර') || str.includes('සඳහා') || str.includes('අයදුම්පත') || str.includes('විශේෂ')) {
    return { instructions: str, address: '', sourceUrl: '' };
  }

  return { instructions: '', address: str, sourceUrl: '' };
}

/**
 * Formats Registered Post instructions, postal address, and sourceUrl into apply_url string.
 */
export function formatRegisteredPostApplyUrl(instructions: string, address: string, sourceUrl?: string): string | null {
  const cleanInst = instructions.trim();
  const cleanAddr = address.trim();
  const cleanSrc = sourceUrl?.trim() || '';

  const parts: string[] = [];
  if (cleanInst) parts.push(cleanInst);
  if (cleanAddr) parts.push(`POSTAL_ADDRESS:\n${cleanAddr}`);
  if (cleanSrc) parts.push(`SOURCE_URL:\n${cleanSrc}`);

  return parts.length > 0 ? parts.join('\n---\n') : null;
}
