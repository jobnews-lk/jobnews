/*
# Add Sri Lanka to countries table

Inserts Sri Lanka with slug and code if it does not already exist.
*/
INSERT INTO countries (name, slug, code)
SELECT 'Sri Lanka', 'sri-lanka', 'LK'
WHERE NOT EXISTS (SELECT 1 FROM countries WHERE slug = 'sri-lanka');
