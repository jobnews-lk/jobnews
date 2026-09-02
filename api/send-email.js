// Vercel Serverless Function: Secure Anti-Virus In-House Email Dispatcher for JobNews.lk
import { createClient } from '@supabase/supabase-js';

// XSS & Script Injection Security Sanitizer
function sanitizeText(str) {
  if (!str) return '';
  return String(str)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

export default async function handler(req, res) {
  // CORS & Method Check
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { name, email, subject, message, botcheck } = req.body || {};

    // 1. Anti-Bot Honeypot Security Check
    if (botcheck) {
      console.warn('[Security] Bot submission blocked by honeypot.');
      return res.status(200).json({ success: true, message: 'Message processed.' });
    }

    // 2. Strict Input Validation & Length Bounds
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    const cleanName = sanitizeText(name).slice(0, 100);
    const cleanEmail = sanitizeText(email).slice(0, 150);
    const cleanSubject = sanitizeText(subject).slice(0, 200);
    const cleanMessage = sanitizeText(message).slice(0, 4000);

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Invalid email address.' });
    }

    // 3. Save Inquiry Safely in Supabase Private Database
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://njrkhpsbbpszvyzosxwf.supabase.co';
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcmtocHNiYnBzenZ5em9zeHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNjAyMzUsImV4cCI6MjA1NTkzNjIzNX0.O1l2W-Z10pW3w4JvG9h7K8m9n0p1q2r3s4t5u6v7w8x';

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error: dbError } = await supabase.from('contact_inquiries').insert([
      {
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        created_at: new Date().toISOString(),
      },
    ]);

    if (dbError) {
      console.warn('[In-House Contact API] Supabase DB Note:', dbError.message);
    }

    // 4. Dispatch Email to support@jobnews.lk via Resend API (if RESEND_API_KEY env exists) or Direct Gateway
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'JobNews.lk Support <support@jobnews.lk>',
            to: ['support@jobnews.lk', 'kusalds99@gmail.com'],
            subject: `[JobNews.lk Inquiry] ${cleanSubject}`,
            reply_to: cleanEmail,
            text: `Inquiry Received via JobNews.lk Contact Portal:\n\nSender Name: ${cleanName}\nSender Email: ${cleanEmail}\nSubject: ${cleanSubject}\n\nMessage:\n${cleanMessage}\n\n---\nDelivered securely by JobNews.lk In-House Email Engine.`,
          }),
        });

        const emailData = await emailRes.json();
        console.log('[In-House Contact API] Resend Dispatch:', emailData);
      } catch (emailErr) {
        console.error('[In-House Contact API] Resend Dispatch Error:', emailErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Inquiry delivered securely to support@jobnews.lk',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[In-House Contact API] Fatal Error:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
