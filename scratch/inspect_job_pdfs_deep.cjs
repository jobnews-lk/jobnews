const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*, job_pdfs(*)')
    .eq('id', 'f27530ce-b99f-4408-85fe-e1297b20c7f8')
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    return;
  }

  console.log('=== DEEP INSPECTION FOR JOB f27530ce-b99f-4408-85fe-e1297b20c7f8 ===');
  console.log('Title:', job.title);
  console.log('Official PDF URL:', job.official_pdf_url);
  console.log('Job PDFs (Attachments):', JSON.stringify(job.job_pdfs, null, 2));
}

check();
