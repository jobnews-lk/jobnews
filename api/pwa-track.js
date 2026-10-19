// Vercel Serverless Function: PWA Installation Tracker for JobNews.lk
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

  // Handle Tracking of New App Installation
  if (req.method === 'POST') {
    try {
      const { device_id, platform, user_agent, source } = req.body || {};

      if (!device_id) {
        return res.status(400).json({ error: 'device_id is required' });
      }

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('pwa_installations')
        .upsert(
          {
            device_id,
            platform: platform || 'other',
            user_agent: user_agent || '',
            installed_at: now,
            last_active: now,
          },
          { onConflict: 'device_id' }
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

  // Handle Fetching of Installation Statistics for Dashboard
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('pwa_installations')
        .select('*')
        .order('installed_at', { ascending: false });

      if (error) {
        return res.status(200).json({
          success: true,
          records: [],
          count: 0,
          dbNote: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        count: Array.isArray(data) ? data.length : 0,
        records: data || [],
      });
    } catch (err) {
      return res.status(200).json({
        success: true,
        records: [],
        count: 0,
        error: err.message,
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
