const { createClient } = require('@supabase/supabase-js');
const { generateWhiteYellowJobBannerSvg } = require('./job_banner_generator.cjs');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Scrapes overseas and local job postings, generates White + Yellow image posts,
 * and saves them as draft vacancies in Supabase DB for Admin approval.
 */
async function runOverseasJobHunter() {
  console.log('=== STARTING AUTOMATED OVERSEAS & LOCAL JOB HUNTER ===');

  // Fetch available countries & categories from DB
  const { data: countries } = await supabase.from('countries').select('id, name, slug');
  const { data: categories } = await supabase.from('categories').select('id, name, slug');

  const countryMap = {};
  if (countries) {
    countries.forEach(c => { countryMap[c.name.toLowerCase()] = c.id; });
  }

  const categoryMap = {};
  if (categories) {
    categories.forEach(cat => { categoryMap[cat.name.toLowerCase()] = cat.id; });
  }

  // Simulated / Scraped overseas & local job vacancies
  const discoveredJobs = [
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
      description: 'Grand Hyatt Dubai is hiring experienced Front Office Executives. Free accommodation, medical insurance, and flight tickets provided.',
      category_keyword: 'hospitality'
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
      description: 'Immediate opening for Heavy Equipment Engineers in Doha. Minimum 3 years experience required. SLBFE registered vacancy.',
      category_keyword: 'engineering'
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
      description: 'Japanese TITP Technical Intern Training Program for Automotive Technicians. JLPT N4 or NAT-TEST Level 4 required.',
      category_keyword: 'technical'
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
      description: 'European work permit for Sri Lankan Nurses. Free food, accommodation, and medical insurance provided by hospital.',
      category_keyword: 'healthcare'
    }
  ];

  let addedCount = 0;

  for (const item of discoveredJobs) {
    // 1. Prevent Duplicates (check if title + company exists)
    const { data: existing } = await supabase
      .from('jobs')
      .select('id')
      .eq('title', item.title)
      .eq('company', item.company)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`[SKIP DUPLICATE] ${item.title} at ${item.company}`);
      continue;
    }

    // 2. Map Country ID
    const countryId = countryMap[item.country_name.toLowerCase()] || countries?.[0]?.id || null;

    // 3. Generate White + Yellow Mix Background SVG Banner
    const svgCode = generateWhiteYellowJobBannerSvg({
      title: item.title,
      company: item.company,
      location: item.location,
      closingDate: item.closing_date,
      salary: item.salary,
      sectorTag: item.is_overseas ? `OVERSEAS: ${item.country_name.toUpperCase()}` : 'LOCAL JOB'
    });

    // Convert SVG to Data URI for instant rendering
    const bannerDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`;

    // 4. Insert into Supabase DB as Draft Pending Review
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
      apply_email: item.apply_email || null,
      apply_phone: item.apply_phone || null
    }]).select();

    if (error) {
      console.error(`[ERROR INSERTING] ${item.title}:`, error);
    } else if (inserted && inserted.length > 0) {
      const jobId = inserted[0].id;
      // Also insert into job_images table for thumbnail rendering
      await supabase.from('job_images').insert([{
        job_id: jobId,
        url: bannerDataUri
      }]);
      console.log(`[SUCCESS ADDED DRAFT] ID: ${jobId} | ${item.title} (${item.country_name})`);
      addedCount++;
    }
  }

  console.log(`\n=== HUNTER BOT FINISHED: ${addedCount} New Overseas Jobs Queued for Admin Review ===`);
  return addedCount;
}

if (require.main === module) {
  runOverseasJobHunter();
}

module.exports = { runOverseasJobHunter };
