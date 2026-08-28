const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testJobsQuery() {
  console.log('=== TESTING SUPABASE JOBS QUERY WITH & WITHOUT JOB_IMAGES JOIN ===');

  // Test 1: With job_images
  const { data: data1, error: err1 } = await supabase
    .from('jobs')
    .select('id, title, company, thumbnail_url, job_images(id, url)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(24);

  if (err1) console.error('❌ Test 1 (with job_images) Error:', err1);
  else console.log(`✅ Test 1 (with job_images) Success! Rows returned: ${data1?.length}`);

  // Test 2: Direct query without job_images join
  const { data: data2, error: err2 } = await supabase
    .from('jobs')
    .select('id, title, company, post_type, is_government, is_overseas, closing_date, created_at, location, salary, thumbnail_url')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(24);

  if (err2) console.error('❌ Test 2 (direct without join) Error:', err2);
  else console.log(`✅ Test 2 (direct without join) Success! Rows returned: ${data2?.length}`);
}

testJobsQuery();
