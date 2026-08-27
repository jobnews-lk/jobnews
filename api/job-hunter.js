const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

function generateWhiteYellowJobBannerSvg({ title, company, location, closingDate, salary, sectorTag }) {
  const safeTitle = (title || 'Job Vacancy').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCompany = (company || 'Official Hiring Organization').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeLocation = (location || 'Sri Lanka / Overseas').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeClosing = closingDate || 'Urgent Vacancy';
  const safeSalary = salary ? `Salary: ${salary}` : 'Attractive Salary & Benefits';
  const safeSector = sectorTag || 'OVERSEAS & LOCAL VACANCY';

  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="whiteYellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF0"/>
      <stop offset="35%" stop-color="#FFFFFF"/>
      <stop offset="70%" stop-color="#FEF08A"/>
      <stop offset="100%" stop-color="#FDE047"/>
    </linearGradient>

    <linearGradient id="goldHeaderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#EAB308"/>
      <stop offset="50%" stop-color="#CA8A04"/>
      <stop offset="100%" stop-color="#A16207"/>
    </linearGradient>

    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#whiteYellowGrad)"/>

  <circle cx="1100" cy="80" r="220" fill="#FEF08A" opacity="0.4" filter="blur(40px)"/>
  <circle cx="100" cy="550" r="180" fill="#FDE047" opacity="0.3" filter="blur(30px)"/>

  <rect x="60" y="50" width="1080" height="530" rx="24" fill="#FFFFFF" stroke="#FACC15" stroke-width="4" filter="url(#shadow)"/>

  <rect x="60" y="50" width="1080" height="90" rx="24" fill="url(#goldHeaderGrad)"/>
  <rect x="60" y="110" width="1080" height="30" fill="url(#goldHeaderGrad)"/>

  <text x="100" y="105" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="bold" fill="#FFFFFF" letter-spacing="1">
    🇱🇰 JOBNEWS.LK | OFFICIAL VACANCY ANNOUNCEMENT
  </text>

  <rect x="850" y="75" width="250" height="42" rx="21" fill="#FFFFFF" opacity="0.95"/>
  <text x="975" y="102" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold" fill="#854D0E" text-anchor="middle">
    ${safeSector}
  </text>

  <text x="100" y="225" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="bold" fill="#0F172A">
    ${safeTitle.length > 45 ? safeTitle.substring(0, 42) + '...' : safeTitle}
  </text>

  <text x="100" y="285" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="600" fill="#475569">
    🏢 ${safeCompany.length > 55 ? safeCompany.substring(0, 52) + '...' : safeCompany}
  </text>

  <rect x="100" y="340" width="440" height="60" rx="14" fill="#FEF9C3" stroke="#FDE047" stroke-width="2"/>
  <text x="120" y="378" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#713F12">
    📍 ${safeLocation}
  </text>

  <rect x="560" y="340" width="540" height="60" rx="14" fill="#FEF9C3" stroke="#FDE047" stroke-width="2"/>
  <text x="580" y="378" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#713F12">
    💰 ${safeSalary}
  </text>

  <rect x="100" y="425" width="1000" height="65" rx="14" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
  <text x="130" y="466" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#B45309">
    ⏳ Closing Date: ${safeClosing} | Apply Online at JobNews.lk
  </text>

  <text x="100" y="540" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold" fill="#94A3B8">
    ✓ Verified Official Job Notice — JobNews.lk Sri Lanka
  </text>
  <text x="1080" y="540" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" fill="#CA8A04" text-anchor="end">
    https://jobnews.lk
  </text>
</svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { data: countries } = await supabase.from('countries').select('id, name');
    const countryMap = {};
    if (countries) {
      countries.forEach(c => { countryMap[c.name.toLowerCase()] = c.id; });
    }

    const workdayApiUrl = 'https://minor.wd102.myworkdayjobs.com/wday/cxs/minor/Careers/jobs';
    let addedCount = 0;
    const addedTitles = [];

    // Fetch 2 pages (40 jobs) from Workday API
    for (const offset of [0, 20]) {
      const response = await fetch(workdayApiUrl, {
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

      if (!response.ok) continue;

      const data = await response.json();
      const jobPostings = data.jobPostings || [];

      for (const j of jobPostings) {
        const title = j.title;
        const locationStr = j.locationsText || 'Overseas';
        const company = 'Minor Hotels (Anantara / Avani / Oaks)';
        const applyUrl = `https://minor.wd102.myworkdayjobs.com/en-US/Careers${j.externalPath}`;

        const isLanka = locationStr.toLowerCase().includes('sri lanka') || locationStr.toLowerCase().includes('kalutara') || locationStr.toLowerCase().includes('colombo');
        const countryName = isLanka ? 'Sri Lanka' : (locationStr.split(',').pop()?.trim() || 'Overseas');
        const countryId = countryMap[countryName.toLowerCase()] || countries?.[0]?.id || null;

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const closingStr = futureDate.toISOString().split('T')[0];

        // Check duplicates
        const { data: existing } = await supabase
          .from('jobs')
          .select('id')
          .eq('title', title)
          .eq('company', company)
          .limit(1);

        if (existing && existing.length > 0) continue;

        const bannerDataUri = generateWhiteYellowJobBannerSvg({
          title,
          company,
          location: locationStr,
          closingDate: closingStr,
          salary: 'Attractive Salary & Benefits',
          sectorTag: isLanka ? 'SRI LANKA VACANCY' : `OVERSEAS: ${countryName.toUpperCase()}`
        });

        // Insert into Supabase
        const { data: inserted, error } = await supabase.from('jobs').insert([{
          title,
          company,
          location: locationStr,
          salary: 'Attractive Salary & Benefits',
          closing_date: closingStr,
          post_type: 'image',
          is_government: false,
          is_overseas: !isLanka,
          is_private_sector: false,
          status: 'draft',
          thumbnail_url: bannerDataUri,
          country_id: countryId,
          description: `Official job vacancy for ${title} at ${company}. Located in ${locationStr}. Posted: ${j.postedOn || 'Recently'}. Apply online directly via official portal.`,
          apply_method: 'online',
          apply_url: applyUrl
        }]).select();

        if (inserted && inserted.length > 0) {
          const jobId = inserted[0].id;
          await supabase.from('job_images').insert([{
            job_id: jobId,
            url: bannerDataUri
          }]);
          addedCount++;
          addedTitles.push(`${title} (${locationStr})`);
        }
      }
    }

    return res.status(200).json({
      success: true,
      addedCount,
      addedTitles,
      message: addedCount > 0
        ? `🎉 Successfully discovered and added ${addedCount} NEW Minor Hotels / Overseas jobs to Drafts!`
        : 'All latest Workday / Minor Hotels jobs are up to date in Database.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
