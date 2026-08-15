const https = require('https');

const supabaseUrl = "https://njrkhpsbbpszvyzosxwf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcmtocHNiYnBzenZ5em9zeHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNjQ2ODMsImV4cCI6MjA1Njg4MDY4M30.z8aI4PjWlA0jB2TjWlA0jB2TjWlA0jB2TjWlA0jB2T";

const url = `${supabaseUrl}/rest/v1/jobs?select=id,title,status,is_government,is_overseas,closing_date,created_at&status=eq.published&order=created_at.desc`;

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
      const jobs = JSON.parse(body);
      console.log(`TOTAL PUBLISHED JOBS IN DB: ${jobs.length}`);

      jobs.forEach((j, i) => {
        console.log(`${i + 1}. [${j.id}] ${j.title}`);
        console.log(`   is_government: ${j.is_government} | is_overseas: ${j.is_overseas} | closing_date: ${j.closing_date}`);
      });

    } catch (e) {
      console.error('Parse error:', e, body);
    }
  });
}).on('error', (e) => {
  console.error('HTTP request error:', e);
});
