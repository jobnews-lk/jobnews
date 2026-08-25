const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanOldAttachment() {
  // Delete old attachment 1787682013778-jobnewslk.pdf for job f27530ce-b99f-4408-85fe-e1297b20c7f8
  const { data, error } = await supabase
    .from('job_pdfs')
    .delete()
    .eq('job_id', 'f27530ce-b99f-4408-85fe-e1297b20c7f8')
    .eq('url', 'https://njrkhpsbbpszvyzosxwf.supabase.co/storage/v1/object/public/job-pdfs/attachments/1787682013778-jobnewslk.pdf');

  if (error) {
    console.error('Error deleting old attachment:', error);
  } else {
    console.log('Successfully deleted old PDF attachment 1787682013778-jobnewslk.pdf from database!');
  }
}

cleanOldAttachment();
