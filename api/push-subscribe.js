// Vercel Serverless Function: Web Push Subscription Manager for JobNews.lk
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle Registration / Upsert of Push Subscription
  if (req.method === 'POST') {
    try {
      const { device_id, endpoint, p256dh, auth, platform, user_agent } = req.body || {};

      if (!endpoint || !p256dh || !auth) {
        return res.status(400).json({ error: 'endpoint, p256dh and auth keys are required' });
      }

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            device_id: device_id || 'anonymous_device',
            endpoint,
            p256dh,
            auth,
            platform: platform || 'android',
            user_agent: user_agent || '',
            updated_at: now,
          },
          { onConflict: 'endpoint' }
        );

      if (error) {
        return res.status(200).json({
          success: true,
          status: 'acknowledged_with_db_note',
          note: error.message,
        });
      }

      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(200).json({ success: true, error: err.message });
    }
  }

  // Handle Fetching of Push Subscriber Counts for Admin Dashboard
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('id, platform, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        return res.status(200).json({
          total: 0,
          android: 0,
          ios: 0,
          desktop: 0,
          note: error.message,
        });
      }

      const subscribers = data || [];
      const stats = {
        total: subscribers.length,
        android: subscribers.filter((s) => s.platform === 'android').length,
        ios: subscribers.filter((s) => s.platform === 'ios').length,
        desktop: subscribers.filter((s) => s.platform !== 'android' && s.platform !== 'ios').length,
      };

      return res.status(200).json(stats);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
