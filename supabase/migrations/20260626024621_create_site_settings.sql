/*
# Site Settings Table

1. New Tables
- `site_settings`: Stores admin password for the admin dashboard
  - `id` (integer, primary key, fixed to 1)
  - `admin_password` (text, not null)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

2. Security
- Enable RLS on `site_settings`.
- Only anon + authenticated SELECT (frontend reads password via edge function only, not directly).
- No write policies — edge function writes directly with service role key.
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id integer PRIMARY KEY CHECK (id = 1),
  admin_password text NOT NULL DEFAULT 'admin123',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_site_settings" ON site_settings;
CREATE POLICY "anon_select_site_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

INSERT INTO site_settings (id, admin_password) VALUES (1, 'admin123')
  ON CONFLICT (id) DO NOTHING;
