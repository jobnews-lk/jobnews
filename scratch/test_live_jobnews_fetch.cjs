const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMobileQueries() {
  console.log('=== TESTING EXACT SUPABASE QUERIES FOR HOME PAGE & TOP TICKER ===');

  // 1. Home Page Latest Jobs Query
  try {
    const { data: latestJobs, error: err1 } = await supabase
      .from('jobs')
      .select('id, title, company, post_type, is_government, is_overseas, closing_date, created_at, location, salary, thumbnail_url, job_images(id, url)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(24);

    if (err1) console.error('Query 1 error:', err1);
    else console.log(`Query 1 (latestJobs) returned ${latestJobs?.length} rows!`);
  } catch (e) {
    console.error('Query 1 exception:', e);
  }

  // 2. TopTicker Query
  try {
    const { data: tickerJobs, error: err2 } = await supabase
      .from('jobs')
      .select('id, title, company, closing_date, status')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10);

    if (err2) console.error('Query 2 error:', err2);
    else console.log(`Query 2 (tickerJobs) returned ${tickerJobs?.length} rows!`);
  } catch (e) {
    console.error('Query 2 exception:', e);
  }
}

testMobileQueries();
