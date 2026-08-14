export default async function handler(req, res) {
  // Extract id from query params or URL
  const { id } = req.query;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://uaznuhmsntkuxoxzivys.supabase.co";
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhem51aG1zbnRrdXhveHppdnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDgwMjIsImV4cCI6MjA1Njg4NDAyMn0.tL42V5s5U10S-aA3vE3i-M-X7y_O6c5i1Q9m9R6X-9k";

  let title = "JobNews.lk - Sri Lanka's Latest Job Vacancies";
  let description = "Find the latest Government, Private, and Overseas job vacancies in Sri Lanka. JobNews.lk is your trusted portal for official job announcements.";
  let imageUrl = "https://jobnews.lk/og-banner.png";
  let targetUrl = "https://jobnews.lk";

  if (id) {
    targetUrl = `https://jobnews.lk/jobs/${id}`;
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/jobs?id=eq.${id}&select=*,job_images(url),job_pdfs(url)`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const job = data[0];
        const companyStr = job.company ? ` at ${job.company}` : '';
        title = `🔍 Job Notice: ${job.title}${companyStr}`;
        
        description = job.description 
          ? job.description.replace(/\s+/g, ' ').trim().substring(0, 160) + '...'
          : `Official vacancy announcement for ${job.title}. Location: ${job.location || 'Sri Lanka'}. Apply now via JobNews.lk.`;

        // Check for primary image, thumbnail, or default
        if (job.job_images && job.job_images.length > 0 && job.job_images[0].url) {
          imageUrl = job.job_images[0].url;
        } else if (job.thumbnail_url) {
          imageUrl = job.thumbnail_url;
        }
      }
    } catch (err) {
      console.error('OG API error:', err);
    }
  }

  // Ensure absolute HTTPS URL for OpenGraph images
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = `https://jobnews.lk${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const ogCanonicalUrl = id ? `https://www.jobnews.lk/og/${id}` : "https://www.jobnews.lk";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | JobNews.lk</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Facebook / WhatsApp Meta Tags -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="JobNews.lk" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${escapeHtml(ogCanonicalUrl)}" />

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />

  <!-- Client side redirect for regular browser visitors -->
  <script>
    if (!navigator.userAgent.match(/(facebookexternalhit|WhatsApp|Twitterbot|TelegramBot|LinkedInBot|Slackbot|Discordbot|bot|crawler)/i)) {
      window.location.replace("${targetUrl}");
    }
  </script>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; text-align: center;">
  <h2 style="margin-bottom: 1rem;">${escapeHtml(title)}</h2>
  <img src="${escapeHtml(imageUrl)}" style="max-width: 100%; max-height: 450px; border-radius: 12px; margin: 1rem 0; box-shadow: 0 10px 25px rgba(0,0,0,0.5);" />
  <p style="margin-top: 1rem; color: #94a3b8;">Redirecting to JobNews.lk...</p>
</body>
</html>`;

  return res.status(200).send(html);
}
