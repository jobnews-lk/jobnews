const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, official_pdf_url, apply_url, apply_method, created_at, job_pdfs(*)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching jobs:', error);
    return;
  }

  console.log('--- RECENT JOBS PDF STATUS ---');
  jobs.forEach(j => {
    console.log(`ID: ${j.id}`);
    console.log(`Title: ${j.title}`);
    console.log(`Created: ${j.created_at}`);
    console.log(`Official PDF URL: ${j.official_pdf_url}`);
    console.log(`Job PDFs count: ${j.job_pdfs ? j.job_pdfs.length : 0}`);
    if (j.job_pdfs && j.job_pdfs.length > 0) {
      console.log(`Job PDFs:`, j.job_pdfs);
    }
    console.log('-----------------------------------');
  });
}

check();
