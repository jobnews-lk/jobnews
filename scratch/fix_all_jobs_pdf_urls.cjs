const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAllJobs() {
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, official_pdf_url, apply_url, job_pdfs(*)');

  if (error) {
    console.error('Error fetching jobs:', error);
    return;
  }

  console.log(`Scanning all ${jobs.length} jobs in database...`);

  let fixedCount = 0;

  for (const j of jobs) {
    // Check if official_pdf_url is an external web URL (starts with http, not pointing to a .pdf file or supabase storage)
    const isWebUrl = j.official_pdf_url && 
      (j.official_pdf_url.startsWith('http://') || j.official_pdf_url.startsWith('https://')) && 
      !j.official_pdf_url.includes('supabase.co/storage/') && 
      !j.official_pdf_url.toLowerCase().endsWith('.pdf');

    if (isWebUrl) {
      console.log(`[FIXING] Job ID: ${j.id} | Title: "${j.title}"`);
      console.log(`  Current official_pdf_url: ${j.official_pdf_url}`);

      // Check if job has an actual notice PDF attached in job_pdfs
      const pdfNotice = j.job_pdfs && j.job_pdfs.find(p => p.url && (p.url.includes('/notices/') || p.url.endsWith('.pdf')));

      if (pdfNotice) {
        console.log(`  Restoring official_pdf_url to uploaded PDF: ${pdfNotice.url}`);
        await supabase.from('jobs').update({ official_pdf_url: pdfNotice.url }).eq('id', j.id);
      } else {
        console.log(`  Setting web URL official_pdf_url to NULL so it renders cleanly`);
        await supabase.from('jobs').update({ official_pdf_url: null }).eq('id', j.id);
      }
      fixedCount++;
    }
  }

  console.log(`=== COMPLETE: Cleaned and fixed ${fixedCount} job records in database! ===`);
}

fixAllJobs();
