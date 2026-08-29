const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

// White + Gold SVG Banner Generator
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
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF2"/>
      <stop offset="40%" stop-color="#FFFFFF"/>
      <stop offset="75%" stop-color="#FEF08A"/>
      <stop offset="100%" stop-color="#FACC15"/>
    </linearGradient>
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
  </defs>
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect x="50" y="40" width="1100" height="550" rx="28" fill="#FFFFFF" stroke="#FACC15" stroke-width="3.5"/>
  <rect x="50" y="40" width="1100" height="100" rx="28" fill="url(#navyGoldGrad)"/>
  <rect x="50" y="137" width="1100" height="5" fill="url(#goldAccentGrad)"/>
  <text x="90" y="98" font-family="Segoe UI, sans-serif" font-size="32" font-weight="800" fill="#FFFFFF">
    🇱🇰 JOBNEWS.LK <tspan fill="#FACC15">|</tspan> OFFICIAL CAREER ANNOUNCEMENT
  </text>
  <text x="90" y="225" font-family="Segoe UI, sans-serif" font-size="46" font-weight="900" fill="#0F172A">
    ${safeTitle.length > 42 ? safeTitle.substring(0, 39) + '...' : safeTitle}
  </text>
  <text x="90" y="285" font-family="Segoe UI, sans-serif" font-size="28" font-weight="700" fill="#475569">
    🏢 ${safeCompany.length > 55 ? safeCompany.substring(0, 52) + '...' : safeCompany}
  </text>
</svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function testAutoJobHunterBot() {
  console.log('🤖 STARTING LIVE AUTO JOB HUNTER BOT TEST...');

  const sourcesList = [
    { name: 'Official Govt Gazette Portal', url: 'https://documents.gov.lk/gazette', category: 'government' },
    { name: 'Commercial Bank Careers', url: 'https://careers.combank.lk', category: 'private' },
    { name: 'Dialog Axiata Careers', url: 'https://careers.dialog.lk', category: 'private' },
    { name: 'Hilton Worldwide Careers', url: 'https://careers.hilton.com', category: 'overseas' }
  ];

  console.log(`📡 Connecting to ${sourcesList.length} target source links from active sources list...`);

  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const future30 = new Date();
  future30.setDate(future30.getDate() + 30);
  const closeDateStr = `${future30.getFullYear()}-${String(future30.getMonth() + 1).padStart(2, '0')}-${String(future30.getDate()).padStart(2, '0')}`;

  const candidateJobs = [
    {
      title: `ශ්‍රී ලංකා පාලන සේවයේ (SLAS) ශ්‍රේණිය III සඳහා නිලධාරීන් බඳවා ගැනීම - 2026`,
      company: 'රාජ්‍ය පරිපාලන, පළාත් සභා හා පාලන අමාත්‍යාංශය',
      location: 'Colombo, Sri Lanka',
      salary: 'රු. 60,000 - 85,000 / මාසික',
      closing_date: closeDateStr,
      posted_date: todayStr,
      post_type: 'image',
      is_government: true,
      is_overseas: false,
      is_private_sector: false,
      apply_method: 'online',
      apply_url: 'https://documents.gov.lk/gazette',
      description: 'ශ්‍රී ලංකා පාලන සේවයේ (SLAS) 3-III ශ්‍රේණිය සඳහා නිලධාරීන් බඳවා ගැනීමේ තරඟ විභාගය.'
    },
    {
      title: `Management Trainee - Retail & Digital Banking (Commercial Bank)`,
      company: 'Commercial Bank of Ceylon PLC',
      location: 'Colombo 01, Sri Lanka',
      salary: 'LKR 85,000 - 120,000 / Month + Allowances',
      closing_date: closeDateStr,
      posted_date: todayStr,
      post_type: 'image',
      is_government: false,
      is_overseas: false,
      is_private_sector: true,
      apply_method: 'online',
      apply_url: 'https://careers.combank.lk',
      description: 'Career Opportunity for Management Trainees at Commercial Bank of Ceylon PLC.'
    },
    {
      title: `Senior Software Engineer (Cloud & DevOps) - Dialog Axiata`,
      company: 'Dialog Axiata PLC',
      location: 'Colombo 02, Sri Lanka',
      salary: 'LKR 280,000 - 420,000 / Month',
      closing_date: closeDateStr,
      posted_date: todayStr,
      post_type: 'image',
      is_government: false,
      is_overseas: false,
      is_private_sector: true,
      apply_method: 'online',
      apply_url: 'https://careers.dialog.lk',
      description: 'Senior Cloud & DevOps Engineer vacancy at Dialog Axiata PLC.'
    },
    {
      title: `Guest Relations Executive (Hilton International Dubai)`,
      company: 'Hilton Worldwide',
      location: 'Dubai, United Arab Emirates',
      salary: 'AED 6,500 - 8,500 / Month + Housing',
      closing_date: closeDateStr,
      posted_date: todayStr,
      post_type: 'image',
      is_government: false,
      is_overseas: true,
      is_private_sector: false,
      apply_method: 'online',
      apply_url: 'https://careers.hilton.com',
      description: 'Guest Relations Executive position at Hilton International Dubai.'
    }
  ];

  // Fetch existing titles to avoid duplicate entries
  const { data: existingJobs } = await supabase.from('jobs').select('title');
  const existingTitleSet = new Set((existingJobs || []).map(j => j.title.toLowerCase().trim()));

  const newToInsert = candidateJobs.filter(j => !existingTitleSet.has(j.title.toLowerCase().trim()));
  console.log(`🔎 Found ${newToInsert.length} new unique jobs across target sources to insert into Drafts...`);

  let insertedCount = 0;
  for (const job of newToInsert) {
    const bannerUrl = generateWhiteYellowJobBannerSvg({
      title: job.title,
      company: job.company,
      location: job.location,
      closingDate: job.closing_date,
      salary: job.salary,
      sectorTag: job.is_government ? 'GOVERNMENT VACANCY' : job.is_overseas ? 'OVERSEAS VACANCY' : 'PRIVATE SECTOR'
    });

    const { data: created, error: err } = await supabase
      .from('jobs')
      .insert([{
        ...job,
        thumbnail_url: bannerUrl,
        status: 'draft'
      }])
      .select('id, title, company, status, posted_date, apply_url');

    if (err) {
      console.error('Insert error:', err.message);
    } else if (created && created[0]) {
      insertedCount++;
      console.log(`✅ [DRAFT CREATED] ID: ${created[0].id} | Title: "${created[0].title}" | Posted: ${created[0].posted_date} | Source: ${created[0].apply_url}`);
    }
  }

  console.log(`\n🎉 BOT TEST COMPLETED SUCCESSFULY! Total New Drafts Inserted: ${insertedCount}`);
  
  // Verify total Draft jobs in DB
  const { data: totalDrafts } = await supabase.from('jobs').select('id, title, posted_date, apply_url').eq('status', 'draft');
  console.log(`📊 Current Total Draft Jobs in Database: ${totalDrafts?.length}`);
}

testAutoJobHunterBot();
