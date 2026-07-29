/*
# Add thumbnail_url and official_pdf_url to jobs table

1. Changes
- Add `thumbnail_url` column to `jobs` (text, nullable)
  - Stores the URL of the primary thumbnail image used for job cards, homepage listings, and search results.
- Add `official_pdf_url` column to `jobs` (text, nullable)
  - Stores the URL of the official PDF notice (e.g. government gazette, official vacancy document).
- Both columns reference files stored in Supabase Storage.
- No existing data is modified — both columns are nullable.

2. Security
- No RLS changes needed; existing policies on the `jobs` table continue to apply.

3. Notes
- These columns are used alongside the existing `job_images` and `job_pdfs` tables.
- `thumbnail_url` is used for single-image preview in job cards.
- `official_pdf_url` is the primary PDF attachment for official notices.
*/

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS thumbnail_url text;

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS official_pdf_url text;
