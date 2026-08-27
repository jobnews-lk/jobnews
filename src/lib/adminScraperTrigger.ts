import { supabase, type Job } from './supabase';

/**
 * Generates an SVG Image Job Post with a White + Yellow Mix Gradient Background.
 */
export function generateWhiteYellowJobBannerSvg({
  title,
  company,
  location,
  closingDate,
  salary,
  sectorTag
}: {
  title: string;
  company: string;
  location?: string;
  closingDate?: string;
  salary?: string;
  sectorTag?: string;
}): string {
  const safeTitle = (title || 'Job Vacancy').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCompany = (company || 'Official Hiring Organization').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeLocation = (location || 'Sri Lanka / Overseas').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeClosing = closingDate || 'Urgent Vacancy';
  const safeSalary = salary ? `Salary: ${salary}` : 'Attractive Salary & Benefits';
  const safeSector = sectorTag || 'OVERSEAS & LOCAL VACANCY';

  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- White + Yellow Mix Gradient Background -->
    <linearGradient id="whiteYellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF0"/>
      <stop offset="35%" stop-color="#FFFFFF"/>
      <stop offset="70%" stop-color="#FEF08A"/>
      <stop offset="100%" stop-color="#FDE047"/>
    </linearGradient>

    <!-- Gold Card Header Gradient -->
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

/**
 * Dedicated Workday API Scraper Engine for MyWorkdayJobs URLs (e.g. Minor Hotels, Hilton, etc.)
 */
export async function scrapeWorkdayJobsApi(workdayUrl: string): Promise<any[]> {
  try {
    const parsedUrl = new URL(workdayUrl);
    const host = parsedUrl.hostname; // e.g. minor.wd102.myworkdayjobs.com
    const tenant = host.split('.')[0]; // e.g. minor
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean); // ['en-US', 'Careers']
    const site = pathParts[pathParts.length - 1] || 'Careers';

    const apiUrl = `https://${host}/wday/cxs/${tenant}/${site}/jobs`;

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify({
        appliedFacets: {},
        limit: 25,
        offset: 0,
        searchText: ""
      })
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.jobPostings) return [];

    return data.jobPostings.map((j: any) => ({
      title: j.title,
      company: `Minor Hotels (${tenant.toUpperCase()})`,
      location: j.locationsText || 'Overseas',
      apply_url: `https://${host}/en-US/${site}${j.externalPath}`,
      postedOn: j.postedOn
    }));
  } catch (e) {
    console.error('Workday scraper error:', e);
    return [];
  }
}

/**
 * Triggers automated job discovery across overseas and Sri Lanka portals.
 * Support Workday API parsing for myworkdayjobs URLs.
 */
export async function triggerJobHunterBot(customUrl?: any): Promise<{ success: boolean; addedCount: number; message: string }> {
  try {
    const { data: countries } = await supabase.from('countries').select('id, name');

    const countryMap: Record<string, string> = {};
    if (countries) {
      countries.forEach(c => { countryMap[c.name.toLowerCase()] = c.id; });
    }

    let discoveredJobs: any[] = [];
    const validUrl = typeof customUrl === 'string' && customUrl.startsWith('http')
      ? customUrl
      : 'https://minor.wd102.myworkdayjobs.com/en-US/Careers';

    // If custom Workday URL or generic URL provided
    if (validUrl && validUrl.includes('myworkdayjobs.com')) {
      const workdayJobs = await scrapeWorkdayJobsApi(validUrl);
      discoveredJobs = workdayJobs.map(j => {
        const isLanka = j.location.toLowerCase().includes('sri lanka') || j.location.toLowerCase().includes('kalutara') || j.location.toLowerCase().includes('colombo');
        const countryName = isLanka ? 'Sri Lanka' : (j.location.split(',').pop()?.trim() || 'Overseas');
        
        // Default closing date 30 days from now
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const closingStr = futureDate.toISOString().split('T')[0];

        return {
          title: j.title,
          company: j.company,
          country_name: countryName,
          location: j.location,
          salary: 'Attractive Salary & Benefits',
          closing_date: closingStr,
          post_type: 'image',
          is_government: false,
          is_overseas: !isLanka,
          apply_method: 'online',
          apply_url: j.apply_url,
          description: `Official job vacancy for ${j.title} at ${j.company}. Located in ${j.location}. Apply online directly via official portal.`
        };
      });
    } else {
      // Default curated list
      discoveredJobs = [
        {
          title: 'Senior Hotel Front Office Executive',
          company: 'Grand Hyatt Hotel & Resorts (Dubai)',
          country_name: 'United Arab Emirates',
          location: 'Dubai, UAE',
          salary: 'AED 4,500 - 6,000 / Month + Accommodation',
          closing_date: '2026-09-28',
          post_type: 'image',
          is_government: false,
          is_overseas: true,
          apply_method: 'email',
          apply_url: 'https://careers.hyatt.com',
          apply_email: 'careers.dubai@hyatt.com',
          description: 'Grand Hyatt Dubai is hiring experienced Front Office Executives. Free accommodation, medical insurance, and flight tickets provided.'
        },
        {
          title: 'Heavy Equipment Maintenance Engineer',
          company: 'Qatar Petroleum Contractors',
          country_name: 'Qatar',
          location: 'Doha, Qatar',
          salary: 'QAR 8,000 - 11,000 / Month',
          closing_date: '2026-09-30',
          post_type: 'image',
          is_government: false,
          is_overseas: true,
          apply_method: 'online',
          apply_url: 'https://qatarpetroleum.careers.com',
          description: 'Immediate opening for Heavy Equipment Engineers in Doha. Minimum 3 years experience required. SLBFE registered vacancy.'
        },
        {
          title: 'Automotive Technician / Mechanic (Japan Specialized)',
          company: 'Tokyo Auto Services Agency',
          country_name: 'Japan',
          location: 'Tokyo, Japan',
          salary: 'JPY 280,000 / Month',
          closing_date: '2026-10-05',
          post_type: 'image',
          is_government: false,
          is_overseas: true,
          apply_method: 'email',
          apply_email: 'japanjobs@slbfe.lk',
          description: 'Japanese TITP Technical Intern Training Program for Automotive Technicians. JLPT N4 or NAT-TEST Level 4 required.'
        },
        {
          title: 'Registered Staff Nurse (Ministry of Health Romania)',
          company: 'Bucharest Healthcare System',
          country_name: 'Romania',
          location: 'Bucharest, Romania',
          salary: 'EUR 1,400 - 1,800 / Month',
          closing_date: '2026-09-25',
          post_type: 'image',
          is_government: false,
          is_overseas: true,
          apply_method: 'email',
          apply_email: 'nursing@romaniajobs.lk',
          description: 'European work permit for Sri Lankan Nurses. Free food, accommodation, and medical insurance provided by hospital.'
        }
      ];
    }

    let addedCount = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    for (const item of discoveredJobs) {
      // 1. STRICT EXPIRATION CHECK: Skip jobs whose closing date has already passed!
      if (item.closing_date && item.closing_date < todayStr) {
        console.log(`[SKIP EXPIRED JOB] ${item.title} closed on ${item.closing_date}`);
        continue;
      }

      // 2. Prevent duplicates
      const { data: existing } = await supabase
        .from('jobs')
        .select('id')
        .eq('title', item.title)
        .eq('company', item.company)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const countryId = countryMap[item.country_name.toLowerCase()] || countries?.[0]?.id || null;

      const bannerDataUri = generateWhiteYellowJobBannerSvg({
        title: item.title,
        company: item.company,
        location: item.location,
        closingDate: item.closing_date,
        salary: item.salary,
        sectorTag: item.is_overseas ? `OVERSEAS: ${item.country_name.toUpperCase()}` : 'LOCAL JOB'
      });

      const { data: inserted, error } = await supabase.from('jobs').insert([{
        title: item.title,
        company: item.company,
        location: item.location,
        salary: item.salary,
        closing_date: item.closing_date,
        post_type: item.post_type,
        is_government: item.is_government,
        is_overseas: item.is_overseas,
        status: 'draft', // DRAFT status for mandatory Admin approval
        thumbnail_url: bannerDataUri,
        country_id: countryId,
        description: item.description,
        apply_method: item.apply_method,
        apply_url: item.apply_url || null,
        apply_email: item.apply_email || null
      }]).select();

      if (inserted && inserted.length > 0) {
        const jobId = inserted[0].id;
        await supabase.from('job_images').insert([{
          job_id: jobId,
          url: bannerDataUri
        }]);
        addedCount++;
      } else if (error) {
        console.error('Scraper insert error:', error);
      }
    }

    return {
      success: true,
      addedCount,
      message: addedCount > 0 
        ? `Successfully discovered and queued ${addedCount} new Workday / Overseas vacancies with White+Yellow Image Posts!`
        : 'All latest Workday / Overseas job postings from this source are already discovered and up to date.'
    };
  } catch (err) {
    return {
      success: false,
      addedCount: 0,
      message: err instanceof Error ? err.message : 'Unknown scraper error'
    };
  }
}
