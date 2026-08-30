const SUPABASE_URL = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

export default async function handler(req, res) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/jobs?status=eq.published&select=id,updated_at,created_at,closing_date&order=created_at.desc&limit=1000`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    let jobs = [];
    if (response.ok) {
      jobs = await response.json();
    }

    const staticRoutes = [
      { url: 'https://jobnews.lk/', priority: '1.0', changefreq: 'hourly' },
      { url: 'https://jobnews.lk/government', priority: '0.9', changefreq: 'hourly' },
      { url: 'https://jobnews.lk/private-sector', priority: '0.9', changefreq: 'hourly' },
      { url: 'https://jobnews.lk/overseas', priority: '0.9', changefreq: 'hourly' },
      { url: 'https://jobnews.lk/saved', priority: '0.5', changefreq: 'weekly' }
    ];

    const todayIso = new Date().toISOString().split('T')[0];

    const staticUrlsXml = staticRoutes
      .map(
        (r) => `  <url>
    <loc>${r.url}</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
      )
      .join('\n');

    const jobUrlsXml = (jobs || [])
      .map((job) => {
        const lastmod = job.updated_at
          ? new Date(job.updated_at).toISOString().split('T')[0]
          : (job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : todayIso);
        return `  <url>
    <loc>https://jobnews.lk/jobs/${job.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join('\n');

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrlsXml}
${jobUrlsXml}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400');
    return res.status(200).send(sitemapXml);
  } catch (err) {
    console.error('Dynamic Sitemap Error:', err);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jobnews.lk/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`);
  }
}
