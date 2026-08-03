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
    if (job.thumbnail_url) {
      const fbPhotoEndpoint = `https://graph.facebook.com/v19.0/${pageId}/photos`;
      const response = await fetch(fbPhotoEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: job.thumbnail_url,
          caption: caption,
          access_token: pageAccessToken,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to post photo to Facebook');
      }

      return { success: true, postId: data.id || data.post_id };
    } else {
      // Fallback to text link post if no thumbnail is available
      const fbFeedEndpoint = `https://graph.facebook.com/v19.0/${pageId}/feed`;
      const response = await fetch(fbFeedEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: caption,
          link: jobUrl,
          access_token: pageAccessToken,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to post text to Facebook');
      }

      return { success: true, postId: data.id };
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown Facebook posting error';
    console.error('[Facebook Auto-Poster Error]:', errorMsg);
    return { success: false, error: errorMsg };
  }
}
