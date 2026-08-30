const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectJob() {
  const jobId = '9199c879-4c8e-4249-a0e6-d32cab8fa807';
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, official_pdf_url, apply_url, is_government')
    .eq('id', jobId)
    .single();

  console.log('=== JOB LINK INSPECTION ===');
  console.log(JSON.stringify(data, null, 2));
}

inspectJob();
