import { supabase, type Category, type Country } from './supabase';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'bb1805f2-7176-4193-a0a5-331c7deb5c6f', name: 'Accounting & Finance', slug: 'accounting-finance' },
  { id: 'd180cc23-5e95-4a42-b0ef-07c769eb0acf', name: 'Banking & Insurance', slug: 'banking-insurance' },
  { id: '21eaf28a-92c8-4745-ba65-80298c677ccd', name: 'Education & Teaching', slug: 'education-teaching' },
  { id: '4e286487-e327-44e3-843e-6269174b3dba', name: 'Engineering', slug: 'engineering' },
  { id: 'a1c8df30-c11d-488c-a2ed-b475bddd185a', name: 'Government & Public Sector', slug: 'government-public-sector' },
  { id: '9c4067f8-4947-4ad2-bd3a-87fa794e8b74', name: 'Healthcare & Nursing', slug: 'healthcare-nursing' },
  { id: '36be022c-5e5a-43dd-8a7b-22a6715b1942', name: 'Hospitality & Tourism', slug: 'hospitality-tourism' },
  { id: 'd1b4e686-b773-4fc6-9bcf-c18484cfe759', name: 'IT & Software', slug: 'it-software' },
  { id: 'be1e4312-f41a-4d87-80f0-7cd044851741', name: 'Management & Administration', slug: 'management-administration' },
  { id: '0fa08f4d-f8e7-4a02-bc5e-ef137aa25715', name: 'Marketing & Sales', slug: 'marketing-sales' },
];

export const DEFAULT_COUNTRIES: Country[] = [
  { id: 'a7010372-f301-4ae5-80fe-3f250fc03f29', name: 'Sri Lanka', slug: 'sri-lanka', code: 'LK' },
  { id: '6d4e7d96-8c1e-4e1e-985b-4cd8a8201a79', name: 'Abu Dhabi', slug: 'abu-dhabi', code: null },
  { id: 'b5e18b3a-aecc-451a-9f97-6106ff0d6dbd', name: 'Australia', slug: 'australia', code: 'AU' },
  { id: '77a44852-162a-48a9-832f-862ec6281563', name: 'Doha, Qatar', slug: 'doha-qatar', code: null },
  { id: 'ce50525a-6fd6-4d1e-bd94-864a531cd7e8', name: 'Dubai', slug: 'dubai', code: null },
  { id: '492f2b8b-bc2f-4eed-9940-d4d32d740331', name: 'Japan', slug: 'japan', code: 'JP' },
  { id: '129cdc97-4320-4b48-ab8b-c53c0b4dde3d', name: 'Jordan', slug: 'jordan', code: null },
  { id: '90cc100d-edbf-45b8-93e3-11060f1aafb9', name: 'Kuwait', slug: 'kuwait', code: 'KW' },
  { id: '26705dbc-d7aa-4572-97a5-2a184029ead3', name: 'Malaysia', slug: 'malaysia', code: null },
  { id: 'a2cea98b-a4d9-424c-ada4-baf66aa0ae8c', name: 'Maldives', slug: 'maldives', code: null },
  { id: 'a364a90c-781e-4704-a846-fc03a56b054a', name: 'Oman', slug: 'oman', code: 'OM' },
  { id: '8889543c-a269-4ad0-a737-0683c55418d9', name: 'Qatar', slug: 'qatar', code: 'QA' },
  { id: '61eefd87-464d-48c0-bd4d-c3e1bcd4d152', name: 'Saudi Arabia', slug: 'saudi-arabia', code: 'SA' },
  { id: '0b0ff4da-cd33-4eda-ae5e-4a4d4bba3dd8', name: 'Seychelles', slug: 'seychelles', code: null },
  { id: '69ba1c73-0e69-4667-91c2-de8f0c3f9ae3', name: 'South Korea', slug: 'south-korea', code: 'KR' },
  { id: '70bfe0ab-f976-4534-9beb-1a11ec3a227f', name: 'Thailand', slug: 'thailand', code: null },
  { id: 'ac5ef1a8-0318-4d4c-8d28-fa14cd6842c2', name: 'UAE', slug: 'uae', code: null },
  { id: '462c3f58-ebac-4d16-a352-6f5f61802c1e', name: 'United Arab Emirates', slug: 'united-arab-emirates', code: 'AE' },
  { id: '470026a9-a058-4eab-9319-760bc49d7c59', name: 'United Kingdom', slug: 'united-kingdom', code: 'GB' },
  { id: '76a8bd9b-026c-4a9c-8d29-14e035b637e4', name: 'USA', slug: 'usa', code: null },
];

/**
 * Synchronously retrieves cached categories or instant default fallback.
 * Guarantees 0ms initial render without blank UI or empty drawers.
 */
export function getCachedCategories(): Category[] {
  try {
    const raw = localStorage.getItem('jn_v3_categories') || 
                localStorage.getItem('jn_gov_categories') || 
                localStorage.getItem('jn_pvt_categories');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore json error
  }
  return DEFAULT_CATEGORIES;
}

/**
 * Synchronously retrieves cached countries or instant default fallback.
 */
export function getCachedCountries(): Country[] {
  try {
    const raw = localStorage.getItem('jn_v3_countries') || 
                localStorage.getItem('jn_jobs_countries');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore json error
  }
  return DEFAULT_COUNTRIES;
}

/**
 * Asynchronously revalidates categories in the background from Supabase.
 * Updates localStorage and dispatches a lightweight sync event.
 */
export async function fetchFreshCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name');

    if (!error && data && data.length > 0) {
      try {
        localStorage.setItem('jn_v3_categories', JSON.stringify(data));
      } catch (e) {}
      return data as Category[];
    }
  } catch (err) {
    console.warn('Supabase categories fetch error:', err);
  }

  // Fallback: Direct REST endpoint if Supabase client hung or encountered CORS/network issue
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/categories?select=id,name,slug&order=name`;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const res = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        try {
          localStorage.setItem('jn_v3_categories', JSON.stringify(data));
        } catch (e) {}
        return data as Category[];
      }
    }
  } catch (restErr) {
    console.warn('REST categories fallback error:', restErr);
  }

  return getCachedCategories();
}

/**
 * Asynchronously revalidates countries in the background from Supabase.
 */
export async function fetchFreshCountries(): Promise<Country[]> {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name, slug, code')
      .order('name');

    if (!error && data && data.length > 0) {
      try {
        localStorage.setItem('jn_v3_countries', JSON.stringify(data));
      } catch (e) {}
      return data as Country[];
    }
  } catch (err) {
    console.warn('Supabase countries fetch error:', err);
  }

  return getCachedCountries();
}
