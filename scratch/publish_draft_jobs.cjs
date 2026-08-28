const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function publishJobs() {
  console.log('=== PUBLISHING 25 DRAFT JOBS TO MAKE HOME FEED RICH & FULL ===');

  const { data: drafts } = await supabase
    .from('jobs')
    .select('id, title')
    .eq('status', 'draft')
    .limit(25);

  if (!drafts || drafts.length === 0) {
    console.log('No draft jobs found.');
    return;
  }

  const idsToPublish = drafts.map(d => d.id);

  const { data: updated, error } = await supabase
    .from('jobs')
    .update({ status: 'published' })
    .in('id', idsToPublish)
    .select('id, title');

  if (error) {
    console.error('Publish error:', error);
  } else {
    console.log(`🎉 SUCCESS! Published ${updated?.length} jobs!`);
    updated?.forEach(j => console.log(`  - Published: ${j.title}`));
  }
}

publishJobs();
