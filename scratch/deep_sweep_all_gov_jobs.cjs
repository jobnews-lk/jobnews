const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepSweep() {
  console.log('=== STARTING BATCHED SWEEP FOR ALL JOBS ===');
  
  let page = 0;
  const pageSize = 30;
  let allJobs = [];

  while (true) {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, title, status, is_government, official_pdf_url, apply_url, job_pdfs(id, url, filename)')
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error batch:', error);
      break;
    }

    if (!jobs || jobs.length === 0) break;
    allJobs = allJobs.concat(jobs);
    if (jobs.length < pageSize) break;
    page++;
  }

  console.log(`Successfully fetched total ${allJobs.length} jobs.`);

  const problemJobs = [];

  for (const j of allJobs) {
    const hasOfficialPdf = !!j.official_pdf_url;
    const isOfficialPdfWebUrl = hasOfficialPdf && !j.official_pdf_url.includes('supabase.co/storage/') && !j.official_pdf_url.toLowerCase().endsWith('.pdf');
    const pdfCount = j.job_pdfs ? j.job_pdfs.length : 0;

    // We report any job where:
    // 1. official_pdf_url is a web URL instead of a PDF file URL
    // 2. OR both official_pdf_url AND job_pdfs exist
    // 3. OR multiple job_pdfs exist
    if (isOfficialPdfWebUrl || (hasOfficialPdf && pdfCount > 0) || pdfCount > 1) {
      problemJobs.push({
        id: j.id,
        title: j.title,
        status: j.status,
        is_government: j.is_government,
        official_pdf_url: j.official_pdf_url,
        isOfficialPdfWebUrl,
        job_pdfs: j.job_pdfs
      });
    }
  }

  console.log(`Found ${problemJobs.length} jobs requiring structure check/cleanup:`);
  console.log(JSON.stringify(problemJobs, null, 2));
}

deepSweep();
