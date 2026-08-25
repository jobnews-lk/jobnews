const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const { data, error } = await supabase
    .from('jobs')
    .update({ official_pdf_url: null })
    .eq('id', '9a0f0e3f-64cf-4ce7-8e25-e7fefe16dd5c');

  if (error) console.error(error);
  else console.log('Successfully set official_pdf_url to null for Psychologist job 9a0f0e3f-64cf-4ce7-8e25-e7fefe16dd5c');
}

fix();
