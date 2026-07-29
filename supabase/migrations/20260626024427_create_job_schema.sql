/*
# Job News Website Schema

1. New Tables
- `countries`: Countries where jobs are located
  - `id` (uuid, primary key)
  - `name` (text, not null, unique)
  - `slug` (text, not null, unique)
  - `code` (text, 2-letter country code)
  - `created_at` (timestamptz)
- `categories`: Job categories (Engineering, Marketing, etc.)
  - `id` (uuid, primary key)
  - `name` (text, not null, unique)
  - `slug` (text, not null, unique)
  - `created_at` (timestamptz)
- `jobs`: Individual job listings
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `company` (text, not null)
  - `salary` (text, nullable)
  - `location` (text, not null)
  - `description` (text, not null)
  - `deadline` (date, not null)
  - `application_type` (text, not null — either 'external_url' or 'physical')
  - `application_url` (text, nullable — used when application_type is 'external_url')
  - `application_instructions` (text, nullable — used when application_type is 'physical')
  - `featured` (boolean, default false)
  - `category_id` (uuid, FK to categories)
  - `country_id` (uuid, FK to countries)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

2. Security
- Enable RLS on all three tables.
- Allow anon + authenticated SELECT on all tables (public read).
- No direct INSERT/UPDATE/DELETE policies — all writes go through the admin edge function using service role key.
*/

CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  code text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  salary text,
  location text NOT NULL,
  description text NOT NULL,
  deadline date NOT NULL,
  application_type text NOT NULL,
  application_url text,
  application_instructions text,
  featured boolean NOT NULL DEFAULT false,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_countries" ON countries;
CREATE POLICY "anon_select_countries" ON countries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_jobs" ON jobs;
CREATE POLICY "anon_select_jobs" ON jobs FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_jobs_country_id ON jobs(country_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs(featured);
CREATE INDEX IF NOT EXISTS idx_jobs_deadline ON jobs(deadline);
