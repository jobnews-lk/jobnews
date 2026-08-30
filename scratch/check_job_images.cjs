const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJob() {
  const jobId = '27b289a4-3fbd-40b9-94ba-e0ee77e45f42';
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, post_type, thumbnail_url, official_pdf_url, job_images(*)')
    .eq('id', jobId)
    .single();

  console.log('=== JOB RECORD CHECK ===');
  console.log(JSON.stringify(data, null, 2));
}

checkJob();
