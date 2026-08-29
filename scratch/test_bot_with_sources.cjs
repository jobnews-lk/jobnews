const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSourcesBotEngine() {
  console.log('=== TESTING AUTO JOB HUNTER WITH SOURCES LIST ===');

  const sources = [
    { id: '1', name: 'Official Govt Gazette Portal', url: 'https://documents.gov.lk/gazette', category: 'government' },
    { id: '4', name: 'Commercial Bank Careers', url: 'https://careers.combank.lk', category: 'private' },
    { id: '5', name: 'Dialog Axiata Careers', url: 'https://careers.dialog.lk', category: 'private' },
    { id: '9', name: 'Hilton Worldwide Careers', url: 'https://careers.hilton.com', category: 'overseas' }
  ];

  console.log(`Checking ${sources.length} sources links...`);

  // Count existing draft jobs
  const { data: drafts } = await supabase.from('jobs').select('id, title').eq('status', 'draft');
  console.log(`Current Draft Jobs in DB: ${drafts?.length}`);
}

checkSourcesBotEngine();
