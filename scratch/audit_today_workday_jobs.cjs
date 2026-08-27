const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function auditTodayWorkdayJobs() {
  console.log('=== AUDITING TODAY\'S WORKDAY JOBS (POSTED TODAY) ===');

  const workdayApiUrl = 'https://minor.wd102.myworkdayjobs.com/wday/cxs/minor/Careers/jobs';

  try {
    const res = await fetch(workdayApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        appliedFacets: {},
        limit: 50,
        offset: 0,
        searchText: ""
      })
    });

    if (!res.ok) {
      console.error('Workday API failed:', res.statusText);
      return;
    }

    const data = await res.json();
    console.log(`\n🎉 Found ${data.total} Total Workday Vacancies!`);

    const rawJobs = data.jobPostings || [];
    const todayJobs = rawJobs.filter(j => j.postedOn && (j.postedOn.includes('Today') || j.postedOn.includes('1 Day') || j.postedOn.includes('2 Day')));

    console.log(`\n📌 Found ${todayJobs.length} Jobs Posted Today/Recently in Workday response:`);

    for (let i = 0; i < Math.min(todayJobs.length, 10); i++) {
      const j = todayJobs[i];
      console.log(`\n[${i + 1}] Title: ${j.title}`);
      console.log(`    Location: ${j.locationsText || 'N/A'}`);
      console.log(`    Posted: ${j.postedOn}`);

      // Check if this job exists in Supabase DB
      const { data: dbMatches } = await supabase
        .from('jobs')
        .select('id, title, status')
        .eq('title', j.title)
        .limit(1);

      if (dbMatches && dbMatches.length > 0) {
        console.log(`    ✅ ALREADY IN DATABASE (ID: ${dbMatches[0].id} | Status: ${dbMatches[0].status})`);
      } else {
        console.log(`    🆕 NEW JOB NOT YET IN DATABASE - Ready to be ingested!`);
      }
    }
  } catch (e) {
    console.error('Audit error:', e);
  }
}

auditTodayWorkdayJobs();
