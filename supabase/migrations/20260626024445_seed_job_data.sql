/*
# Seed Job News Data

1. Seed data:
- 12 countries
- 8 categories
- 8 sample jobs

2. Important notes:
- This seed data is idempotent (using INSERT ON CONFLICT).
- Jobs are a mix of external URL and physical application types.
- Some jobs are featured.
*/

INSERT INTO countries (name, slug, code) VALUES
  ('United States', 'united-states', 'US'),
  ('United Kingdom', 'united-kingdom', 'GB'),
  ('Canada', 'canada', 'CA'),
  ('Germany', 'germany', 'DE'),
  ('France', 'france', 'FR'),
  ('Australia', 'australia', 'AU'),
  ('India', 'india', 'IN'),
  ('Japan', 'japan', 'JP'),
  ('Netherlands', 'netherlands', 'NL'),
  ('Singapore', 'singapore', 'SG'),
  ('Brazil', 'brazil', 'BR'),
  ('South Africa', 'south-africa', 'ZA')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug) VALUES
  ('Software Engineering', 'software-engineering'),
  ('Marketing', 'marketing'),
  ('Finance', 'finance'),
  ('Healthcare', 'healthcare'),
  ('Design', 'design'),
  ('Sales', 'sales'),
  ('Operations', 'operations'),
  ('Education', 'education')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO jobs (title, company, salary, location, description, deadline, application_type, application_url, application_instructions, featured, category_id, country_id)
SELECT
  'Senior Frontend Developer',
  'TechNova',
  '$120,000 - $160,000',
  'San Francisco, CA',
  'We are looking for an experienced frontend developer with strong React and TypeScript skills to lead our product team. You will be responsible for building modern web applications and mentoring junior developers.',
  '2025-12-31',
  'external_url',
  'https://technova.jobs/senior-frontend',
  NULL,
  true,
  (SELECT id FROM categories WHERE slug = 'software-engineering'),
  (SELECT id FROM countries WHERE slug = 'united-states')
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Senior Frontend Developer' AND company = 'TechNova');

INSERT INTO jobs (title, company, salary, location, description, deadline, application_type, application_url, application_instructions, featured, category_id, country_id)
SELECT
  'Marketing Manager',
  'GrowthPulse',
  '$85,000 - $110,000',
  'London, UK',
  'Lead our global marketing campaigns and drive brand awareness. You will develop multi-channel strategies, manage budgets, and collaborate with creative teams.',
  '2025-11-30',
  'external_url',
  'https://growthpulse.com/careers/marketing-manager',
  NULL,
  true,
  (SELECT id FROM categories WHERE slug = 'marketing'),
  (SELECT id FROM countries WHERE slug = 'united-kingdom')
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Marketing Manager' AND company = 'GrowthPulse');

INSERT INTO jobs (title, company, salary, location, description, deadline, application_type, application_url, application_instructions, featured, category_id, country_id)
SELECT
  'Financial Analyst',
  'BlueRiver Capital',
  '$75,000 - $95,000',
  'Toronto, ON',
  'Analyze market trends, prepare financial models, and support investment decisions. CPA or CFA preferred. Strong Excel and Python skills required.',
  '2025-10-15',
  'external_url',
  'https://bluerivercapital.com/jobs/financial-analyst',
  NULL,
  false,
  (SELECT id FROM categories WHERE slug = 'finance'),
  (SELECT id FROM countries WHERE slug = 'canada')
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Financial Analyst' AND company = 'BlueRiver Capital');

INSERT INTO jobs (title, company, salary, location, description, deadline, application_type, application_url, application_instructions, featured, category_id, country_id)
SELECT
  'Registered Nurse',
  'CityHealth Hospital',
  '$68,000 - $92,000',
  'Berlin, Germany',
  'Provide exceptional patient care in a fast-paced hospital environment. Bilingual English/German preferred. Must have valid nursing license.',
  '2025-09-20',
  'physical',
  NULL,
  'Please submit your application in person at the CityHealth Hospital Human Resources office, located at 45 Friedrichstrasse, Berlin. Bring your CV, nursing license, and two professional references. Applications are accepted Monday-Friday, 9:00 AM - 4:00 PM.',
  true,
  (SELECT id FROM categories WHERE slug = 'healthcare'),
  (SELECT id FROM countries WHERE slug = 'germany')
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Registered Nurse' AND company = 'CityHealth Hospital');

INSERT INTO jobs (title, company, salary, location, description, deadline, application_type, application_url, application_instructions, featured, category_id, country_id)
SELECT
  'Product Designer',
  'PixelCraft Studios',
  '$90,000 - $130,000',
  'Sydney, AU',
  'Design user-centered interfaces for our suite of creative tools. Expertise in Figma and a strong portfolio of mobile and web applications required.',
  '2025-11-10',
  'external_url',
  'https://pixelcraft.studio/careers/product-designer',
  NULL,
  false,
  (SELECT id FROM categories WHERE slug = 'design'),
  (SELECT id FROM countries WHERE slug = 'australia')
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Product Designer' AND company = 'PixelCraft Studios');

INSERT INTO jobs (title, company, salary, location, description, deadline, application_type, application_url, application_instructions, featured, category_id, country_id)
SELECT
  'Sales Executive',
  'CloudScale Inc.',
  '$100,000 + Commission',
  'Amsterdam, NL',
  'Drive enterprise SaaS sales across European markets. You will build relationships with Fortune 500 companies and manage the full sales cycle.',
  '2025-12-15',
  'external_url',
  'https://cloudscale.com/jobs/sales-executive',
  NULL,
  false,
  (SELECT id FROM categories WHERE slug = 'sales'),
  (SELECT id FROM countries WHERE slug = 'netherlands')
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Sales Executive' AND company = 'CloudScale Inc.');

INSERT INTO jobs (title, company, salary, location, description, deadline, application_type, application_url, application_instructions, featured, category_id, country_id)
SELECT
  'Operations Coordinator',
  'Global Logistics Partners',
  '$55,000 - $70,000',
  'Singapore',
  'Coordinate international shipping operations, manage vendor relationships, and ensure timely delivery. Experience in logistics and supply chain required.',
  '2025-10-05',
  'physical',
  NULL,
  'Submit your application by mail to: Global Logistics Partners, HR Department, 88 Marina Bay, Singapore 018981. Include a detailed CV, cover letter, and copies of your relevant certifications.',
  false,
  (SELECT id FROM categories WHERE slug = 'operations'),
  (SELECT id FROM countries WHERE slug = 'singapore')
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Operations Coordinator' AND company = 'Global Logistics Partners');

INSERT INTO jobs (title, company, salary, location, description, deadline, application_type, application_url, application_instructions, featured, category_id, country_id)
SELECT
  'High School Teacher',
  'Eastwood Academy',
  '$52,000 - $68,000',
  'Tokyo, Japan',
  'Teach English and History to high school students. Must be a native English speaker with a teaching qualification. Previous international teaching experience preferred.',
  '2025-08-30',
  'external_url',
  'https://eastwoodacademy.jp/careers/teacher',
  NULL,
  true,
  (SELECT id FROM categories WHERE slug = 'education'),
  (SELECT id FROM countries WHERE slug = 'japan')
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'High School Teacher' AND company = 'Eastwood Academy');
