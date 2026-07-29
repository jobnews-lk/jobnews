/*
# Job News Website Redesign Schema

1. New Tables
- `job_images`: Stores image URLs for image-type posts
  - `id` (uuid, primary key)
  - `job_id` (uuid, FK to jobs)
  - `url` (text, not null)
  - `sort_order` (int, default 0)
  - `created_at` (timestamptz)
- `job_pdfs`: Stores PDF URLs for pdf-type posts
  - `id` (uuid, primary key)
  - `job_id` (uuid, FK to jobs)
  - `url` (text, not null)
  - `filename` (text)
  - `page_count` (int)
  - `created_at` (timestamptz)

2. Modified Tables
- `jobs`:
  - ADD `post_type` (text, not null, default 'text')
  - ADD `requirements` (text)
  - ADD `apply_method` (text, not null, default 'online')
  - ADD `apply_email` (text)
  - ADD `apply_phone` (text)
  - ADD `posted_date` (date, not null, default now())
  - ADD `is_government` (boolean, not null, default false)
  - ADD `is_overseas` (boolean, not null, default false)
  - ADD `is_private_sector` (boolean, not null, default false)
  - DROP `featured` (boolean) - replaced by `is_government`/`is_overseas` flags
  - DROP `application_type` (text) - replaced by `apply_method`
  - DROP `application_url` (text) - renamed to `apply_url`
  - DROP `application_instructions` (text) - replaced by `apply_method` + `description`
  - RENAME `application_url` to `apply_url` (text)
  - RENAME `deadline` to `closing_date` (date, not null)
- `categories` and `countries`: unchanged
- `site_settings`: unchanged

3. Security
- Enable RLS on `job_images` and `job_pdfs`.
- Allow anon + authenticated SELECT on all tables.
- Writes go through admin edge function.
*/

-- Create job_images table
CREATE TABLE IF NOT EXISTS job_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create job_pdfs table
CREATE TABLE IF NOT EXISTS job_pdfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  url text NOT NULL,
  filename text,
  page_count int,
  created_at timestamptz DEFAULT now()
);

-- Add columns to jobs table
ALTER TABLE jobs 
  ADD COLUMN IF NOT EXISTS post_type text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS apply_method text NOT NULL DEFAULT 'online',
  ADD COLUMN IF NOT EXISTS apply_email text,
  ADD COLUMN IF NOT EXISTS apply_phone text,
  ADD COLUMN IF NOT EXISTS posted_date date NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_government boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_overseas boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_private_sector boolean NOT NULL DEFAULT false;

-- Rename columns if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'deadline') THEN
    ALTER TABLE jobs RENAME COLUMN deadline TO closing_date;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'application_url') THEN
    ALTER TABLE jobs RENAME COLUMN application_url TO apply_url;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'application_instructions') THEN
    ALTER TABLE jobs DROP COLUMN application_instructions;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'application_type') THEN
    ALTER TABLE jobs DROP COLUMN application_type;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'featured') THEN
    ALTER TABLE jobs DROP COLUMN featured;
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_jobs_post_type ON jobs(post_type);
CREATE INDEX IF NOT EXISTS idx_jobs_is_government ON jobs(is_government);
CREATE INDEX IF NOT EXISTS idx_jobs_is_overseas ON jobs(is_overseas);
CREATE INDEX IF NOT EXISTS idx_jobs_closing_date ON jobs(closing_date);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date);
CREATE INDEX IF NOT EXISTS idx_job_images_job_id ON job_images(job_id);
CREATE INDEX IF NOT EXISTS idx_job_pdfs_job_id ON job_pdfs(job_id);

-- RLS on job_images
ALTER TABLE job_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_job_images" ON job_images;
CREATE POLICY "anon_select_job_images" ON job_images FOR SELECT TO anon, authenticated USING (true);

-- RLS on job_pdfs
ALTER TABLE job_pdfs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_job_pdfs" ON job_pdfs;
CREATE POLICY "anon_select_job_pdfs" ON job_pdfs FOR SELECT TO anon, authenticated USING (true);

-- Create storage bucket for job-images if not exists
INSERT INTO storage.buckets (id, name, public, avif_autodetection, allowed_mime_types)
VALUES ('job-images', 'job-images', true, false, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create storage bucket for job-pdfs if not exists
INSERT INTO storage.buckets (id, name, public, avif_autodetection, allowed_mime_types)
VALUES ('job-pdfs', 'job-pdfs', true, false, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = true;
