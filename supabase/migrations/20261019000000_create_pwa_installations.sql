/*
# Create PWA Installations Tracking Table

1. New Tables
  - `pwa_installations`: Stores anonymous device installation records for the JobNews.lk PWA
    - `id` (uuid, primary key)
    - `device_id` (text, unique, anonymous device identifier)
    - `platform` (text, e.g. 'android', 'ios', 'windows', 'macos')
    - `user_agent` (text)
    - `installed_at` (timestamptz)
    - `last_active` (timestamptz)

2. Security
  - Enable RLS on `pwa_installations`
  - Allow anonymous & authenticated users to INSERT and UPDATE (upsert) install records
  - Allow anonymous & authenticated users to SELECT install records for stats display
*/

CREATE TABLE IF NOT EXISTS pwa_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text UNIQUE NOT NULL,
  platform text DEFAULT 'other',
  user_agent text,
  installed_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

ALTER TABLE pwa_installations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_anon_insert_pwa_installations" ON pwa_installations;
CREATE POLICY "allow_anon_insert_pwa_installations" ON pwa_installations
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "allow_anon_update_pwa_installations" ON pwa_installations;
CREATE POLICY "allow_anon_update_pwa_installations" ON pwa_installations
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "allow_anon_select_pwa_installations" ON pwa_installations;
CREATE POLICY "allow_anon_select_pwa_installations" ON pwa_installations
  FOR SELECT TO anon, authenticated
  USING (true);
