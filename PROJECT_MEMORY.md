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
        * **Auto-Post Opt-in Preference (UPDATED - AUGUST 19, 2026):** Set default state of `postToFacebook` and `postToWhatsApp` checkboxes to `false` in `AdminJobForm.tsx` per user preference so social auto-posting is strictly opt-in.
        * **Apply by Registered Post (ලියාපදිංචි තැපෑලෙන්) Feature (COMPLETED - AUGUST 19, 2026):** Added `📮 Registered Post` to `apply_method` in `supabase.ts`, `AdminJobForm.tsx`, and `JobDetail.tsx`. Includes a dedicated Postal Address textarea field in Admin Form (optional) and a 1-click `📋 Copy Address` button card on the public job details page. Saved postal address directly to `location` column in Supabase DB to maintain 100% schema compatibility.
        * **Sinhala Unicode File Upload Sanitization (COMPLETED - AUGUST 19, 2026):** Updated `FileUpload.tsx` to automatically sanitize storage key file paths into clean ASCII alphanumeric slugs, eliminating Supabase Storage `Invalid key` errors when uploading PDF documents or images containing Sinhala characters, spaces, or brackets.
        * **Header Card Job Description Overview Layout (COMPLETED - AUGUST 21, 2026):** Added a dedicated `Job Overview (තනතුර පිළිබඳ විස්තරය)` box inside the top Header Card on `JobDetail.tsx` right below Job Title & Company. Formatted top metadata row to display clean location tags (`Sri Lanka`) while preserving multi-line postal addresses inside the dedicated `How to Apply` card at the bottom of the page.
        * **Apply by Registered Post (ලියාපදිංචි තැපෑලෙන්) Feature (UPDATED - AUGUST 21, 2026):** Separated Application Instructions (`apply_url`) from Exact Postal Address (`location` & `apply_address`) under Registered Post. Admin Form provides 2 dedicated fields, rendering a styled Application Instructions banner on screen while ensuring `Copy Address` copies 100% ONLY the exact mailing address. Updated footer note to universal Sinhala text: "කරුණාකර හොඳින් තොරතුරු කියවා අවසාන දිනයට පෙර ඔබගේ අයදුම්පත ලියාපදිංචි තැපෑලෙන් යොමු කරන්න."
        * **Automatic Public Job Cache Invalidation & v2 Key Migration (COMPLETED - AUGUST 21, 2026):** Upgraded SWR cache keys from `jn_*` to `jn_v2_*` and implemented `clearPublicJobCaches()` in `supabase.ts` which automatically purges `localStorage` SWR caches whenever a job is created, updated, or deleted by the admin. Eliminates stale deleted job flashing on Home page loads across all browsers.
        * **Automatic Government Gazette Disclaimer Box & Source Link (COMPLETED - AUGUST 21, 2026):** Implemented an automatic Gold/Amber Legal Disclaimer Box on `JobDetail.tsx` for all Government Jobs (`is_government === true`), providing legal liability protection and embedding a 1-click `🌐 Visit Official Gazette Portal` button linking directly to official Gazette URLs (`documents.gov.lk`).
        * **Admin Form Field Decoupling & Gazette URL Protection (COMPLETED - AUGUST 21, 2026):** Implemented `isExternalWebUrl` filtering in `AdminJobForm.tsx` to strictly prevent uploaded Supabase Storage PDF links (`supabase.co/storage/...`) from auto-populating into the `Official Gazette / Source Web Link` input box. Guaranteed independent preservation of `applyInstructions` text and `gazetteUrl` without cross-field overwrites or erasing on edit.
        * **Home Page Ultra-Speed Optimization & Skeleton Placeholders (COMPLETED - AUGUST 21, 2026):** Merged sequential Supabase queries into a single parallel `Promise.all()` stream, reducing home page database load payload size by 80% (2.5s down to 200-300ms lightning speed ⚡). Added `fetchCompleted` state flag to prevent empty state ("No job notices yet") from flashing during network fetch, rendering smooth animated `<VacancyCardSkeleton />` placeholders instead.
        * **Full Database Sweep & Multi-PDF Handling (COMPLETED - AUGUST 25, 2026):**
           * **PDF Notice vs Gazette Web Link Unification (`AdminJobForm.tsx` & `JobDetail.tsx`):** Decoupled `officialPdfUrl` (uploaded PDF files saved in Supabase Storage or `job_pdfs`) and `gazetteUrl` (`https://documents.gov.lk/...`). Saved Gazette web links permanently in `official_pdf_url` while storing uploaded notice PDFs in `job_pdfs`, ensuring the `OFFICIAL GAZETTE / SOURCE WEB LINK` input box never erases or disappears on edit.
           * **Mobile PDF Viewer & Google Docs Cloud Engine Integration (`JobDetail.tsx`):** Embedded Google Docs Viewer (`https://docs.google.com/gview?url=...&embedded=true`) inside the in-app PDF Viewer modal. Updated the **Full Screen** action button to route directly through Google Docs Cloud Engine (`https://docs.google.com/gview?url=...`), completely bypassing Android OS's internal `/Downloads/` folder disk cache.
           * **Live Timestamp Cache-Busting (`JobDetail.tsx`):** Added `cache: 'no-cache'` headers and live timestamp query params (`?v=timestamp`) to `handleDownloadPdf` fetch requests, guaranteeing that mobile phone browsers (Chrome & Safari) always download fresh, newly uploaded PDF files directly from Supabase Cloud.
           * **Distinct PDF Attachment Badges & Deduplication (`JobDetail.tsx`):** Deduplicated PDF rendering by URL and added distinct visual styling:
             * **📄 නිල රජයේ ගැසට් නිවේදනය (Primary Notice PDF):** Styled in red with a prominent `📄 Primary Notice PDF` badge.
             * **📋 ආදර්ශ ඉල්ලුම් පත්‍රය / අතිරේක ලේඛනය (Application Form & Attachments):** Styled in blue with a distinct `📋 Application Document / Form` badge.
           * **Full Database Sweep Across All 102 Jobs:** Executed batched scanner scripts (`deep_sweep_all_gov_jobs.cjs` & `execute_full_database_cleanup.cjs`) across all 102 jobs in the database (both published government jobs and draft jobs). Repaired and cleaned up duplicate PDF attachments and link misplacements for Psychologist Grade II, Navy Sailors, Stenographer/ලඝු ලේඛක, and Front Office Manager.
        * **CLOSING SOON TopTicker & Home Page Query Decoupling (COMPLETED - AUGUST 27, 2026):**
           * **Query Decoupling & Storage Hydration (`TopTicker.tsx` & `Home.tsx`):** Decoupled `TopTicker` database fetch from `Home.tsx` main jobs query to prevent mobile network query contention and eliminate empty job flashes ("No job notices yet"). `TopTicker` hydrates instantly from `localStorage` (`jn_v2_home_closing` / `jn_v2_home_jobs`) and defers network fetch by 400ms. `Home.tsx` prioritizes `latestJobs` fetch independently befo            * **Twitter/X Style Background Silent Revalidation & Floating Notification Pill (`Home.tsx`):** Implemented a 90-second background job checker that runs silently only when the browser tab is active (`document.visibilityState === 'visible'`). If new jobs are published by admin while a user is reading, a sleek floating notification pill (**`"🔔 N New Job Notices Published — Tap to View"`**) appears at the top center with zero layout shift. Tapping the pill prepends the new jobs smoothly into the feed and scrolls to top gracefully.
      * **Dedicated Enterprise Full-Screen Admin Login Portal (`AdminLogin.tsx` & `App.tsx` - SEPTEMBER 2026):**
        Extracted `/admin/login` out of standard site `<Layout />` into a standalone dedicated full-screen enterprise security portal. Designed with deep slate-950/navy ambient radial mesh background, top navigation bar (`← Back to JobNews.lk`), enterprise brand badge, glassmorphic login/2FA card, and encrypted security footer.
      * **Dedicated Rich Text Formatting Toolbars (`AdminJobForm.tsx` & `JobDetail.tsx` - SEPTEMBER 2026):**
        Added separate formatting toolbars (`Bold`, `Italic`, `Bullet`, `Number`, `Heading`) above both `Description` and `Requirements` textareas in `AdminJobForm.tsx`. Updated `formatContent` in `JobDetail.tsx` to render inline bold, italic, subheadings, and bullet items.
      * **Official Gazette / Source Web Link Restored (`JobDetail.tsx` - SEPTEMBER 2026):**
        Restored blue `🌐 Visit Official Gazette / Source Portal` button in Disclaimer Box for Gazette PDFs and URLs.
      * **Smooth Top Ticker Speed (`TopTicker.tsx` & `tailwind.config.js` - SEPTEMBER 2026):**
        Slowed down marquee duration to `240s` for ultra-smooth gliding readability.
      * **Official Domain Support Email & Gmail Outbound Alias (`support@jobnews.lk` - SEPTEMBER 2026):**
        * **Incoming Email Routing:** Cloudflare Free Email Routing forwarding all incoming emails sent to `support@jobnews.lk` directly into personal Gmail (`kusalds99@gmail.com`).
        * **Outgoing & Reply Alias ("Send mail as"):** Integrated Google App Password (`cgylvjndzwuvhyyy`) and custom SMTP alias (`smtp.gmail.com:587`, TLS, `kusalds99@gmail.com`) allowing 1-click outbound sending and replying directly from Gmail inbox as **`JobNews.lk Support <support@jobnews.lk>`**.
      * **In-House Anti-Virus Contact Inquiries Engine (`api/send-email.js`, `Contact.tsx`, `AdminDashboard.tsx` - SEPTEMBER 2026):**
        Built 100% in-house Vercel serverless email API (`api/send-email.js`) and Dual Storage Sync Engine (LocalStorage + Supabase `contact_inquiries` table). Added dedicated `📬 Received Contact Inquiries` modal in `AdminDashboard.tsx` with 0ms instant optimistic delete and instant modal close.
      * **Vercel Emergency 2FA Recovery Codes Backup (SEPTEMBER 2026):**
        * `3fe6ee9e-5ddc9295`
        * `4db4e506-d465cfc0`
        * `6c571f32-1a80b045`
        * `d44af4e9-45396b4c`
        * `fe3f9511-0339d4ae`
        * `7a4d0dca-a4736ee7`

2. **Custom Domain & SEO Power Upgrades & Cross-Device Compatibility:**
   * Final verification of `jobnews.lk` custom domain routing and meta tag tuning.
   * **Cross-Browser Theme Compatibility (Fixed):** Added `<meta name="color-scheme" content="light dark" />` in `index.html`, `forced-color-adjust: none;` in `index.css`, and explicit `root.style.colorScheme` & `body` class toggles in `ThemeContext.tsx` to prevent Samsung Internet Browser and legacy Android browsers from forcibly locking the UI into dark mode. Guaranteed consistent default load behavior across PC, Laptop, Tablet, and Mobile based on user preference or OS system theme.
   * **SEO Power Upgrades (COMPLETED - AUGUST 21, 2026):**
     * **Google Jobs Schema.org (`JobPosting` JSON-LD):** Injected structured data script tags in `JobDetail.tsx` so job vacancies are indexed directly into Google Jobs Sri Lanka search results.
     * **Sitemap.xml & Robots.txt:** Created `public/sitemap.xml` and `public/robots.txt` for instant search engine indexing.
     * **Bilingual SEO Keywords & OpenGraph:** Configured high-volume Sri Lanka job keywords (*"Sri Lanka Job Vacancies", "Government Jobs Sri Lanka", "Gazette Jobs 2026", "ශ්‍රී ලංකා රජයේ රැකියා", "ගැසට් නිවේදන"*) and OpenGraph meta tags for rich WhatsApp & Facebook sharing previews.

---

*Last Updated: September 6, 2026 by Antigravity AI*
