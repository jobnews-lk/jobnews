const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAllJobs() {
  console.log('=== EXECUTING THOROUGH DATABASE REPAIR ===');

  // 1. Psychologist Grade II: Set official_pdf_url to the new uploaded PDF notice
  const { data: d1, error: e1 } = await supabase
    .from('jobs')
    .update({ official_pdf_url: 'https://njrkhpsbbpszvyzosxwf.supabase.co/storage/v1/object/public/job-pdfs/notices/1787687944921-Jbnewslk-job-about.pdf' })
    .eq('id', '9a0f0e3f-64cf-4ce7-8e25-e7fefe16dd5c')
    .select();

  console.log('Update Psychologist result:', d1, e1);

  // Delete duplicate "Official Notice PDF" entry from job_pdfs for Psychologist so only application form remains in job_pdfs
  const { error: ed1 } = await supabase
    .from('job_pdfs')
    .delete()
    .eq('job_id', '9a0f0e3f-64cf-4ce7-8e25-e7fefe16dd5c')
    .eq('url', 'https://njrkhpsbbpszvyzosxwf.supabase.co/storage/v1/object/public/job-pdfs/notices/1787687944921-Jbnewslk-job-about.pdf');

  console.log('Delete duplicate notice Psychologist error:', ed1);

  // 2. Navy Sailors: Set official_pdf_url to the new uploaded PDF notice
  const { data: d2, error: e2 } = await supabase
    .from('jobs')
    .update({ official_pdf_url: 'https://njrkhpsbbpszvyzosxwf.supabase.co/storage/v1/object/public/job-pdfs/notices/1787685462468-jobnews-lk.pdf' })
    .eq('id', '0bc851bb-5d5c-4036-8aff-d887c3c83fa7')
    .select();

  console.log('Update Navy result:', d2, e2);

  const { error: ed2 } = await supabase
    .from('job_pdfs')
    .delete()
    .eq('job_id', '0bc851bb-5d5c-4036-8aff-d887c3c83fa7')
    .eq('url', 'https://njrkhpsbbpszvyzosxwf.supabase.co/storage/v1/object/public/job-pdfs/notices/1787685462468-jobnews-lk.pdf');

  console.log('Delete duplicate notice Navy error:', ed2);

  // 3. Stenographer / ලඝු ලේඛක: Delete old attachment
  const { error: ed3 } = await supabase
    .from('job_pdfs')
    .delete()
    .eq('job_id', 'f27530ce-b99f-4408-85fe-e1297b20c7f8')
    .eq('url', 'https://njrkhpsbbpszvyzosxwf.supabase.co/storage/v1/object/public/job-pdfs/attachments/1787682013778-jobnewslk.pdf');

  console.log('Delete old attachment Stenographer error:', ed3);

  // 4. Front Office Manager: Clear workday link from official_pdf_url
  const { data: d4, error: e4 } = await supabase
    .from('jobs')
    .update({ official_pdf_url: null })
    .eq('id', '9977d7fd-1b5a-44dc-acb4-0d7accf0abe7')
    .select();

  console.log('Update Front Office Manager result:', d4, e4);
}

cleanAllJobs();
