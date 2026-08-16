import type { Job } from './supabase';

export interface WhatsAppPostResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Automatically broadcasts a published job to the connected WhatsApp Channel.
 * Uses VITE_WHATSAPP_CHANNEL_API_URL and VITE_WHATSAPP_API_TOKEN from environment variables.
 */
export async function postJobToWhatsApp(job: Job): Promise<WhatsAppPostResult> {
  const channelApiUrl = import.meta.env.VITE_WHATSAPP_CHANNEL_API_URL;
  const apiToken = import.meta.env.VITE_WHATSAPP_API_TOKEN;

  if (!channelApiUrl) {
    console.warn('[WhatsApp Auto-Poster] Missing WhatsApp Channel API URL in environment variables.');
    return {
      success: false,
      error: 'WhatsApp Channel API URL not configured in environment settings.',
    };
  }

  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://jobnews.lk';
  const jobUrl = `${siteOrigin}/jobs/${job.id}`;

  // Formatted WhatsApp Markdown Message
  let message = `*📢 NEW JOB VACANCY ALERT!* 🇱🇰\n\n`;
  message += `*📌 Position:* ${job.title}\n`;
  message += `*🏢 Company:* ${job.company}\n`;

  if (job.location) {
    message += `*📍 Location:* ${job.location}\n`;
  }

  if (job.salary) {
    message += `*💰 Salary:* ${job.salary}\n`;
  }

  if (job.closing_date) {
    message += `*⏳ Closing Date:* ${job.closing_date}\n`;
  }

  message += `\n*🔗 Apply Online & Full Details:*\n${jobUrl}\n\n`;
  message += `_📢 Follow JobNews.lk WhatsApp Channel for daily vacancy updates!_`;

  try {
    const isMetaCloudApi = channelApiUrl.includes('graph.facebook.com');

    const payload = isMetaCloudApi
      ? {
          messaging_product: 'whatsapp',
          to: '94703519858',
          type: 'text',
          text: { body: message },
        }
      : {
          message: message,
          imageUrl: job.thumbnail_url || undefined,
          jobId: job.id,
        };

    const response = await fetch(channelApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || data.error || 'Failed to post message to WhatsApp');
    }

    return { success: true, messageId: data.id || data.messages?.[0]?.id || data.messageId };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown WhatsApp posting error';
    console.error('[WhatsApp Auto-Poster Error]:', errorMsg);
    return { success: false, error: errorMsg };
  }
}
