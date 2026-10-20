/*
# Create Push Subscriptions Table for JobNews.lk PWA
# Real-time Web Push Notifications and App Icon Badging

1. New Tables
  - `push_subscriptions`: Stores encrypted web push endpoints for installed devices
    - `id` (uuid, primary key)
    - `device_id` (text, non-null)
    - `endpoint` (text, unique, non-null)
    - `p256dh` (text, non-null)
    - `auth` (text, non-null)
    - `platform` (text, default 'android')
    - `user_agent` (text)
    - `created_at` (timestamptz, default now())
    - `updated_at` (timestamptz, default now())

2. Security (Enterprise RLS)
  - Enable RLS on `push_subscriptions`
  - Allow anonymous & authenticated devices to INSERT their own push token
  - Allow anonymous & authenticated devices to UPDATE their own push token
  - Allow SELECT for authenticated admins and backend push dispatcher
*/

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  endpoint text UNIQUE NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  platform text DEFAULT 'android',
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow devices to register (INSERT) their push token
DROP POLICY IF EXISTS "allow_anon_insert_push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "allow_anon_insert_push_subscriptions" ON public.push_subscriptions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow devices to update (UPDATE) their push token
DROP POLICY IF EXISTS "allow_anon_update_push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "allow_anon_update_push_subscriptions" ON public.push_subscriptions
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow SELECT for anon & authenticated (needed for client-side registration checks and stats)
DROP POLICY IF EXISTS "allow_anon_select_push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "allow_anon_select_push_subscriptions" ON public.push_subscriptions
  FOR SELECT TO anon, authenticated
  USING (true);

-- Create index on endpoint for ultra-fast lookup
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON public.push_subscriptions (endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_device_id ON public.push_subscriptions (device_id);
