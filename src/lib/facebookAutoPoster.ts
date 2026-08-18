import type { Job } from './supabase';

export interface FacebookPostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Automatically posts a published job to the connected Facebook Page using Facebook Graph API.
 * Uses VITE_FACEBOOK_PAGE_ID and VITE_FACEBOOK_PAGE_ACCESS_TOKEN from environment variables.
 */
export async function postJobToFacebook(job: Job): Promise<FacebookPostResult> {
  const pageId = import.meta.env.VITE_FACEBOOK_PAGE_ID;
  const pageAccessToken = import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !pageAccessToken) {
    console.warn('[Facebook Auto-Poster] Missing Facebook Page ID or Access Token in environment variables.');
    return {
      success: false,
      error: 'Facebook Page credentials not configured in environment settings.',
    };
  }

  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://jobnews.lk';
  const jobUrl = `${siteOrigin}/jobs/${job.id}`;

  // Build structured, engaging Facebook caption
  let caption = `🚨 NEW VACANCY ALERT | JobNews.lk 🚨\n\n`;
  caption += `📌 Job Title: ${job.title}\n`;
  caption += `🏢 Company: ${job.company}\n`;
  
  if (job.location) {
    caption += `📍 Location: ${job.location}\n`;
  }
  
  if (job.salary) {
    caption += `💰 Salary: ${job.salary}\n`;
  }
  
  if (job.closing_date) {
    caption += `⏳ Closing Date: ${job.closing_date}\n`;
  }

  caption += `\n🔗 Apply Online & Full Details:\n${jobUrl}\n\n`;
  caption += `#SriLankaJobs #JobVacancies #JobNewsLK #${job.company.replace(/\s+/g, '')}`;

  try {
    // If job has a thumbnail image, post as a photo with caption
    // Official Meta Graph API v19.0 Page Endpoints
    const photoEndpoint = `https://graph.facebook.com/v19.0/${pageId}/photos`;
    const feedEndpoint = `https://graph.facebook.com/v19.0/${pageId}/feed`;

    if (job.thumbnail_url) {
      let response = await fetch(photoEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: job.thumbnail_url,
          caption: caption,
          access_token: pageAccessToken,
        }),
      });

      let data = await response.json();

      if (!response.ok || data.error) {
        // Fallback to page feed link post
        const feedRes = await fetch(feedEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: caption,
            link: jobUrl,
            access_token: pageAccessToken,
          }),
        });
        const feedData = await feedRes.json();
        if (feedRes.ok && !feedData.error) {
          return { success: true, postId: feedData.id };
        }
        throw new Error(data.error?.message || feedData.error?.message || 'Failed to post to Facebook Page');
      }

      return { success: true, postId: data.id || data.post_id };
    } else {
      let response = await fetch(feedEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: caption,
          link: jobUrl,
          access_token: pageAccessToken,
        }),
      });

      let data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to post text to Facebook Page');
      }

      return { success: true, postId: data.id };
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown Facebook posting error';
    console.error('[Facebook Auto-Poster Error]:', errorMsg);
    return { success: false, error: errorMsg };
  }
}
