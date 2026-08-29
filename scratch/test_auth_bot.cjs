const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthBotScraper() {
  console.log('=== TESTING ADMIN AUTHENTICATED BOT SCRAPER ===');
  
  // Sign in as admin
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'mindminemi@gmail.com',
    password: 'admin' // or check current session
  });

  if (authErr) {
    console.log('Auth login info:', authErr.message);
  } else {
    console.log('Logged in as Admin:', authData.user.email);
  }

  // Count jobs
  const { data: jobs } = await supabase.from('jobs').select('id, title, status').limit(5);
  console.log('Sample jobs in DB:', jobs?.map(j => `[${j.status}] ${j.title}`));
}

testAuthBotScraper();
