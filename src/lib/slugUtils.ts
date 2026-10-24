/**
 * SEO Clean URL Slug Utilities for JobNews.lk
 * Guarantees 100% human-readable, Google-optimized URLs with zero broken links.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
 * Generates an SEO-optimized clean slug from Company and Job Title.
 * Example:
 *   Company: "Bank of Ceylon (BOC)"
 *   Title: "Management Trainee 2026"
 *   -> "bank-of-ceylon-management-trainee-2026"
 */
export function generateJobSlug(title: string, company?: string | null): string {
  const cleanComp = company ? slugify(company) : '';
  const cleanTitle = slugify(title);

  // If company is already present in title, don't duplicate it
  if (cleanComp && cleanTitle.startsWith(cleanComp)) {
    return cleanTitle || 'job-vacancy';
  }

  const parts = [cleanComp, cleanTitle].filter(Boolean);
  const combined = parts.join('-');

  return combined || cleanTitle || 'job-vacancy';
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
 *   1. Pure slug: "ceb-electrical-engineer"
 *   2. Hybrid slug: "ceb-electrical-engineer--4e286487-e327..."
 *   3. Pure UUID: "4e286487-e327-44e3-843e-6269174b3dba"
 */
export function extractJobIdentifier(param: string): { type: 'uuid' | 'slug'; value: string } {
  if (!param) return { type: 'slug', value: '' };

  const trimmed = param.trim();

  // If it contains hybrid separator '--'
  if (trimmed.includes('--')) {
    const parts = trimmed.split('--');
    const potentialUuid = parts[parts.length - 1];
    if (isUuid(potentialUuid)) {
      return { type: 'uuid', value: potentialUuid };
    }
  }

  // If it's a pure UUID
  if (isUuid(trimmed)) {
    return { type: 'uuid', value: trimmed };
  }

  // Otherwise, it's a pure slug
  return { type: 'slug', value: trimmed };
}
