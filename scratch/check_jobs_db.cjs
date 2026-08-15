const https = require('https');

const supabaseUrl = "https://njrkhpsbbpszvyzosxwf.supabase.co";

const queryStr = "select=id,title,company,post_type,is_government,is_overseas,closing_date,created_at,location,salary,thumbnail_url,countries(id,name,slug),categories(id,name,slug),job_images(id,url),job_pdfs(id,url)&is_overseas=eq.true&status=eq.published&order=created_at.desc";

const url = `${supabaseUrl}/rest/v1/jobs?${queryStr}`;

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
    console.log("HTTP STATUS:", res.statusCode);
    try {
      const data = JSON.parse(body);
      if (Array.isArray(data)) {
        console.log(`SUCCESS! RETURNED ${data.length} OVERSEAS JOBS!`);
        data.forEach((j, i) => {
          console.log(`${i+1}. [${j.id}] ${j.title}`);
        });
      } else {
        console.log("RESPONSE ERROR:", data);
      }
    } catch (e) {
      console.error('Parse error:', e, body);
    }
  });
}).on('error', (e) => {
  console.error('HTTP request error:', e);
});
