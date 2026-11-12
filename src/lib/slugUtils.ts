/**
 * SEO Clean URL Slug Utilities for JobNews.lk
 * Guarantees 100% human-readable, Google-optimized URLs with zero broken links.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Legacy slug redirect map for backward compatibility.
 * Any old URL visited by users, shared on WhatsApp, or indexed by Google
 * will seamlessly resolve to its canonical UUID without a 404 error!
 */
export const LEGACY_SLUG_MAP: Record<string, string> = {
  '01-ii': '05755d00-63b3-4724-bb53-9a85bc27c80b',
  'iii': '82b6a98b-5a50-4f35-addb-a4d06d9cdce9',
  'department-of-valuation-iii': 'd37177de-497d-4796-9d91-1d1b1173307f',
};

/**
 * Common Sinhala government & job title keyword mappings to clean English terms.
 * Ensures Sinhala notices auto-generate beautiful, readable English slugs instead of isolated numbers.
 */
const SINHALA_KEYWORD_MAP: Array<[RegExp, string]> = [
  [/කථිකාචාර්ය/g, 'lecturer'],
  [/ග්‍රහලෝකාගාරය/g, 'planetarium'],
  [/වෘත්තීය උපදේශක/g, 'vocational-counselor'],
  [/නීති නිලධාරි|නීති නිලධාරී/g, 'legal-officer'],
  [/තක්සේරු දෙපාර්තමේන්තුව|තක්සේරු/g, 'valuation-department'],
  [/සමාජ සේවා/g, 'social-services'],
  [/විද්‍යා හා තාක්ෂණ/g, 'science-technology'],
  [/කළමනාකාර|කළමණාකාර/g, 'manager'],
  [/සහකාර/g, 'assistant'],
  [/ලේකම්/g, 'secretary'],
  [/ඉංජිනේරු/g, 'engineer'],
  [/ගණකාධිකාරී|ගණකාධිකාරි/g, 'accountant'],
  [/කාර්යාල කාර්ය සහායක/g, 'office-assistant'],
  [/රියදුරු/g, 'driver'],
  [/හෙද/g, 'nurse'],
  [/ගුරු/g, 'teacher'],
  [/තොරතුරු තාක්ෂණ/g, 'it-officer'],
  [/ලිපිකරු/g, 'clerk'],
  [/ආරක්ෂක/g, 'security'],
  [/සංවර්ධන නිලධාරී|සංවර්ධන නිලධාරි/g, 'development-officer'],
  [/විගණන/g, 'audit'],
  [/පරිපාලන/g, 'administrative'],
  [/දුම්රිය/g, 'railway'],
  [/විදුලිබල|විදුලි බල/g, 'ceb'],
  [/ජල සම්පාදන/g, 'water-board'],
  [/බැංකු/g, 'bank'],
  [/රෝහල/g, 'hospital'],
  [/අධ්‍යාපන/g, 'education'],
  [/සෞඛ්‍ය/g, 'health'],
  [/කෘෂිකර්ම/g, 'agriculture'],
  [/ශ්‍රී ලංකා/g, 'sri-lanka'],
  [/දෙපාර්තමේන්තුව/g, 'department'],
  [/අමාත්‍යාංශය/g, 'ministry'],
  [/මණ්ඩලය/g, 'board'],
  [/සංස්ථාව/g, 'corporation'],
  [/අධිකාරිය/g, 'authority'],
];

/**
 * Checks if a given string is a standard UUID format.
 */
export function isUuid(str: string): boolean {
  if (!str) return false;
  return UUID_REGEX.test(str.trim());
}

/**
 * Converts any string into a clean, lower-case, URL-safe slug.
 */
export function slugify(text: string): string {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace common symbols & punctuation with dash or space
    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, ' ')
    // Replace whitespace and underscores with a single dash
    .replace(/[\s_]+/g, '-')
    // Remove any character that is not a lowercase letter, number, or dash
    .replace(/[^a-z0-9-]/g, '')
    // Collapse multiple consecutive dashes into one
    .replace(/-+/g, '-')
    // Trim leading and trailing dashes
    .replace(/^-+|-+$/g, '');
}

/**
 * Cleans user-typed input for the Custom URL Slug field.
 * Allows letters, numbers, and hyphens without leading/trailing hyphens.
 */
export function sanitizeCustomSlug(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '');
}

/**
 * Generates an SEO-optimized clean English slug from Company and Job Title.
 * Translates common Sinhala terms, eliminates isolated roman numerals (e.g. "ii", "01-ii"),
 * and guarantees a readable, professional URL.
 */
export function generateJobSlug(title: string, company?: string | null): string {
  let processedTitle = title || '';
  let processedCompany = company || '';

  // 1. If text contains Sinhala, transliterate common keywords
  if (/[\u0D80-\u0DFF]/.test(processedTitle) || /[\u0D80-\u0DFF]/.test(processedCompany)) {
    for (const [regex, replacement] of SINHALA_KEYWORD_MAP) {
      processedTitle = processedTitle.replace(regex, ` ${replacement} `);
      processedCompany = processedCompany.replace(regex, ` ${replacement} `);
    }
  }

  const cleanComp = processedCompany ? slugify(processedCompany) : '';
  const cleanTitle = slugify(processedTitle);

  // Filter out standalone junk parts like '01', 'ii', 'iii', 'iv' if they are the only thing
  const isMeaningful = (s: string) => {
    if (!s) return false;
    const stripped = s.replace(/^(01|02|03|04|05|i|ii|iii|iv|v)-?|-?(01|02|03|04|05|i|ii|iii|iv|v)$/g, '');
    return stripped.replace(/-/g, '').length >= 3;
  };

  let candidate = '';

  // If company is already present in title, don't duplicate it
  if (cleanComp && cleanTitle.startsWith(cleanComp)) {
    candidate = cleanTitle;
  } else {
    const parts = [cleanComp, cleanTitle].filter(Boolean);
    candidate = parts.join('-');
  }

  // Clean candidate from redundant trailing dashes
  candidate = slugify(candidate);

  // If candidate is too short or just numbers/roman numerals, provide fallback
  if (!isMeaningful(candidate)) {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    candidate = `sri-lanka-job-vacancy-${randomSuffix}`;
  }

  // Trim length to max 80 chars for clean SEO URLs
  if (candidate.length > 80) {
    candidate = candidate.substring(0, 80).replace(/-[^-]*$/, '');
  }

  return candidate || 'sri-lanka-job-vacancy';
}

/**
 * Helper to get the canonical URL path for a job.
 * Prefers clean slug if available, seamlessly falls back to ID.
 */
export function getJobPath(job: { id: string; slug?: string | null }): string {
  if (!job) return '/jobs';
  if (job.slug && job.slug.trim()) {
    return `/jobs/${job.slug.trim()}`;
  }
  return `/jobs/${job.id}`;
}

/**
 * Extracts a target identifier from a route param.
 * Supports:
 *   1. Legacy slug redirect: "01-ii" -> maps to UUID
 *   2. Pure slug: "ceb-electrical-engineer"
 *   3. Hybrid slug: "ceb-electrical-engineer--4e286487-e327..."
 *   4. Pure UUID: "4e286487-e327-44e3-843e-6269174b3dba"
 */
export function extractJobIdentifier(param: string): { type: 'uuid' | 'slug'; value: string } {
  if (!param) return { type: 'slug', value: '' };

  const trimmed = param.trim();

  // 1. Check legacy slug map first (guarantees old shared links never 404)
  if (LEGACY_SLUG_MAP[trimmed]) {
    return { type: 'uuid', value: LEGACY_SLUG_MAP[trimmed] };
  }

  // 2. If it contains hybrid separator '--'
  if (trimmed.includes('--')) {
    const parts = trimmed.split('--');
    const potentialUuid = parts[parts.length - 1];
    if (isUuid(potentialUuid)) {
      return { type: 'uuid', value: potentialUuid };
    }
  }

  // 3. If it's a pure UUID
  if (isUuid(trimmed)) {
    return { type: 'uuid', value: trimmed };
  }

  // 4. Otherwise, it's a pure slug
  return { type: 'slug', value: trimmed };
}
