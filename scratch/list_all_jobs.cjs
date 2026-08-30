const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, post_type, thumbnail_url, official_pdf_url, job_images(id, url)')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('=== LATEST 10 JOBS ===');
  console.log(JSON.stringify(data, null, 2));
}

listJobs();
