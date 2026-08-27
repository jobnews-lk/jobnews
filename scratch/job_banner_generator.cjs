const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generates an SVG/PNG Image Job Post with a White + Yellow Mix Gradient Background.
 * Returns an SVG Data URI or uploads directly to Supabase Storage.
 */
function generateWhiteYellowJobBannerSvg({ title, company, location, closingDate, salary, sectorTag }) {
  // Clean inputs for XML safety
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

    <!-- Soft Drop Shadow -->
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="630" fill="url(#whiteYellowGrad)"/>

  <!-- Decorative Yellow Glow Orbs -->
  <circle cx="1100" cy="80" r="220" fill="#FEF08A" opacity="0.4" filter="blur(40px)"/>
  <circle cx="100" cy="550" r="180" fill="#FDE047" opacity="0.3" filter="blur(30px)"/>

  <!-- Main Content Box (White Card with Yellow/Gold Border) -->
  <rect x="60" y="50" width="1080" height="530" rx="24" fill="#FFFFFF" stroke="#FACC15" stroke-width="4" filter="url(#shadow)"/>

  <!-- Top Header Banner (Gold Gradient) -->
  <rect x="60" y="50" width="1080" height="90" rx="24" fill="url(#goldHeaderGrad)"/>
  <!-- Top Banner Bottom Square Mask Fix -->
  <rect x="60" y="110" width="1080" height="30" fill="url(#goldHeaderGrad)"/>

  <!-- Header Title & Branding -->
  <text x="100" y="105" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="bold" fill="#FFFFFF" letter-spacing="1">
    🇱🇰 JOBNEWS.LK | OFFICIAL VACANCY ANNOUNCEMENT
  </text>

  <!-- Sector Tag Badge -->
  <rect x="880" y="75" width="220" height="42" rx="21" fill="#FFFFFF" opacity="0.95"/>
  <text x="990" y="102" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold" fill="#854D0E" text-anchor="middle">
    ${safeSector}
  </text>

  <!-- Job Title -->
  <text x="100" y="225" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="bold" fill="#0F172A">
    ${safeTitle.length > 45 ? safeTitle.substring(0, 42) + '...' : safeTitle}
  </text>

  <!-- Company / Organization Name -->
  <text x="100" y="285" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="600" fill="#475569">
    🏢 ${safeCompany.length > 55 ? safeCompany.substring(0, 52) + '...' : safeCompany}
  </text>

  <!-- Metadata Badges Container -->
  <!-- Location Badge -->
  <rect x="100" y="340" width="440" height="60" rx="14" fill="#FEF9C3" stroke="#FDE047" stroke-width="2"/>
  <text x="120" y="378" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#713F12">
    📍 ${safeLocation}
  </text>

  <!-- Salary Badge -->
  <rect x="560" y="340" width="540" height="60" rx="14" fill="#FEF9C3" stroke="#FDE047" stroke-width="2"/>
  <text x="580" y="378" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#713F12">
    💰 ${safeSalary}
  </text>

  <!-- Closing Date Badge -->
  <rect x="100" y="425" width="1000" height="65" rx="14" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
  <text x="130" y="466" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#B45309">
    ⏳ Closing Date: ${safeClosing} | Apply Online at JobNews.lk
  </text>

  <!-- Footer Watermark & Verification Badge -->
  <text x="100" y="540" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold" fill="#94A3B8">
    ✓ Verified Official Job Notice — JobNews.lk Sri Lanka
  </text>
  <text x="1080" y="540" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" fill="#CA8A04" text-anchor="end">
    https://jobnews.lk
  </text>
</svg>
  `;

  return svg;
}

module.exports = { generateWhiteYellowJobBannerSvg };

// CLI test
if (require.main === module) {
  const sampleSvg = generateWhiteYellowJobBannerSvg({
    title: 'Senior Hotel Operations Manager',
    company: 'Anantara Resorts & Hotels (Dubai / Qatar)',
    location: 'Dubai, UAE (Overseas)',
    closingDate: '2026-09-25',
    salary: '$2,500 - $3,500 / Month',
    sectorTag: 'OVERSEAS JOB'
  });
  
  const outputPath = path.join(__dirname, 'sample_white_yellow_banner.svg');
  fs.writeFileSync(outputPath, sampleSvg);
  console.log(`✅ Sample White + Yellow SVG Banner generated at: ${outputPath}`);
}
