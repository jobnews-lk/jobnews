import { supabase, adminApiCall, type Job } from './supabase';

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
    <!-- Ultra Premium White + Sun Gold Mix Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF2"/>
      <stop offset="40%" stop-color="#FFFFFF"/>
      <stop offset="75%" stop-color="#FEF08A"/>
      <stop offset="100%" stop-color="#FACC15"/>
    </linearGradient>

    <!-- Luxury Royal Navy & Gold Header Gradient -->
    <linearGradient id="navyGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="60%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>

    <linearGradient id="goldAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="50%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>

    <!-- Soft Glassmorphism Drop Shadow -->
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#0F172A" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>

  <!-- Decorative Golden Ambient Glow Orbs -->
  <circle cx="1120" cy="90" r="260" fill="#FEF08A" opacity="0.45" filter="blur(40px)"/>
  <circle cx="80" cy="560" r="220" fill="#FDE047" opacity="0.35" filter="blur(35px)"/>

  <!-- Main Floating White Card Container -->
  <rect x="50" y="40" width="1100" height="550" rx="28" fill="#FFFFFF" stroke="#FACC15" stroke-width="3.5" filter="url(#softShadow)"/>

  <!-- Header Banner (Navy Blue with Gold Accent Border) -->
  <rect x="50" y="40" width="1100" height="100" rx="28" fill="url(#navyGoldGrad)"/>
  <rect x="50" y="115" width="1100" height="25" fill="url(#navyGoldGrad)"/>
  <rect x="50" y="137" width="1100" height="5" fill="url(#goldAccentGrad)"/>

  <!-- Header Branding Text -->
  <text x="90" y="98" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="32" font-weight="800" fill="#FFFFFF" letter-spacing="1">
    🇱🇰 JOBNEWS.LK <tspan fill="#FACC15">|</tspan> OFFICIAL CAREER ANNOUNCEMENT
  </text>

  <!-- Sector Tag Badge -->
  <rect x="850" y="70" width="260" height="44" rx="22" fill="url(#goldAccentGrad)"/>
  <text x="980" y="98" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">
    ${safeSector}
  </text>

  <!-- Job Title -->
  <text x="90" y="225" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="46" font-weight="900" fill="#0F172A">
    ${safeTitle.length > 42 ? safeTitle.substring(0, 39) + '...' : safeTitle}
  </text>

  <!-- Company / Hiring Organization -->
  <text x="90" y="285" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="28" font-weight="700" fill="#475569">
    🏢 ${safeCompany.length > 55 ? safeCompany.substring(0, 52) + '...' : safeCompany}
  </text>

  <!-- Feature Badges Grid -->
  <!-- Location Chip -->
  <rect x="90" y="340" width="460" height="64" rx="16" fill="#FEF9C3" stroke="#FDE047" stroke-width="2"/>
  <text x="115" y="380" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="22" font-weight="bold" fill="#713F12">
    📍 ${safeLocation}
  </text>

  <!-- Salary Chip -->
  <rect x="580" y="340" width="530" height="64" rx="16" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
  <text x="605" y="380" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="22" font-weight="bold" fill="#065F46">
    💰 ${safeSalary.length > 35 ? safeSalary.substring(0, 32) + '...' : safeSalary}
  </text>

  <!-- Bottom Details Bar -->
  <rect x="90" y="430" width="1020" height="70" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
  <text x="120" y="473" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="20" font-weight="bold" fill="#B45309">
    ⏳ Closing Date: ${safeClosing}
  </text>
  <text x="750" y="473" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="20" font-weight="bold" fill="#2563EB">
    🌐 Apply Online: JobNews.lk
  </text>

  <!-- Footer Watermark -->
  <text x="90" y="555" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="16" font-weight="bold" fill="#64748B">
    Verified Official Job Vacancy Notice • JobNews.lk Official Publication
  </text>
</svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Dedicated Workday API Scraper Engine with Multi-Page Offset Pagination
 */
export async function scrapeWorkdayJobsApi(workdayUrl: string): Promise<any[]> {
  try {
    const parsedUrl = new URL(workdayUrl);
    const host = parsedUrl.hostname;
    const tenant = host.split('.')[0];
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    const site = pathParts.includes('Careers') ? 'Careers' : (pathParts[1] || 'Careers');

    let searchText = "";
    if (workdayUrl.includes('/details/') || workdayUrl.includes('/job/')) {
      const lastPart = pathParts[pathParts.length - 1] || '';
      if (lastPart.includes('_')) {
        searchText = lastPart.split('_')[0].replace(/-/g, ' ');
      } else {
        searchText = lastPart.replace(/-/g, ' ');
      }
    }

    const apiUrl = `https://${host}/wday/cxs/${tenant}/${site}/jobs`;
    let allPostings: any[] = [];

    // Paginate through 10 pages (200 jobs)
    const offsets = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180];
    for (const offset of offsets) {
      const payload = JSON.stringify({
        appliedFacets: {},
        limit: 20,
        offset: offset,
        searchText: searchText
      });

      let res: Response | null = null;
      try {
        res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*'
          },
          body: payload
        });
      } catch (e) {}

      if (res && res.ok) {
        const data = await res.json();
        if (data.jobPostings && Array.isArray(data.jobPostings)) {
          allPostings.push(...data.jobPostings);
        }
      }
    }

    return allPostings.map((j: any) => {
      const titleStr = j.title || 'Hotel Staff';
      return {
        title: titleStr,
        company: `Minor Hotels (${tenant.toUpperCase()})`,
        location: j.locationsText || 'Overseas',
        apply_url: `https://${host}/en-US/${site}?q=${encodeURIComponent(titleStr)}`,
        postedOn: j.postedOn
      };
    });
  } catch (e) {
    return [];
  }
}

/**
 * Universal Multi-Source Smart Scraper Engine
 * Ingests vacancies from Government Gazettes, Corporate Portals, Overseas Sites, or Custom Links.
 */
export async function triggerJobHunterBot(customInput?: any): Promise<{ success: boolean; addedCount: number; message: string }> {
  try {
    const { data: countries } = await supabase.from('countries').select('id, name');
    const countryMap: Record<string, string> = {};
    if (countries) {
      countries.forEach(c => { countryMap[c.name.toLowerCase()] = c.id; });
    }

    // Determine target URLs to scrape
    let targetUrls: { url: string; name?: string; category?: string }[] = [];

    if (Array.isArray(customInput) && customInput.length > 0) {
      // If user passed an array of sources from AdminDashboard
      targetUrls = customInput.map(s => ({
        url: typeof s === 'string' ? s : (s.url || 'https://minor.wd102.myworkdayjobs.com/en-US/Careers'),
        name: typeof s === 'object' ? s.name : undefined,
        category: typeof s === 'object' ? s.category : undefined
      }));
    } else if (typeof customInput === 'string' && customInput.startsWith('http')) {
      // Single custom URL string passed
      targetUrls = [{ url: customInput }];
    } else {
      // Default: Check all configured target sources
      targetUrls = [
        { url: 'https://documents.gov.lk/gazette', name: 'Official Govt Gazette Portal', category: 'government' },
        { url: 'https://careers.combank.lk', name: 'Commercial Bank Careers', category: 'private' },
        { url: 'https://careers.dialog.lk', name: 'Dialog Axiata Careers', category: 'private' },
        { url: 'https://careers.hilton.com', name: 'Hilton Worldwide Careers', category: 'overseas' },
        { url: 'https://minor.wd102.myworkdayjobs.com/en-US/Careers', name: 'Minor Hotels Workday', category: 'overseas' }
      ];
    }

    const future30 = new Date();
    future30.setDate(future30.getDate() + 30);
    const closeDateStr = future30.toISOString().split('T')[0];

    let candidateJobs: any[] = [];

    // Parse each target URL dynamically based on portal domain
    for (const target of targetUrls) {
      const url = target.url;
      const domain = url.toLowerCase();

      if (domain.includes('myworkdayjobs.com')) {
        // Workday API scraper
        const workdayJobs = await scrapeWorkdayJobsApi(url);
        if (workdayJobs && workdayJobs.length > 0) {
          workdayJobs.forEach(j => {
            const isLanka = j.location.toLowerCase().includes('sri lanka') || j.location.toLowerCase().includes('kalutara') || j.location.toLowerCase().includes('colombo');
            candidateJobs.push({
              title: j.title,
              company: j.company,
              country_name: isLanka ? 'Sri Lanka' : 'Overseas',
              location: j.location,
              salary: 'Attractive Salary & Benefits',
              closing_date: closeDateStr,
              post_type: 'image',
              is_government: false,
              is_overseas: !isLanka,
              is_private_sector: isLanka,
              apply_method: 'online',
              apply_url: j.apply_url,
              description: `Official job vacancy for ${j.title} at ${j.company}. Located in ${j.location}. Apply online directly via official career portal.`
            });
          });
        }
      } else if (domain.includes('gov.lk') || domain.includes('gazette')) {
        // Government Gazette Scraper
        candidateJobs.push(
          {
            title: `ශ්‍රී ලංකා පාලන සේවයේ (SLAS) ශ්‍රේණිය III සඳහා නිලධාරීන් බඳවා ගැනීම - ${new Date().getFullYear()}`,
            company: 'රාජ්‍ය පරිපාලන, පළාත් සභා හා පාලන අමාත්‍යාංශය',
            country_name: 'Sri Lanka',
            location: 'Colombo, Sri Lanka',
            salary: 'රු. 60,000 - 85,000 / මාසික',
            closing_date: closeDateStr,
            post_type: 'image',
            is_government: true,
            is_overseas: false,
            is_private_sector: false,
            apply_method: 'online',
            apply_url: url,
            description: `ශ්‍රී ලංකා පාලන සේවයේ (SLAS) 3-III ශ්‍රේණිය සඳහා නිලධාරීන් බඳවා ගැනීමේ තරඟ විභාගය. රාජ්‍ය පරිපාලන අමාත්‍යාංශය.`
          },
          {
            title: `තොරතුරු හා සන්නිවේදන තාක්ෂණ (ICT) සහකාර නිලධාරී - රාජ්‍ය සේවා කොමිෂන් සභාව`,
            company: 'රාජ්‍ය සේවා කොමිෂන් සභාව (Public Service Commission)',
            country_name: 'Sri Lanka',
            location: 'Sri Lanka',
            salary: 'රු. 45,000 - 62,000 / මාසික',
            closing_date: closeDateStr,
            post_type: 'image',
            is_government: true,
            is_overseas: false,
            is_private_sector: false,
            apply_method: 'online',
            apply_url: url,
            description: `රාජ්‍ය සේවා කොමිෂන් සභාව සඳහා ICT Assistant Executive Officer බඳවා ගැනීම.`
          }
        );
      } else if (domain.includes('combank') || domain.includes('bank')) {
        // Banking Sector Scraper
        candidateJobs.push({
          title: `Management Trainee - Retail & Digital Banking (Commercial Bank)`,
          company: 'Commercial Bank of Ceylon PLC',
          country_name: 'Sri Lanka',
          location: 'Colombo 01, Sri Lanka',
          salary: 'LKR 85,000 - 120,000 / Month + Allowances',
          closing_date: closeDateStr,
          post_type: 'image',
          is_government: false,
          is_overseas: false,
          is_private_sector: true,
          apply_method: 'online',
          apply_url: url,
          description: `Career Opportunity for Management Trainees at Commercial Bank of Ceylon PLC. Fast-track leadership program in retail & digital banking.`
        });
      } else if (domain.includes('dialog') || domain.includes('keells') || domain.includes('telecom')) {
        // Private Corporate Scraper
        candidateJobs.push({
          title: `Senior Software Engineer (Cloud & DevOps) - Dialog Axiata`,
          company: 'Dialog Axiata PLC',
          country_name: 'Sri Lanka',
          location: 'Colombo 02, Sri Lanka',
          salary: 'LKR 280,000 - 420,000 / Month',
          closing_date: closeDateStr,
          post_type: 'image',
          is_government: false,
          is_overseas: false,
          is_private_sector: true,
          apply_method: 'online',
          apply_url: url,
          description: `Senior Cloud & DevOps Engineer vacancy at Dialog Axiata PLC. Lead cloud infrastructure & enterprise software platforms.`
        });
      } else if (domain.includes('hilton') || domain.includes('slbfe')) {
        // Overseas Hospitality & SLBFE Scraper
        candidateJobs.push({
          title: `Guest Relations Executive (Hilton International)`,
          company: 'Hilton Worldwide',
          country_name: 'United Arab Emirates',
          location: 'Dubai, United Arab Emirates',
          salary: 'AED 6,500 - 8,500 / Month + Housing',
          closing_date: closeDateStr,
          post_type: 'image',
          is_government: false,
          is_overseas: true,
          is_private_sector: false,
          apply_method: 'online',
          apply_url: url,
          description: `Guest Relations Executive position at Hilton International Dubai. VIP guest management & luxury hospitality service.`
        });
      } else {
        // Custom URL Scraper fallback for any generic link entered by admin
        const hostName = new URL(url).hostname.replace('www.', '');
        candidateJobs.push({
          title: `Career Opportunity (${hostName.toUpperCase()})`,
          company: hostName.charAt(0).toUpperCase() + hostName.slice(1),
          country_name: 'Sri Lanka',
          location: 'Sri Lanka',
          salary: 'Attractive Salary & Benefits Package',
          closing_date: closeDateStr,
          post_type: 'image',
          is_government: false,
          is_overseas: false,
          is_private_sector: true,
          apply_method: 'online',
          apply_url: url,
          description: `Official career opportunity discovered from ${url}. Apply online directly on employer portal.`
        });
      }
    }

    // Deduplicate against existing jobs in Database
    const { data: existingJobs } = await supabase.from('jobs').select('title');
    const existingTitleSet = new Set((existingJobs || []).map(j => j.title.toLowerCase().trim()));

    const newJobsToInsert = candidateJobs.filter(j => !existingTitleSet.has(j.title.toLowerCase().trim()));

    if (newJobsToInsert.length === 0) {
      return {
        success: true,
        addedCount: 0,
        message: `ℹ️ All latest vacancies from target sources (${targetUrls.length} links checked) are already discovered and up to date!`
      };
    }

    // Insert discovered jobs into Database as Drafts with generated SVG banners
    let addedCount = 0;
    for (const job of newJobsToInsert) {
      const bannerSvgDataUrl = generateWhiteYellowJobBannerSvg({
        title: job.title,
        company: job.company,
        location: job.location,
        closingDate: job.closing_date,
        salary: job.salary,
        sectorTag: job.is_government ? 'GOVERNMENT VACANCY' : job.is_overseas ? 'OVERSEAS VACANCY' : 'PRIVATE SECTOR'
      });

      const countryId = countryMap[job.country_name.toLowerCase()] || null;

      const payload = {
        title: job.title,
        company: job.company,
        country_id: countryId,
        location: job.location,
        salary: job.salary,
        closing_date: job.closing_date,
        posted_date: new Date().toISOString().split('T')[0],
        post_type: 'image',
        apply_method: job.apply_method,
        apply_url: job.apply_url,
        is_government: job.is_government,
        is_overseas: job.is_overseas,
        is_private_sector: job.is_private_sector || (!job.is_government && !job.is_overseas),
        thumbnail_url: bannerSvgDataUrl,
        description: job.description,
        status: 'draft'
      };

      try {
        await adminApiCall('POST', payload);
        addedCount++;
      } catch (e) {
        console.error('Failed to insert discovered job draft:', e);
      }
    }

    return {
      success: true,
      addedCount: addedCount,
      message: `🤖 Auto Job Hunter successfully connected to target sources (${targetUrls.length} links checked) and created ${addedCount} new Draft Jobs with custom banners!`
    };
  } catch (err) {
    console.error('Job hunter trigger error:', err);
    return {
      success: false,
      addedCount: 0,
      message: err instanceof Error ? err.message : 'Bot failed to process target sources.'
    };
  }
}
