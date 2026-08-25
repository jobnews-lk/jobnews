const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixJobs() {
  // Fetch all jobs with job_pdfs
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, official_pdf_url, job_pdfs(*)');

  if (error) {
    console.error('Error fetching jobs:', error);
    return;
  }

  console.log(`Checking ${jobs.length} jobs for PDF URL repair...`);

  for (const j of jobs) {
    const isWebUrl = j.official_pdf_url && j.official_pdf_url.includes('documents.gov.lk');
    const hasPdfAttachment = j.job_pdfs && j.job_pdfs.length > 0;

    if (isWebUrl) {
      if (hasPdfAttachment) {
        // Update official_pdf_url to point to the attached PDF file!
        const realPdfUrl = j.job_pdfs[0].url;
        console.log(`Fixing Job "${j.title}" (${j.id}): restoring official_pdf_url to ${realPdfUrl}`);
        const { error: upErr } = await supabase
          .from('jobs')
          .update({ official_pdf_url: realPdfUrl })
          .eq('id', j.id);
        if (upErr) console.error(`Error updating job ${j.id}:`, upErr);
      } else {
        // Set official_pdf_url to null so it doesn't render a broken PDF viewer card
        console.log(`Fixing Job "${j.title}" (${j.id}): resetting web URL official_pdf_url to null`);
        const { error: upErr } = await supabase
          .from('jobs')
          .update({ official_pdf_url: null })
          .eq('id', j.id);
        if (upErr) console.error(`Error updating job ${j.id}:`, upErr);
      }
    }
  }

  console.log('--- REPAIR COMPLETED SUCCESSFULLY ---');
}

fixJobs();
