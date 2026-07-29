/*
# Add Storage RLS policies for job-images and job-pdfs buckets

## Problem
Both storage buckets existed but had no RLS policies on storage.objects.
Any upload attempt (even from authenticated admin users) was blocked with
"new row violates row-level security policy".

## Changes
- Authenticated admin users can INSERT, UPDATE, DELETE objects in both buckets.
- Anyone (anon + authenticated) can SELECT/read objects (buckets are public).
- Admin check: user must have role = 'admin' in the profiles table.
*/

-- ============ job-images bucket ============

DROP POLICY IF EXISTS "job_images_public_select" ON storage.objects;
CREATE POLICY "job_images_public_select" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'job-images');

DROP POLICY IF EXISTS "job_images_admin_insert" ON storage.objects;
CREATE POLICY "job_images_admin_insert" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'job-images' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "job_images_admin_update" ON storage.objects;
CREATE POLICY "job_images_admin_update" ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'job-images' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "job_images_admin_delete" ON storage.objects;
CREATE POLICY "job_images_admin_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'job-images' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============ job-pdfs bucket ============

DROP POLICY IF EXISTS "job_pdfs_public_select" ON storage.objects;
CREATE POLICY "job_pdfs_public_select" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'job-pdfs');

DROP POLICY IF EXISTS "job_pdfs_admin_insert" ON storage.objects;
CREATE POLICY "job_pdfs_admin_insert" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'job-pdfs' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "job_pdfs_admin_update" ON storage.objects;
CREATE POLICY "job_pdfs_admin_update" ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'job-pdfs' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "job_pdfs_admin_delete" ON storage.objects;
CREATE POLICY "job_pdfs_admin_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'job-pdfs' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
