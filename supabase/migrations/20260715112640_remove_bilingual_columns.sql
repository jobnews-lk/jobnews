-- Remove bilingual (English/Sinhala) columns added by the bilingual feature.
-- The original title, description, and requirements columns retain all job data.
-- These columns are nullable and only ever held duplicate English values; no
-- Sinhala translations were ever stored, so dropping them loses no user data.

ALTER TABLE jobs
  DROP COLUMN IF EXISTS title_en,
  DROP COLUMN IF EXISTS title_si,
  DROP COLUMN IF EXISTS description_en,
  DROP COLUMN IF EXISTS description_si,
  DROP COLUMN IF EXISTS requirements_en,
  DROP COLUMN IF EXISTS requirements_si,
  DROP COLUMN IF EXISTS content_lang;
