// Vercel Serverless Function: Secure Web Push Dispatcher for JobNews.lk
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

const VAPID_PUBLIC_KEY =
  process.env.VITE_VAPID_PUBLIC_KEY ||
  'BAyyKpVH0oWS87kTyUoR3ehwLmyb_X3_wvEoAJbrEUn2ezfb9pH8c-DlN8qq94UxqinWZnKmiAyvRR9ZUAVFms0';

const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  'K_IyrjZLjlCZO9TeNvAFvynfU88yJLfC1jhGUAAhn-M';

const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@jobnews.lk';

// Configure Web Push with our cryptographic VAPID keypair
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.error('[WebPush] Error configuring VAPID details:', e);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, body, url, unreadCount } = req.body || {};

    if (!title) {
      return res.status(400).json({ error: 'Notification title is required' });
    }

    // 1. Fetch active push subscriptions from Supabase
    const { data: subscriptions, error: dbError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth');

    if (dbError) {
      console.error('[WebPush] Database fetch error:', dbError);
      return res.status(500).json({ error: 'Failed to retrieve subscribers: ' + dbError.message });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        sent: 0,
        message: 'No active push subscribers registered yet.',
      });
    }

    // 2. Prepare standardized push payload
    const payload = JSON.stringify({
      title: title.trim(),
      body: (body || 'අලුත්ම රැකියා අවස්ථාවක් පළ විය. දැන්ම පරීක්ෂා කරන්න.').trim(),
      url: url || '/jobs',
      unreadCount: Number(unreadCount) || 1,
      icon: '/pwa-icon-192.png',
      badge: '/favicon.svg',
    });

    let sent = 0;
    let failed = 0;
    const expiredEndpoints = [];

    // 3. Broadcast to all active subscribers
    await Promise.all(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, payload, {
            TTL: 86400, // 24 hours delivery window
            urgency: 'high',
          });
          sent++;
        } catch (err) {
          failed++;
          // HTTP 404 or 410 indicates the user unsubscribed or revoked permission
          if (err.statusCode === 404 || err.statusCode === 410) {
            expiredEndpoints.push(sub.endpoint);
          }
        }
      })
    );

    // 4. Clean up any expired/revoked endpoints from Supabase
    if (expiredEndpoints.length > 0) {
      try {
        await supabase
          .from('push_subscriptions')
          .delete()
          .in('endpoint', expiredEndpoints);
      } catch (cleanupErr) {
        console.warn('[WebPush] Expired cleanup notice:', cleanupErr);
      }
    }

    return res.status(200).json({
      success: true,
      sent,
      failed,
      total: subscriptions.length,
      pruned: expiredEndpoints.length,
    });
  } catch (err) {
    console.error('[WebPush] Broadcast fatal error:', err);
    return res.status(500).json({ error: err.message || 'Internal push broadcast error' });
  }
}
