const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJobs() {
  console.log('=== CHECKING DATABASE JOBS STATUS ===');

  const { data: allJobs, error: err1 } = await supabase
    .from('jobs')
    .select('id, title, company, status, created_at');

  if (err1) {
    console.error('Error fetching jobs:', err1);
    return;
  }

  console.log(`Total Jobs in DB: ${allJobs.length}`);

  const published = allJobs.filter(j => j.status === 'published');
  const drafts = allJobs.filter(j => j.status === 'draft' || !j.status);

  console.log(`Published Jobs: ${published.length}`);
  console.log(`Draft Jobs: ${drafts.length}`);

  console.log('\n--- Sample Published Jobs ---');
  published.slice(0, 5).forEach(j => console.log(` - [${j.id}] ${j.title} (${j.company})`));

  console.log('\n--- Sample Draft Jobs ---');
  drafts.slice(0, 5).forEach(j => console.log(` - [${j.id}] ${j.title} (${j.company})`));
}

checkJobs();
