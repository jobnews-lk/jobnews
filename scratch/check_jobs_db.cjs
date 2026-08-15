const https = require('https');

const supabaseUrl = "https://njrkhpsbbpszvyzosxwf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcmtocHNiYnBzenZ5em9zeHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNjQ2ODMsImV4cCI6MjA1Njg0MDY4M30.z8aI4PjWlA0jB2TjWlA0jB2TjWlA0jB2TjWlA0jB2T";

const url = `${supabaseUrl}/rest/v1/jobs?select=id,title,status,closing_date,created_at&order=created_at.desc`;

const options = {
  headers: {
    'apikey': 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc',
    'Authorization': 'Bearer sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc'
  }
};

https.get(url, options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const allJobs = JSON.parse(body);
      const today = new Date().toISOString().split('T')[0];
      console.log('=== TODAY DATE:', today, '===');
      console.log(`TOTAL JOBS IN DB: ${allJobs.length}`);

      const published = allJobs.filter(j => j.status === 'published');
      console.log(`TOTAL PUBLISHED JOBS: ${published.length}`);

      const activePublished = published.filter(j => !j.closing_date || j.closing_date >= today);
      const expiredPublished = published.filter(j => j.closing_date && j.closing_date < today);

      console.log(`ACTIVE (NOT EXPIRED) PUBLISHED JOBS: ${activePublished.length}`);
      console.log(`EXPIRED PUBLISHED JOBS: ${expiredPublished.length}`);

      console.log('\n--- ACTIVE PUBLISHED JOBS ---');
      activePublished.forEach((j, i) => {
        console.log(`${i + 1}. [${j.id}] ${j.title} | Closing: ${j.closing_date || 'No Closing Date'}`);
      });

      console.log('\n--- EXPIRED PUBLISHED JOBS ---');
      expiredPublished.forEach((j, i) => {
        console.log(`${i + 1}. [${j.id}] ${j.title} | Closing: ${j.closing_date}`);
      });

    } catch (e) {
      console.error('Parse error:', e, body);
    }
  });
}).on('error', (e) => {
  console.error('HTTP request error:', e);
});
