/**
 * Input Sanitizer & XSS Defense Module for JobNews.lk
 * Strips dangerous HTML tags, inline scripts, event handlers, and malicious URIs.
 */

export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';

  return input
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove inline event handlers (e.g., onerror=, onload=, onclick=)
    .replace(/\s*on\w+\s*=\s*(['"]?)(.*?)\1(?=\s|>)/gi, '')
    // Neutralize dangerous javascript: URIs
    .replace(/javascript\s*:/gi, 'no-javascript:')
    // Strip iframe, object, embed tags
    .replace(/<(iframe|object|embed|form|input)[^>]*>/gi, '')
    .trim();
}

/**
 * Sanitizes search query strings to prevent XSS and SQL injection attempts
 */
export function sanitizeSearchQuery(query: string | null | undefined): string {
  if (!query) return '';
  return query
    .replace(/[<>'";]/g, '') // Strip HTML & SQL special delimiters
    .trim()
    .slice(0, 100); // Limit max query length
}
