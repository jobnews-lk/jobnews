import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

let supabaseUrl = '';
let supabaseKey = '';

for (const line of envContent.split('\n')) {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
  }
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
  }
}

async function run() {
  console.log('Fetching published jobs from Supabase...');
  const res = await fetch(`${supabaseUrl}/rest/v1/jobs?select=id,slug,posted_date,created_at&status=eq.published&order=posted_date.desc`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  const jobs = await res.json();
  console.log(`Retrieved ${jobs.length} published jobs.`);

  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: 'https://jobnews.lk/', priority: '1.0', changefreq: 'daily' },
    { loc: 'https://jobnews.lk/jobs', priority: '0.9', changefreq: 'daily' },
    { loc: 'https://jobnews.lk/government-jobs', priority: '0.9', changefreq: 'daily' },
    { loc: 'https://jobnews.lk/private-jobs', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://jobnews.lk/overseas-jobs', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://jobnews.lk/create-cv', priority: '0.7', changefreq: 'weekly' },
    { loc: 'https://jobnews.lk/about', priority: '0.6', changefreq: 'monthly' },
    { loc: 'https://jobnews.lk/contact', priority: '0.6', changefreq: 'monthly' },
    { loc: 'https://jobnews.lk/privacy-policy', priority: '0.5', changefreq: 'monthly' },
    { loc: 'https://jobnews.lk/terms', priority: '0.5', changefreq: 'monthly' }
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const page of staticPages) {
    xml += '  <url>\n';
    xml += `    <loc>${page.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  for (const job of jobs) {
    const jobSlug = job.slug || job.id;
    const jobUrl = `https://jobnews.lk/jobs/${jobSlug}`;
    const dateStr = (job.posted_date || job.created_at || today).split('T')[0];
    xml += '  <url>\n';
    xml += `    <loc>${jobUrl}</loc>\n`;
    xml += `    <lastmod>${dateStr}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';

  const publicSitemapPath = path.resolve(__dirname, '../../public/sitemap.xml');
  fs.writeFileSync(publicSitemapPath, xml, 'utf8');
  console.log(`Successfully generated ${publicSitemapPath} with ${staticPages.length + jobs.length} URLs!`);
}

run().catch(console.error);
