const { createClient } = require('@supabase/supabase-js');
const { generateWhiteYellowJobBannerSvg } = require('./job_banner_generator.cjs');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function ingestAllMinorHotelsJobs() {
  console.log('=== STARTING DIRECT INGESTION OF MINOR HOTELS / WORKDAY VACANCIES ===');

  const workdayApiUrl = 'https://minor.wd102.myworkdayjobs.com/wday/cxs/minor/Careers/jobs';

  // 1. Fetch country map from Supabase
  const { data: countries } = await supabase.from('countries').select('id, name');
  const countryMap = {};
  if (countries) {
    countries.forEach(c => { countryMap[c.name.toLowerCase()] = c.id; });
  }

  let totalIngested = 0;

  // Loop through first 4 pages (80 jobs) from Workday API
  for (const offset of [0, 20, 40, 60]) {
    console.log(`\nFetching Workday API Page at offset: ${offset}...`);

    try {
      const res = await fetch(workdayApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          appliedFacets: {
            // Minor Hotels Business Unit facet filter
            Business_Unit: ["aad9f66d5e7f1018d61630cb61990000"]
          },
          limit: 20,
          offset: offset,
          searchText: ""
        })
      });

      console.log(`HTTP Response: ${res.status} ${res.statusText}`);

      if (!res.ok) {
        // Try fallback without Business_Unit facet filter
        console.warn('Facet filter failed, trying global search fallback...');
        const resFallback = await fetch(workdayApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          body: JSON.stringify({
            appliedFacets: {},
            limit: 20,
            offset: offset,
            searchText: ""
          })
        });
        if (!resFallback.ok) continue;
        var data = await resFallback.json();
      } else {
        var data = await res.json();
      }

      const jobPostings = data.jobPostings || [];
      console.log(`Fetched ${jobPostings.length} vacancies from Workday (Total available: ${data.total}).`);

      for (const j of jobPostings) {
        const title = j.title;
        const locationStr = j.locationsText || 'Overseas';
        const company = 'Minor Hotels (Anantara / Avani / Oaks)';
        const applyUrl = `https://minor.wd102.myworkdayjobs.com/en-US/Careers${j.externalPath}`;

        const isLanka = locationStr.toLowerCase().includes('sri lanka') || locationStr.toLowerCase().includes('kalutara') || locationStr.toLowerCase().includes('colombo');
        const countryName = isLanka ? 'Sri Lanka' : (locationStr.split(',').pop()?.trim() || 'Overseas');
        const countryId = countryMap[countryName.toLowerCase()] || countries?.[0]?.id || null;

        // Default closing date 30 days from now
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const closingStr = futureDate.toISOString().split('T')[0];

        // 1. Check if job already exists in DB
        const { data: existing } = await supabase
          .from('jobs')
          .select('id')
          .eq('title', title)
          .eq('company', company)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`[SKIP DUPLICATE] ${title} (${locationStr})`);
          continue;
        }

        // 2. Generate White + Yellow Mix Background Image Post SVG
        const svgCode = generateWhiteYellowJobBannerSvg({
          title: title,
          company: company,
          location: locationStr,
          closingDate: closingStr,
          salary: 'Attractive Salary & Benefits',
          sectorTag: isLanka ? 'SRI LANKA VACANCY' : `OVERSEAS: ${countryName.toUpperCase()}`
        });

        const bannerDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`;

        // 3. Insert into Supabase DB
        const { data: inserted, error } = await supabase.from('jobs').insert([{
          title: title,
          company: company,
          location: locationStr,
          salary: 'Attractive Salary & Benefits',
          closing_date: closingStr,
          post_type: 'image',
          is_government: false,
          is_overseas: !isLanka,
          is_private_sector: false,
          status: 'draft', // DRAFT status for Admin review
          thumbnail_url: bannerDataUri,
          country_id: countryId,
          description: `Official vacancy for ${title} at ${company}. Located in ${locationStr}. Posted: ${j.postedOn || 'Recently'}. Apply online via official career portal.`,
          apply_method: 'online',
          apply_url: applyUrl
        }]).select();

        if (error) {
          console.error(`Error inserting ${title}:`, error);
        } else if (inserted && inserted.length > 0) {
          const jobId = inserted[0].id;
          await supabase.from('job_images').insert([{
            job_id: jobId,
            url: bannerDataUri
          }]);
          console.log(`✅ INGESTED [ID: ${jobId}] ${title} | ${locationStr}`);
          totalIngested++;
        }
      }
    } catch (err) {
      console.error('Page fetch error:', err);
    }
  }

  console.log(`\n=== INGESTION COMPLETE: Added ${totalIngested} NEW Minor Hotels Workday Vacancies to Database! ===`);
}

ingestAllMinorHotelsJobs();
