/*
# Safe Migration for Existing Jobs

1. Migrate existing job data to new schema:
- Set post_type to 'text' for all
- Set apply_method to 'online' if null
- Set is_government/is_overseas/is_private_sector to false
- Set posted_date from created_at if null

2. Important notes:
- This is idempotent and safe to re-run.
- No data is lost.
*/

UPDATE jobs
SET post_type = COALESCE(post_type, 'text'),
    apply_method = COALESCE(apply_method, 'online'),
    is_government = COALESCE(is_government, false),
    is_overseas = COALESCE(is_overseas, false),
    is_private_sector = COALESCE(is_private_sector, false),
    posted_date = COALESCE(posted_date, created_at::date),
    closing_date = COALESCE(closing_date, NOW()::date + INTERVAL '30 days');
