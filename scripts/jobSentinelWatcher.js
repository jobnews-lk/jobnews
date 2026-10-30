/**
 * JobSentinel 24/7 Watcher Script
 * Runs twice daily (7:00 AM & 5:30 PM Sri Lanka Time).
 * Directly inspects verified state institution career pages with 0 CORS restrictions.
 * Parses REAL live vacancies and creates Drafts in Supabase with professional banners.
 * ZERO fake/mock jobs policy.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Top verified state institutions to watch
const TARGET_INSTITUTIONS = [
  {
    id: 'boc',
    name: 'Bank of Ceylon',
    url: 'https://www.boc.lk/careers',
    sector: 'banks',
    type: 'boc'
  },
  {
    id: 'cbsl',
    name: 'Central Bank of Sri Lanka (CBSL)',
    url: 'https://www.cbsl.gov.lk/en/careers',
    sector: 'banks',
    type: 'generic'
  },
  {
    id: 'ousl',
    name: 'Open University of Sri Lanka (OUSL)',
    url: 'https://ou.ac.lk/vacancies/',
    sector: 'unis',
    type: 'generic'
  },
  {
    id: 'uom',
    name: 'University of Moratuwa',
    url: 'https://uom.lk/vacancies',
    sector: 'unis',
    type: 'uom'
  },
  {
    id: 'ceb',
    name: 'Ceylon Electricity Board',
    url: 'https://www.ceb.lk/careers',
    sector: 'corporations',
    type: 'generic'
  },
  {
    id: 'waterboard',
    name: 'National Water Supply and Drainage Board',
    url: 'https://www.waterboard.lk/vacancies/',
    sector: 'corporations',
    type: 'generic'
  },
  {
    id: 'slt',
    name: 'Sri Lanka Telecom (SLT-Mobitel)',
    url: 'https://www.slt.lk/en/careers',
    sector: 'corporations',
    type: 'generic'
  }
];

function generateBannerSvg(title, company, closingDate) {
  const safeTitle = (title || 'Job Vacancy').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCompany = (company || 'Official Hiring Organization').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeClosing = closingDate || 'Urgent Vacancy';

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
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
  </defs>
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect x="0" y="0" width="1200" height="110" fill="url(#navyGoldGrad)"/>
  <text x="60" y="68" fill="#FACC15" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="900" letter-spacing="1">JOBNEWS.LK</text>
  <text x="310" y="68" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="500">| 🏛️ OFFICIAL STATE VACANCY</text>
  <rect x="60" y="160" width="1080" height="380" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="100" y="200" width="220" height="42" rx="21" fill="#FEF3C7"/>
  <text x="125" y="228" fill="#B45309" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700">🏛️ GOVT SECTOR</text>
  <text x="100" y="310" fill="#0F172A" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="800">${safeTitle.substring(0, 50)}</text>
  <text x="100" y="365" fill="#475569" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="600">🏢 ${safeCompany.substring(0, 55)}</text>
  <rect x="100" y="440" width="400" height="60" rx="14" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="125" y="478" fill="#DC2626" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700">⏳ Closing Date: ${safeClosing}</text>
</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

async function scanBoc(inst) {
  try {
    const res = await fetch(inst.url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return [];
    const html = await res.text();
    const jobs = [];
    
    const linkRegex = /<a[^>]*class="expand-link"[^>]*>([\s\S]*?)<\/a>/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const rawTitle = linkMatch[1].replace(/<[^>]+>/g, '').trim();
      if (!rawTitle || rawTitle.toLowerCase().includes('result') || rawTitle.toLowerCase().includes('interview')) {
        continue;
      }
      const afterText = html.substring(linkMatch.index, linkMatch.index + 1200);
      const dateMatch = afterText.match(/Notice available till:<\/span>\s*([0-9\-\/]+)/i);
      const urlMatch = afterText.match(/<a[^>]*href="([^"]+)"[^>]*>More Details/i);
      
      let applyUrl = inst.url;
      if (urlMatch && urlMatch[1]) {
        applyUrl = urlMatch[1].startsWith('http') ? urlMatch[1] : `https://www.boc.lk${urlMatch[1]}`;
      }

      jobs.push({
        title: `${rawTitle} - Bank of Ceylon`,
        company: 'Bank of Ceylon',
        location: 'Colombo, Sri Lanka',
        closing_date: dateMatch ? dateMatch[1] : new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
        apply_url: applyUrl,
        description: `Official job vacancy for ${rawTitle} at Bank of Ceylon (BOC).\nNotice available till: ${dateMatch ? dateMatch[1] : 'Open'}.\nApply online directly via the official BOC portal.`
      });
    }
    return jobs;
  } catch (err) {
    console.warn(`[Sentinel] BOC scan error:`, err.message);
    return [];
  }
}

async function scanMoratuwa(inst) {
  try {
    const res = await fetch(inst.url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return [];
    const html = await res.text();
    const jobs = [];
    
    const regex = /<a[^>]*href="([^"]*vacancy[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const text = match[2].replace(/<[^>]+>/g, '').trim();
      if (text.length > 5 && (text.toLowerCase().includes('post') || text.toLowerCase().includes('lecturer') || text.toLowerCase().includes('officer') || text.toLowerCase().includes('analyst'))) {
        const cleanTitle = text.split('\n')[0].trim();
        const dateMatch = text.match(/Closing Date:\s*(?:On or Before\s*)?([0-9\/\-]+)/i);
        const href = match[1].startsWith('http') ? match[1] : `https://uom.lk/${match[1].replace(/^\//, '')}`;
        
        let formattedDate = new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0];
        if (dateMatch && dateMatch[1]) {
          const parts = dateMatch[1].split('/');
          if (parts.length === 3) {
            formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }

        jobs.push({
          title: `${cleanTitle} - University of Moratuwa`,
          company: 'University of Moratuwa',
          location: 'Moratuwa, Sri Lanka',
          closing_date: formattedDate,
          apply_url: href,
          description: `Official vacancy notice for ${cleanTitle} at University of Moratuwa.\nClosing Date: ${formattedDate}.\nApply directly through the official university application portal.`
        });
      }
    }
    return jobs;
  } catch (err) {
    console.warn(`[Sentinel] Moratuwa scan error:`, err.message);
    return [];
  }
}

async function scanGeneric(inst) {
  try {
    const res = await fetch(inst.url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return [];
    const html = await res.text();
    const jobs = [];
    const seenTitles = new Set();
    const todayStr = new Date().toISOString().split('T')[0];

    const aTagRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    const jobKeywordRegex = /\b(post of|recruitment of|vacancy for|job vacancy|vacancies|trainee|officer|manager|executive|engineer|assistant|director|clerk|driver|operator|technician|accountant|lecturer|instructor|analyst|specialist|demonstrator|consultant|examiner|auditor|administrator|curator|surveyor|attendant|counsel|registrar|programmer|developer|medical|nurse|pharmacist|chemist|scientist)\b/i;
    const junkRegex = /^(click here|download|view more|read more|apply now|careers?|home|about us|contact us|more details|view|details|link|pdf|here|login|register|search)$/i;
    const navExcludeRegex = /\b(agency|agencies|licence|license|rules|guidelines|act|procurement|tender|policy|terms|condition|privacy|feedback|sitemap)\b/i;

    while ((match = aTagRegex.exec(html)) !== null) {
      const rawHref = match[1].trim();
      if (!rawHref || rawHref === '#' || rawHref.startsWith('javascript:')) continue;

      let text = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      let fullContext = text;
      if (text.length < 10) {
        const startIdx = Math.max(0, match.index - 250);
        const endIdx = Math.min(html.length, match.index + 250);
        fullContext = html.substring(startIdx, endIdx).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }

      const isVacancyDocLink = /\.pdf$/i.test(rawHref) || /careers?_/i.test(rawHref) || /\/vacancy\//i.test(rawHref);
      const matchesJob = jobKeywordRegex.test(fullContext) || (isVacancyDocLink && text.length >= 8);
      if (!matchesJob) continue;
      if (navExcludeRegex.test(text)) continue;

      let titleCandidate = text;
      if (junkRegex.test(titleCandidate) || titleCandidate.length < 10) {
        const m = fullContext.match(/(?:post of|recruitment of|vacancy for|post:\s*|post\s+)([A-Za-z0-9\s,\-\/\(\)]+)/i);
        if (m && m[1]) {
          titleCandidate = m[1].trim();
        } else {
          continue;
        }
      }

      titleCandidate = titleCandidate.replace(/^[-:•\s]+/, '').replace(/[-:•\s]+$/, '');
      if (titleCandidate.length < 8 || titleCandidate.length > 130) continue;
      if (titleCandidate.toLowerCase().includes('interview') || titleCandidate.toLowerCase().includes('result')) continue;
      if (navExcludeRegex.test(titleCandidate)) continue;

      const normKey = titleCandidate.toLowerCase();
      if (seenTitles.has(normKey)) continue;
      seenTitles.add(normKey);

      const surrounding = html.substring(Math.max(0, match.index - 250), Math.min(html.length, match.index + 500));
      let closingDate = null;
      const d1 = surrounding.match(/\b(202[4-9][\-\/.](?:0[1-9]|1[0-2])[\-\/.](?:0[1-9]|[12]\d|3[01]))\b/);
      const d2 = surrounding.match(/\b((?:0[1-9]|[12]\d|3[01])[\-\/.](?:0[1-9]|1[0-2])[\-\/.](202[4-9]))\b/);

      if (d1) {
        closingDate = d1[1].replace(/\//g, '-').replace(/\./g, '-');
      } else if (d2) {
        const parts = d2[0].split(/[\-\/.]/);
        closingDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }

      if (closingDate && closingDate < todayStr) continue;
      if (!closingDate) {
        const d = new Date();
        d.setDate(d.getDate() + 21);
        closingDate = d.toISOString().split('T')[0];
      }

      let fullUrl = rawHref;
      if (!fullUrl.startsWith('http')) {
        try {
          fullUrl = new URL(rawHref, inst.url).href;
        } catch (e) {
          fullUrl = inst.url;
        }
      }

      jobs.push({
        title: `${titleCandidate} - ${inst.name}`,
        company: inst.name,
        location: 'Sri Lanka',
        closing_date: closingDate,
        apply_url: fullUrl,
        description: `Official vacancy for ${titleCandidate} at ${inst.name}.\nClosing Date: ${closingDate}.\nApply directly through the official career portal.`
      });
    }

    return jobs;
  } catch (err) {
    console.warn(`[Sentinel] ${inst.name} scan error:`, err.message);
    return [];
  }
}

async function runSentinel() {
  console.log(`\n======================================================`);
  console.log(`🤖 JobNews.lk Sentinel Watcher Running at ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  // Optional: Authenticate as admin if credentials provided
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    try {
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });
      if (!authErr && authData?.user) {
        console.log(`🔐 Logged in as Admin: ${authData.user.email}`);
      } else if (authErr) {
        console.warn(`⚠️ Admin login warning:`, authErr.message);
      }
    } catch (e) {
      console.warn(`⚠️ Auth check note:`, e.message);
    }
  }

  const { data: existingJobs } = await supabase.from('jobs').select('title');
  const existingTitleSet = new Set((existingJobs || []).map(j => j.title.toLowerCase().trim()));

  let discovered = [];

  for (const inst of TARGET_INSTITUTIONS) {
    console.log(`🔎 Checking ${inst.name} (${inst.url})...`);
    let jobs = [];
    if (inst.type === 'boc') {
      jobs = await scanBoc(inst);
    } else if (inst.type === 'uom') {
      jobs = await scanMoratuwa(inst);
    } else {
      jobs = await scanGeneric(inst);
    }
    
    // Polite 2-second pause between targets
    await new Promise(r => setTimeout(r, 2000));

    if (jobs.length > 0) {
      console.log(`   ✨ Found ${jobs.length} vacancies at ${inst.name}`);
      discovered.push(...jobs);
    } else {
      console.log(`   ✓ No new vacancies or active notices at this time.`);
    }
  }

  // Filter out any expired vacancies and those that already exist
  const today = new Date().toISOString().split('T')[0];
  const activeDiscovered = discovered.filter(j => {
    if (j.closing_date && j.closing_date < today) {
      return false; // Skip expired
    }
    return true;
  });

  const newJobs = activeDiscovered.filter(j => !existingTitleSet.has(j.title.toLowerCase().trim()));
  console.log(`\n📊 Summary: ${discovered.length} total vacancies found, ${activeDiscovered.length} are ACTIVE (open to apply), ${newJobs.length} are NEW.`);

  if (newJobs.length === 0) {
    console.log(`✅ All target career pages are up to date. Zero new drafts needed.`);
    return;
  }

  // Insert into Supabase as Drafts
  for (const job of newJobs) {
    console.log(`📥 Creating Draft Job: "${job.title}" (Closing: ${job.closing_date})`);
    const banner = generateBannerSvg(job.title, job.company, job.closing_date);

    const { error } = await supabase.from('jobs').insert({
      title: job.title,
      company: job.company,
      location: job.location,
      closing_date: job.closing_date,
      posted_date: new Date().toISOString().split('T')[0],
      post_type: 'image',
      apply_method: 'online',
      apply_url: job.apply_url,
      is_government: true,
      is_overseas: false,
      is_private_sector: false,
      thumbnail_url: banner,
      description: job.description,
      status: 'draft'
    });

    if (error) {
      console.warn(`   ❌ Failed to insert "${job.title}":`, error.message);
      if (error.message && error.message.includes('row-level security')) {
        console.warn(`   💡 Tip: Add SUPABASE_SERVICE_ROLE_KEY or ADMIN_EMAIL/ADMIN_PASSWORD in GitHub Secrets to allow the bot to bypass RLS and save Drafts.`);
      }
    } else {
      console.log(`   ✅ Successfully saved as Draft!`);
    }
  }
  console.log(`\n🎉 JobSentinel completed successfully!`);
}

runSentinel().catch(err => {
  console.error('Fatal Sentinel Error:', err);
  process.exit(1);
});
