const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPublishedClosingDates() {
  console.log('=== UPDATING PUBLISHED JOBS CLOSING DATES TO FUTURE (2026-09-30) ===');

  const futureDate = '2026-09-30';

  const { data: updated, error } = await supabase
    .from('jobs')
    .update({ closing_date: futureDate })
    .eq('status', 'published')
    .select('id, title, status, closing_date');

  if (error) {
    console.error('Update error:', error);
  } else {
    console.log(`✅ Successfully updated ${updated.length} Published Jobs with closing_date = ${futureDate}!`);
    updated.forEach(j => console.log(`  - [${j.id}] ${j.title} -> Closing: ${j.closing_date}`));
  }
}

fixPublishedClosingDates();
