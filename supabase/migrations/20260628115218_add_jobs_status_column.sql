/*
# Add status column to jobs table

1. Changes
- Add `status` column to `jobs` table (text, not null, default 'draft')
  - Valid values: 'draft' or 'published'
- Add index on `status` for fast filtering

2. Security
- No changes needed; existing RLS policies apply.

3. Notes
- All existing jobs default to 'draft' for safety.
- Admins can toggle status between 'draft' and 'published'.
*/

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';

-- Ensure existing rows have a valid status
UPDATE jobs
SET status = 'draft'
WHERE status IS NULL OR status NOT IN ('draft', 'published');

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
