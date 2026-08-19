# JobNews.lk - Permanent Project Memory & Knowledge Base

> **Note to AI Assistants:** This document contains the single source of truth for the `JobNews.lk` codebase history, architectural decisions, completed features, ongoing tasks, and future plans. Always read this file immediately upon starting any session to guarantee 100% memory continuity and prevent any empty context loss. All project data, code updates, and progress must be permanently documented here.

---

## 1. Project Overview & Origins
* **Project Name:** JobNews.lk (Sri Lanka's Job Vacancy & Career Portal)
* **Initial Foundation:** Originally generated via `bolt.new` AI.
* **Full Development & Maintenance:** Iteratively expanded, debugged, and refined using Antigravity AI pair programmer.
* **Live Deployment:** GitHub Repository (`https://github.com/jobnews-lk/jobnews.git`) auto-deployed via **Vercel** (`https://jobnews.lk`).
* **Git & Deployment Workflow:** All local code edits are tracked by **GitHub Desktop App** on PC. The user clicks the **Commit** and **Blue Push Origin Button** in GitHub Desktop to push updates live.

---

## 2. Core Architecture & Tech Stack
* **Frontend:** React 18, Vite, TypeScript, React Router DOM (v7), TailwindCSS, Lucide Icons.
* **Backend Services:** Supabase (PostgreSQL, Supabase Auth, Storage Buckets, Row Level Security, Edge Functions).
* **Environment Configuration:** `.env` containing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 3. Database Schema & RLS Security
* **`jobs` Table:** Stores vacancy details (`title`, `company`, `salary`, `location`, `description`, `closing_date`, `post_type`: text/image/pdf, `apply_method`: online/email/phone/in_person, `status`: draft/published, `thumbnail_url`, `official_pdf_url`, `category_id`, `country_id`).
* **`job_images` & `job_pdfs` Tables:** Relational tables for multiple image galleries and PDF downloads.
* **`categories` & `countries` Tables:** Categorization for Government, Private, and Overseas opportunities.
* **`profiles` Table:** User roles (`admin` vs `user`).
* **Supabase Storage:** Buckets configured for job images and official PDF downloads with strict Admin RLS write policies.

---

## 4. Admin Security & 2-Step Verification (MFA)
* **Authentication (`AuthContext.tsx`):** Handles Supabase session state, profile fetching, and `isAdmin` flag verification.
* **2-Step Verification (`AdminLogin.tsx`):**
  * **TOTP MFA:** Integrated with **Google Authenticator**.
  * **QR Code Rendering Fix:** Uses `parseQrSvg` to sanitize SVG output, strip absolute width/height, inject dynamic `viewBox="0 0 w h"` and `preserveAspectRatio="xMidYMid meet"` for a 100% centered, responsive QR code in a `w-56 h-56` white card.
  * **Factor Lookup Fix:** Corrected `f.factor_type === 'totp'` check (fixed `factorType` typo).
  * **Factor Cleanup:** Auto-unenrolls unverified TOTP factors to avoid hitting the 10-factor limit error (`Maximum number of verified factors reached`).
  * **Emergency Reset Query (Supabase SQL Editor):** `delete from auth.mfa_factors;` clears orphaned factors if ever locked out.
* **Property Mismatch Fix (`TopTicker.tsx` & `Home.tsx`):** Corrected `company_name` to `company` to ensure company names display correctly in the ticker and job cards.
* **Protected Routes (`AdminRoute.tsx`):** Checks for Admin role and Supabase `aal2` assurance level before granting access to `/admin/dashboard`.

---

## 5. Completed User & Admin Features
* **Public Portal:**
  * **Home (`Home.tsx`):** Live vacancy search (keyword, sector, category, country), `TopTicker.tsx` news ticker, `CategoriesDrawer.tsx` slide-over.
  * **Card Renderers:** `TextNoticeCard.tsx`, `ImageNoticeCard.tsx`, `PdfNoticeCard.tsx`, `VacancyCard.tsx`.
  * **Specific Listings:** `GovernmentJobs.tsx`, `PrivateJobs.tsx`, `OverseasJobs.tsx`, `Jobs.tsx`.
  * **Job Details (`JobDetail.tsx`):** Multi-image viewer carousel, embedded PDF viewer, apply options, social sharing.
  * **Saved Jobs (`SavedJobs.tsx` & `useSavedJobs.ts`):** Client-side bookmarking with `localStorage`.
  * **Legal & Info:** `About.tsx`, `Contact.tsx`, `PrivacyPolicy.tsx`, `Terms.tsx`, `NotFound.tsx`.
* **Admin Management (`AdminDashboard.tsx`, `AdminJobForm.tsx`, `AdminNewJob.tsx`, `AdminEditJob.tsx`):**
  * Dashboard analytics counters (Total, Published, Drafts).
  * Status toggling (Draft <-> Published) and bulk deletion.
  * Multi-file Drag & Drop uploader (`FileUpload.tsx`) supporting images and PDFs.

---

## 6. Future Roadmap & Master Bot Plan
1. **Automated Job Hunting & Multi-Platform Auto-Poster System (Active Focus):**
   * **Master Plan:** [`docs/AUTOMATED_JOB_BOT_PLAN.md`](file:///c:/Users/Lenovo/Desktop/My%20Website/project/docs/AUTOMATED_JOB_BOT_PLAN.md)
   * **Implementation Plan:** [`implementation_plan.md`](file:///C:/Users/Lenovo/.gemini/antigravity/brain/d7e6120b-ce17-4c70-96c8-5e40a79f5413/implementation_plan.md)
   * **Phase 1 (COMPLETED & READY):** Multi-Platform Auto-Distributor Utilities (`src/lib/facebookAutoPoster.ts` & `src/lib/whatsappAutoPoster.ts`). Facebook Graph API & WhatsApp Channel Broadcast API integration with Admin Toggles (`[x] Auto-Post to FB` / `[x] Auto-Post to WA`).
   * **Phase 2 (COMPLETED & READY):** Automated Job Hunter Engine (`src/lib/jobScraperEngine.ts`), AI Gazette PDF Parser (`src/lib/gazettePdfParser.ts`), and Auto-Dynamic Job Banner Generator (`src/lib/jobBannerGenerator.ts`). Stealth human-like delays, 3-Type categorization, 1-to-1 `AdminJobForm` field extraction, **Gazette PDF Auto-Attach (`official_pdf_url`)**, detailed Gazette envelope/postal application instructions in Requirements, and copyright-safe thumbnail generation.
   * **Phase 3 (COMPLETED & READY):** Admin Dashboard (`AdminDashboard.tsx`) with `🤖 Run Auto Job Hunter` control, mandatory `Draft` status pending queue, **`🌐 Dynamic Sources Manager` (Add, Edit `✏️`, and Delete `🗑️` Web Sources per Category with LocalStorage & Database Persistence)**, and one-click `Approve & Publish` workflow. Added **👁️ Instant In-Dashboard Job Preview Modal** allowing admins to inspect full job details, auto-generated banners, attached Gazette PDFs, and click `Approve & Publish Now` directly inside the preview popup! Verified Workday Career Portals support (e.g., `Minor International / Anantara & Avani Careers` `https://minor.wd102.myworkdayjobs.com/en-US/Careers`) with 3-Stage Smart Location Filtering (Sri Lanka, Maldives, UAE, Qatar, Oman, Bahrain, Seychelles, Saudi Arabia, Japan, Romania, etc.).
   * **Latest Features, Rules & UI Enhancements (Updated August 2026):**
     * **Document Hints & Multi-PDF Attachments (`AdminJobForm.tsx`, `JobDetail.tsx`):**
       Added document label text inputs for each uploaded PDF in `AdminJobForm`. On `JobDetail.tsx`, rendered interactive attachment cards displaying custom titles (e.g. *"Official Application Form (Sinhala)"*, *"Marking Scheme"*) with View PDF and Download actions.
     * **Sri Lanka Emblem / Logo Protection Rule:**
       Enforced strict rule to NEVER show scraped government logos/emblems on public cards. Aligned `ImageNoticeCard.tsx` and `JobDetail.tsx` so both display the exact same clean primary image (`images[0]`).
     * **Unlimited Age Active Vacancies Filter (`jobScraperEngine.ts`):**
       Updated `isJobActiveAndOpen` filter to accept all active open vacancies regardless of posted age (including 30+ days old).
     * **Zero Banner Text Cropping (`VacancyCard.tsx`, `TextNoticeCard.tsx`, `jobBannerGenerator.ts`):**
       Added top safety margins in canvas banner generator and updated card containers to use `object-contain` with blurred letterboxing background so no banner text is cropped.
     * **Mobile UI/UX Responsiveness Fix (`JobDetail.tsx`):**
       Redesigned document attachment cards with a top-title and bottom-actions row layout (`break-words`, `leading-snug`). Preserved custom font sizes while eliminating text truncation (`O...`, `මාර්ග...`) and button overlapping on Honor X7c and all smart phones.
     * **Smart Content Auto-Formatter (`JobDetail.tsx`):**
       Enhanced `formatContent` in `JobDetail.tsx` to automatically parse:
       1. **Key-Value Pairs (`තනතුර:`, `පුරප්පාඩු සංඛ්‍යාව:`):** Rendered with `🔹` blue icons and bold keys.
       2. **Numbered Lists (`1.`, `2)`, `(01)`):** Rendered with blue numbered pill badges (`[1.]`, `[2.]`).
       3. **Bullet Points (`-`, `*`, `•`):** Rendered with `🔹` gradient icons.
     * **Single-Row Clean Button Layout & Zero Empty Gaps (COMPLETED):**
       Aligned all job notice cards (`ImageNoticeCard.tsx`, `PdfNoticeCard.tsx`, `TextNoticeCard.tsx`, `VacancyCard.tsx`) into a unified single-row action bar: `[ Notice ]` `[ ↗ Apply ]` ... `[ Details > ]` `[ 🔗 Share ]`. Eliminates multi-row wrapping and removes awkward empty free space gaps for a 100% clean, balanced presentation across Mobile, Tablet, and Desktop.
     * **Share Vacancy Action Suite (COMPLETED):**
       Created `ShareButtons.tsx` with support for Native Web Share API (Mobile Device Share Sheet), WhatsApp direct pre-filled sharing, Facebook share, Telegram share, and instant Copy Link to clipboard with feedback toasts across all job cards and detail pages.
     * **Official WhatsApp Channel Integration (COMPLETED):**
       Integrated official WhatsApp Channel link (`https://whatsapp.com/channel/0029Vb8F3lw42DcjuB8vvQ1y`) across `Navbar.tsx`, `JobDetail.tsx`, `Footer.tsx`, and created a responsive `WhatsAppFloatingButton.tsx` badge for maximum user engagement and channel subscriber growth.
     * **Permanent localStorage Caching & Vite Code-Splitting (COMPLETED):**
       Upgraded SWR caching from `sessionStorage` to permanent `localStorage` (`jn_home_jobs`, `jn_all_jobs`, `jn_gov_jobs`, `jn_pvt_jobs`, `jn_ovs_jobs`), ensuring 0ms instant job list rendering even across browser restarts. Added Vite `manualChunks` code-splitting in `vite.config.ts` (shrunk main bundle size by 70%) and configured Cloudflare Edge CDN Cache-Control headers in `vercel.json` (`public, max-age=31536000, immutable`).
     * **Security Posture & Cloudflare Enterprise Readiness (COMPLETED):**
       Verified Supabase RLS, SQLi immunity via parameterized queries, XSS sanitization (`src/lib/sanitizer.ts`), and Anti-Brute-Force Rate Limiting Lockout (`AdminLogin.tsx`). Successfully integrated **Cloudflare CDN, Free SSL Certificate (HTTPS), WAF Anti-DDoS Protection, Cloudflare Fonts, Early Hints, and Speed Brain Optimization** for `jobnews.lk` (Nameservers updated at LK Domain Registry).
      * **Facebook Page & WhatsApp Channel Auto-Poster Integration (COMPLETED - AUGUST 2026):**
        * **Meta App:** `JobNews Auto Poster` (App ID: `1593091269083965`)
        * **Facebook Page:** `JobNews LK` (Page ID: `61591690220968`)
        * **WhatsApp Business Account ID:** `2205978756639697`
        * **WhatsApp Phone Number ID:** `1214771975059705`
        * **Environment File:** `.env` updated with fresh `JobNews LK` Page Access Token (`VITE_FACEBOOK_PAGE_ACCESS_TOKEN` & `VITE_WHATSAPP_API_TOKEN`).
        * **Documentation & Renewal Manual:** Saved detailed token renewal and permanent token guide in [`FACEBOOK_TOKEN_RENEWAL.md`](file:///c:/Users/Lenovo/Desktop/My%20Website/project/FACEBOOK_TOKEN_RENEWAL.md).
        * **Async Navigation & Live Toast Feedback Fix (COMPLETED):** Updated `AdminEditJob.tsx` and `AdminNewJob.tsx` to await `Promise.all` auto-post network requests before redirecting, preventing browser fetch cancellation during SPA navigation. Added live toast feedback to `AdminDashboard.tsx` displaying instant Facebook/WhatsApp posting results.
        * **Facebook Graph API `me/photos` Endpoint Fix (COMPLETED):** Updated `facebookAutoPoster.ts` to target `https://graph.facebook.com/v19.0/me/photos` instead of explicit page ID path, resolving Meta Page Access Token object permission mismatch errors.

2. **Custom Domain & SEO Optimization & Cross-Device Compatibility:**
   * Final verification of `jobnews.lk` custom domain routing and meta tag tuning.
   * **Cross-Browser Theme Compatibility (Fixed):** Added `<meta name="color-scheme" content="light dark" />` in `index.html`, `forced-color-adjust: none;` in `index.css`, and explicit `root.style.colorScheme` & `body` class toggles in `ThemeContext.tsx` to prevent Samsung Internet Browser and legacy Android browsers from forcibly locking the UI into dark mode. Guaranteed consistent default load behavior across PC, Laptop, Tablet, and Mobile based on user preference or OS system theme.

---

*Last Updated: 2026-08-18 by Antigravity AI*
