const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDraftPostedDates() {
  console.log('=== UPDATING DRAFT POSTED DATES TO TODAY (2026-08-29) ===');

  // Find all jobs posted with 2026-08-28
  const { data: jobs, error } = await supabase
    .from('jobs')
    .update({ posted_date: '2026-08-29' })
    .eq('posted_date', '2026-08-28')
    .select('id, title, posted_date');

  if (error) {
    console.error('Error updating posted dates:', error);
  } else {
    console.log(`Successfully updated ${jobs?.length || 0} jobs to today's date (2026-08-29)!`);
  }
}

fixDraftPostedDates();
