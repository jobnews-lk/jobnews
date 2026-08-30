const SUPABASE_URL = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

export default async function handler(req, res) {
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
      return res.redirect(302, '/');
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
      "image": imageUrl,
      "identifier": {
        "@type": "PropertyValue",
        "name": job.company || "JobNews.lk",
        "value": job.id
      },
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company || "Government / Private Organization",
        "sameAs": "https://jobnews.lk",
        "logo": imageUrl
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
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${siteUrl}" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(cleanTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(cleanDesc)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />

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
