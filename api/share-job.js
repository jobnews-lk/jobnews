const SUPABASE_URL = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

export default async function handler(req, res) {
  // Proxy image to strip Supabase x-robots-tag: none header for WhatsApp & Facebook crawlers
  if (req.query.img) {
    try {
      const imgUrl = req.query.img;
      const imgRes = await fetch(imgUrl);
      if (!imgRes.ok) throw new Error('Failed to fetch image');
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).send(buffer);
    } catch (err) {
      return res.redirect(302, req.query.img);
    }
  }

  const { id } = req.query;

  if (!id) {
    return res.redirect(302, '/');
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/jobs?id=eq.${id}&select=*,job_images(*)`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      return res.redirect(302, '/');
    }

    const jobs = await response.json();
    const job = jobs && jobs[0];

    if (!job) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(404).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vacancy Closed or Expired - JobNews.lk</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, follow" />
  </head>
  <body style="font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 60px 20px; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 80vh;">
    <div style="max-width: 520px; background: #1e293b; padding: 36px 24px; border-radius: 24px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
      <div style="font-size: 40px; margin-bottom: 16px;">📌</div>
      <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 12px; color: #ffffff; line-height: 1.4;">මෙම රැකියාවේ අයදුම්පත් භාරගැනීම අවසන් වී ඇත</h1>
      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 28px;">මෙම රැකියා නිවේදනයේ අයදුම්පත් භාරගන්නා අවසන් දිනය පසුවී ඇති බැවින් හෝ ආයතනය විසින් ඉවත් කර ඇති බැවින් මෙම නිවේදනය දැනට සක්‍රීය නැත.</p>
      <a href="https://jobnews.lk/jobs" style="display: inline-block; padding: 14px 28px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 16px; font-weight: 700; font-size: 15px;">🚀 නවතම සක්‍රීය රැකියා බලන්න / View Active Jobs</a>
    </div>
  </body>
</html>`);
    }

    const cleanTitle = `${job.title} - ${job.company || 'JobNews.lk'}`;
    const rawDesc = job.description || `Official vacancy announcement for ${job.title} at ${job.company || 'JobNews.lk'}. Apply now via JobNews.lk.`;
    const cleanDesc = rawDesc.substring(0, 250).replace(/[\r\n]+/g, ' ').trim();

    let imageUrl = 'https://jobnews.lk/og-banner.png';

    // Pick best image for social card preview
    if (job.job_images && job.job_images.length > 0 && job.job_images[0].url && job.job_images[0].url.startsWith('http')) {
      imageUrl = job.job_images[0].url;
    } else if (job.thumbnail_url && job.thumbnail_url.startsWith('http')) {
      imageUrl = job.thumbnail_url;
    } else if (job.official_pdf_url && (job.official_pdf_url.endsWith('.png') || job.official_pdf_url.endsWith('.jpg') || job.official_pdf_url.endsWith('.jpeg'))) {
      imageUrl = job.official_pdf_url;
    }

    const siteUrl = `https://jobnews.lk/jobs/${job.id}`;
    
    // Proxy image URL to bypass Supabase x-robots-tag header blocking WhatsApp preview cards
    const proxyImageUrl = imageUrl.startsWith('http')
      ? `https://jobnews.lk/api/share-job?img=${encodeURIComponent(imageUrl)}`
      : imageUrl;

    const jobSchema = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      "title": job.title,
      "description": rawDesc,
      "datePosted": job.posted_date || job.created_at,
      "validThrough": job.closing_date ? new Date(job.closing_date).toISOString() : undefined,
      "employmentType": "FULL_TIME",
      "directApply": true,
      "url": siteUrl,
      "image": proxyImageUrl,
      "identifier": {
        "@type": "PropertyValue",
        "name": job.company || "JobNews.lk",
        "value": job.id
      },
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company || "Government / Private Organization",
        "sameAs": "https://jobnews.lk",
        "logo": proxyImageUrl
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location || "Sri Lanka",
          "addressCountry": job.is_overseas ? "OVERSEAS" : "LK"
        }
      }
    };

    if (job.salary && String(job.salary).trim()) {
      jobSchema.baseSalary = {
        "@type": "MonetaryAmount",
        "currency": "LKR",
        "value": {
          "@type": "QuantitativeValue",
          "value": String(job.salary).trim(),
          "unitText": "MONTH"
        }
      };
    }

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(cleanTitle)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(cleanDesc)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${siteUrl}" />
    
    <!-- Open Graph / WhatsApp / Facebook / LinkedIn -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="JobNews.lk" />
    <meta property="og:title" content="${escapeHtml(cleanTitle)}" />
    <meta property="og:description" content="${escapeHtml(cleanDesc)}" />
    <meta property="og:image" content="${escapeHtml(proxyImageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(proxyImageUrl)}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${siteUrl}" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(cleanTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(cleanDesc)}" />
    <meta name="twitter:image" content="${escapeHtml(proxyImageUrl)}" />

    <!-- Google Jobs Structured Data -->
    <script type="application/ld+json">
      ${JSON.stringify(jobSchema)}
    </script>

    <meta http-equiv="refresh" content="0;url=${siteUrl}" />
  </head>
  <body>
    <p>Redirecting to <a href="${siteUrl}">${escapeHtml(cleanTitle)}</a>...</p>
    <script>
      window.location.href = "${siteUrl}";
    </script>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(html);
  } catch (err) {
    console.error('OG Share Handler Error:', err);
    return res.redirect(302, '/');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
