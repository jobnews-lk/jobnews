const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*, job_pdfs(*), job_images(*)')
    .eq('id', '9a0f0e3f-64cf-4ce7-8e25-e7fefe16dd5c')
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    return;
  }

  console.log('=== JOB 9a0f0e3f-64cf-4ce7-8e25-e7fefe16dd5c DETAILS ===');
  console.log('Title:', job.title);
  console.log('Official PDF URL:', job.official_pdf_url);
  console.log('Apply URL:', job.apply_url);
  console.log('Job PDFs:', job.job_pdfs);
}

check();
