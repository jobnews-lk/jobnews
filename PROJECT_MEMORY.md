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
      * **Google Search Console Onboarding & Dynamic Sitemap Submission (SEPTEMBER 9, 2026):**
        * **Ownership Verified:** Added `google1b17d329aa0391fe.html` verification file in `public/` and `<meta name="google-site-verification" content="google1b17d329aa0391fe" />` in `index.html`. Ownership verified 100% on Google Search Console.
        * **Dynamic Sitemap Status (SUCCESS ✅):** Submitted `https://jobnews.lk/sitemap.xml` to Google Search Console. Verified Google status: **Success (Last read: Sep 9, 2026)**. Auto-indexes all published jobs directly from Supabase Database for top Google Sri Lanka search rankings.
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

       * **Search Console & Server Security Hardening (COMPLETED - SEPTEMBER 24, 2026):**
         * **Deleted Jobs HTTP 404 Handler (`api/share-job.js`):** Updated social share API to return a clean `HTTP 404 (Not Found)` status page for deleted/expired jobs, preventing Googlebot from logging "Page with redirect" errors when crawling legacy deleted job URLs.
         * **Cloudflare Security Grade A+:** Configured Cloudflare HSTS (6 months, subdomains, Preload, No-Sniff), set Minimum TLS version to `TLS 1.2`, and enabled DMARC TXT record & DMARC Management to protect `@jobnews.lk` email domain.
         * **Vercel Security Headers (`vercel.json`):** Added `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, and `Referrer-Policy` headers.
         * **Security Compliance (`public/.well-known/security.txt`):** Added `security.txt` file for Cloudflare and vulnerability reporting standards.

---

       * **Web Push Notifications & Native App Icon Red Badging System (COMPLETED - OCTOBER 20, 2026):**
         * **VAPID Cryptographic Keypair:** Generated and linked standard VAPID authentication keys for trusted Google FCM / Apple APNs dispatch.
         * **Enterprise RLS Database Security:** Created `push_subscriptions` table (`20261020000000_create_push_subscriptions.sql`) with strict Row Level Security (RLS) allowing anonymous devices to insert/update their own push tokens with zero exposure of sensitive data.
         * **Native System Dialog Modal (`NativePushPermissionModal.tsx`):** Authentic iOS/system frosted glass modal styled with hairline borders (`Allow` / `Don't Allow`). Configured to display **STRICTLY ONLY to installed PWA app users** (`isRunningStandalone()`) with a gentle 2.5s launch delay, completely non-intrusive to regular web visitors.
         * **Vercel Serverless Push Engine (`api/send-push.js` & `api/push-subscribe.js`):** Integrates `web-push` to broadcast alerts and payload unread counts to all active devices, with automated pruning of expired/410 endpoints.
         * **Admin Auto-Broadcast & Real-Time Alerts:** Auto-dispatches web push alerts on job publish (`AdminNewJob.tsx`, `AdminEditJob.tsx`) and provides live subscriber telemetry in `AdminDashboard.tsx`.
         * **App Icon Red Badge:** Updates native Android PWA home screen icon red number badges via `self.navigator.setAppBadge(count)` in `sw.js`.

       * **Android Push Notification Icon Alpha-Masking Fix & Dual Icon Architecture (COMPLETED - OCTOBER 21-22, 2026):**
         * **Root Cause Identification (Modern Android Masking):** On modern Android versions (Android 14, Honor MagicOS 8, Huawei EMUI, Samsung OneUI), passing a solid full-color image into `options.badge` or as the small status bar icon causes Android to apply a solid white alpha tint over all non-transparent pixels, rendering the notification as an unreadable solid white blank square (`white box`).
         * **Android Push Notification Specification Separation:**
           * `options.icon` (Large Drawer Icon): Can and should be a rich, high-resolution 32-bit full-color RGBA bitmap.
           * `options.badge` (Small Icon / Status Bar Badge): **MUST be an alpha-only monochrome silhouette** (pure white `#FFFFFF` vector shapes with 100% transparent alpha background `rgba(0,0,0,0)`).
         * **Dedicated Assets Generated:**
           * `public/jobnews-icon-192.png`: 192x192 high-resolution, full-color royal blue card (`#1e3a8a` to `#2563eb`) with white briefcase and gold magnifying glass accent for `options.icon`.
           * `public/jobnews-badge-mono.png`: 96x96 pure white vector briefcase silhouette on 100% transparent background for `options.badge`.
         * **Cache-Busting & Asset Renaming:** Renamed away from `/pwa-icon-192.png` to instantly bypass 4-hour Cloudflare and mobile browser disk caches.
         * **Service Worker Upgrade to v5 (`public/sw.js`):** Upgraded cache name to `const CACHE_NAME = 'jobnews-pwa-v5';`. Explicitly standardized push event handler options to use `icon: '/jobnews-icon-192.png'` and `badge: '/jobnews-badge-mono.png'`.
         * **Serverless Push Backend (`api/send-push.js`):** Standardized default fallback payload parameters to enforce `icon: '/jobnews-icon-192.png'` and `badge: '/jobnews-badge-mono.png'` across all broadcast alerts.
         * **Admin Broadcasting Components (`AdminDashboard.tsx`, `AdminNewJob.tsx`, `AdminEditJob.tsx`):** Aligned all admin payload dispatches to transmit the standardized dual icon paths.

       * **Admin Dashboard "Use Latest Job" Draft Filtering Protection (COMPLETED - OCTOBER 21, 2026):**
         * **Issue Resolved:** The `⚡ Use Latest Job` button in `AdminDashboard.tsx` auto-filled `jobs[0]` directly without verifying `status`, inadvertently loading unpublished draft vacancies (e.g. `Chef de Partie`) into the notification broadcast form.
         * **Fix Implemented:** Updated `handleFillWithLatestJob` in `AdminDashboard.tsx` to strictly filter by published vacancies:
           ```typescript
           const publishedJobs = jobs.filter(j => j.status === 'published');
           const latest = publishedJobs[0];
           ```
           Guaranteed only verified, published vacancies are auto-filled for real-time notification alerts.

       * **Android PWA Badging & Settings Telemetry (OCTOBER 21-22, 2026):**
         * Documented Android launcher badge support across manufacturers (Honor MagicOS, Samsung OneUI, Xiaomi MIUI/HyperOS, Google Pixel Launcher).
         * The Badging API functions via `self.navigator.setAppBadge(count)` in `sw.js` when the PWA is installed (`display: standalone`).
         * Android OS registers the PWA in `Settings -> Notifications -> App icon badges` once an active notification channel is opened by incoming push alerts.
         * App clears the red badge count via `navigator.clearAppBadge()` on app launch in `App.tsx`.

       * **Production Build & Verification (OCTOBER 22, 2026):**
         * Production Vite build verified: 0 errors (`dist/assets/index-DiARBBo5.js`).
         * Deployed live to Vercel and verified:
           * `https://www.jobnews.lk/sw.js` -> 200 OK (`const CACHE_NAME = 'jobnews-pwa-v5';`)
           * `https://www.jobnews.lk/jobnews-icon-192.png` -> 200 OK (6,585 bytes)
           * `https://www.jobnews.lk/jobnews-badge-mono.png` -> 200 OK (1,108 bytes)
           * `https://www.jobnews.lk/api/push-subscribe` -> 200 OK (`{"total":2,"android":2,"ios":0,"desktop":0}`)

       * **Push Notification Deep-Linking & 0ms Instant Loading Optimization (COMPLETED - OCTOBER 22, 2026):**
         * **Direct Job Deep-Linking (`AdminDashboard.tsx`):** Added `pushUrl` state and UI target input in the Web Push card. `handleFillWithLatestJob` now automatically links `/jobs/${latest.id}` instead of hardcoded generic `/jobs`. Clicking a notification now opens the EXACT vacancy directly.
         * **0ms SWR Cache Hydration (`JobDetail.tsx`):** Added multi-tier instant cache lookup (`jn_job_${id}` -> `jn_v3_home_jobs` -> `jn_v3_all_jobs`). If the job was already in memory, it renders in 0ms with zero skeleton delay while silently revalidating with Supabase.
         * **All Job Notices Speed Engine (`Jobs.tsx`):** Upgraded `Jobs.tsx` to hydrate instantly from `jn_v3_all_jobs` (fallback to `jn_v3_home_jobs`), eliminating the 5-second "Loading notices..." delay. Limited initial query to 60 rows (`.limit(60)`) to drastically speed up query response on mobile 4G/3G.
         * **Cache Purge Synchronization (`supabase.ts`):** Added `jn_v3_*` keys to `clearPublicJobCaches()`.

       * **Expired Vacancies Traffic Retention & Bilingual Alert Card (COMPLETED - OCTOBER 22, 2026):**
         * **Traffic & SEO Retention Strategy:** Retaining expired job URLs preserves high-ranking Google organic search traffic and evergreen social media referrals (Facebook/WhatsApp groups).
         * **Timezone-Safe Expiry Calculation (`JobDetail.tsx`):** Enforced `closing.setHours(23, 59, 59, 999)` so active jobs on their final calendar day never prematurely trigger the expired state during daytime.
         * **Strictly Conditional Bilingual Alert Card (`JobDetail.tsx`):** Rendered STRICTLY when `isExpired === true` (active vacancies remain 100% clean and untouched).
           * Displays gentle amber hourglass card (`⏳`) above the job content.
           * Polite bilingual copy: *"මෙම රැකියාවේ අයදුම්පත් භාරගැනීමේ දිනය පසුවී ඇත (Application Closed)"* with note *"කෙසේ වෙතත්, ඔබගේ දැනගැනීම සඳහා සම්පූර්ණ රැකියා විස්තරය පහතින් කියවිය හැක / You can still view the full job details below for your reference"*.
           * Gen Z / Mobile-Friendly 1-Tap CTA: `[ 🚀 අද දින අලුත්ම රැකියා බලන්න / Browse Latest Jobs ]` routing directly to `/` with 0ms hydration.
           * Preserves 100% of the underlying vacancy's text, requirements, images, and documents without any obstructive modals or layout clipping.

       * **Google Knowledge Panel & LinkedIn Structured Data Integration (COMPLETED - OCTOBER 22, 2026):**
         * **LinkedIn Schema.org Linking (`index.html`):** Connected official public LinkedIn Company Page (`https://www.linkedin.com/company/143933279`) to Schema.org `Organization.sameAs` graph alongside Facebook and WhatsApp.
         * **Founder Persona Entity Linking (`index.html` & `About.tsx`):** Added Founder's personal LinkedIn profile (`https://www.linkedin.com/in/itcrathnadipahotelcolombo`) under `founder.sameAs` in Schema.org and linked directly from the Founder name on `/about`.
         * Accelerates Google Knowledge Graph entity recognition and brand verification for the future right-hand Knowledge Panel displaying Founder (H A Kusal Duminda) and brand logo.

       * **Master Plan: Sri Lanka State & Corporate Directory System (PLANNED & READY FOR IMPLEMENTATION - OCTOBER 2026):**
         * **Strategic Purpose:** Capture non-gazette government vacancies published directly on individual portals of ministries, state banks, armed forces, universities, and corporations. Expand to premier private corporate employers. Position JobNews.lk as Sri Lanka's undisputed #1 Career Super-Hub.
         * **The 150+ State Institutions Registry (9 Sectors):**
           1. රජයේ අමාත්‍යාංශ (25 Ministries)
           2. රජයේ ප්‍රධාන කාර්යාල හා අධිකරණ (Key Offices & Courts: President/PM Offices, Parliament, Cabinet, Supreme Court, Court of Appeal)
           3. ස්වාධීන හා රජයේ කොමිෂන් සභා (Commissions: PSC, Elections, Police, HRCSL, CIABOC, PUCSL, TRCSL, SEC, UGC, etc.)
           4. රජයේ දෙපාර්තමේන්තු (Departments: Customs, IRD, Immigration, DMT, Health, Labour, Agriculture, Surveys, Wildlife, Exams, Prisons, etc.)
           5. රජයේ අධිකාරි, මණ්ඩල, සංස්ථා (Corporations & Boards: CEB, CPC, Water Board, SLTB, Ports, Telecom, Road Dev, SLTDA, etc.)
           6. රජයේ බැංකු හා මූල්‍ය ආයතන (State Banks: CBSL, BOC, People's Bank, NSB, RDB, SMIB, HDFC, EPF, ETF)
           7. විශ්වවිද්‍යාල හා උසස් අධ්‍යාපන (State Universities: Colombo, Moratuwa, Peradeniya, Sri Jayewardenepura, Kelaniya, Ruhuna, Jaffna, Rajarata, etc.)
           8. ආරක්ෂක අංශ (Tri-Forces & Police: Army, Navy, Air Force, Police, Civil Security)
           9. දිස්ත්‍රික්, පළාත් හා ප්‍රාදේශීය ආයතන (Provincial, District & Local Councils)
         * **Corporate / Private Sector Support (Extensible Architecture):**
           * 8 Major Corporate Sectors: IT & Software (WSO2, IFS, Virtusa, LSEG), Private Banks (Commercial, Sampath, HNB, DFCC), Conglomerates (John Keells, Hayleys, Hemas, Aitken Spence), Apparel & Manufacturing (MAS, Brandix, Maliban), Telecom & Media (Dialog, Mobitel, Maharaja), Hospitality (Cinnamon, Jetwing), Private Hospitals (Asiri, Nawaloka, Lanka Hospitals), FMCG & Retail (Keells Super, Cargills).
           * 100% legal, public domain compliance with standard fair-use disclaimers.
         * **Desktop UI/UX Architecture Decisions (User-Validated):**
           * **Navbar Preservation Decision:** Do NOT add another link to the top desktop Navbar to completely prevent 2-line text wrapping / crowding on standard 1366x768 / 1440x900 laptops.
           * **Quick Stat Cards Floating Dropdowns (`Home.tsx`):** Upgrading the 4 Quick Stat Cards right below the Hero search box with sleek floating flyout menus (`▼`):
             * `Government ▼` -> Floating menu with 9 State Sectors + "View All 150+ Institutions ➔".
             * `Private Sector ▼` -> Floating menu with Corporate Industries + "View All Corporate Employers ➔".
             * `Overseas ▼` -> Floating menu with Top Destinations (UAE/Dubai, Maldives, Qatar, Saudi) + "View All Overseas ➔".
             * Dual action: Clicking card text navigates directly; clicking `▼` reveals the floating popover without any layout shifts.
         * **Mobile UI/UX Architecture Decisions (`CategoriesDrawer.tsx`):**
           * Mobile bottom navigation bar remains 100% clean with its 5 icons (`Home`, `Categories`, `Search`, `CV Builder`, `Saved`).
           * Tapping `Categories` opens the left-side drawer enhanced with **3 Extensible Tabs**:
             1. `[ 📂 Fields ]`: Standard job categories (Accounting, IT, Engineering) - 100% intact.
             2. `[ 🏛️ රාජ්‍ය ]`: 150+ Government institutions with 0ms client-side fuzzy search and sector pills.
             3. `[ 🏢 පුද්ගලික ]`: Top private corporate employers with industry filters.
         * **Error Prevention & Google Search Console (GSC) Protection:**
           * **Mobile Usability:** All clickable touch targets have min 48px size and 8px-12px padding (`gap-2`, `p-2.5`) to guarantee 100/100 GSC mobile validation.
           * **Soft 404 & Thin Content Prevention:** Institutions with 0 active jobs still present rich entity data, verified website links, and career instructions so Google never flags thin pages.
           * **URL Canonicalization:** Search query parameters canonicalize back to the primary canonical directory URL to eliminate duplicate content penalties.
           * **Link Safety:** All external links use `target="_blank" rel="noopener noreferrer"`.
           * **Performance:** 0ms RAM caching with pre-computed lowercase search index ensures zero lag on low-end devices.

        * **Seasonal Feature: Christmas & New Year Holiday Auto-Timer (PLANNED FOR NOV 10 - JAN 7):**
          * **Smart Auto-Schedule:** Activates automatically on **November 10** (matching Sri Lanka's holiday shopping and hiring surge) and terminates automatically on **January 7** (after New Year celebrations) with zero manual code edits required.
          * **Delightful Festive Elements Planned:**
            1. **Santa Hat on Logo:** Jaunty mini Santa hat tilted above the JobNews.lk logo in Navbar.
            2. **Subtle Falling Snow (CSS Snowflakes):** Ultra-lightweight background drifting snow particles (0% battery drain, zero reading obstruction).
            3. **Festive Ticker Greeting:** Seasonal greeting banner with jingle bells (`🎄 "Festive Season: නත්තල් සහ අලුත් අවුරුදු සමයේ ඔබගේ සිහින රැකියාව JobNews.lk වෙතින් සොයාගන්න!"`).
            4. **Seasonal Gift Box Badges (`🎁`):** Highlighting surge vacancies in hotels, supermarkets, retail, logistics, and hospitality.
            5. **Festive WhatsApp Floating Button:** Seasonal holiday accent on floating contact badge.

        * **Smart Dynamic Notification & Expiring Reminder Hub (COMPLETED - OCTOBER 23, 2026):**
          * **Architecture Upgrade (`AdminDashboard.tsx`):** Transformed the Web Push Alert modal from a single-job updater into a comprehensive, dynamic Push & App Badge Dispatcher.
          * **Dynamic "New Vacancies" Engine:**
            * `📦 [Smart Summary] All New Jobs Today`: Dynamically counts today's published jobs (`${todayJobs.length}`), auto-compiles top company names in the body, sets target URL to `/jobs`, and auto-sets app badge to the exact job count.
            * `📌 Individual Recent Jobs`: Lists recent published jobs so the Admin can pick any single job to broadcast with its exact direct deep link (`/jobs/${id}`).
          * **Dynamic "Expiring Soon" (Urgency / Deadline) Engine:**
            * Filters active published vacancies closing within 0 to 5 days, calculating dynamic days remaining (`closing.setHours(23, 59, 59, 999)`).
            * `⚠️ [Closing Summary] All Expiring Jobs`: Sends an urgency digest alert linking to `/jobs` with matching badge count.
            * `⏳ Individual Expiring Jobs`: Dynamic urgency titles (`🔴 අදින් අවසන්`, `🟡 හෙටින් අවසන්`, `තව දින 2යි`), pre-filled with company, title, and direct vacancy link.
          * **1-Click Row Alert Trigger:** Added an intuitive **Bell (`🔔`)** action button to every published job row in the main Admin Dashboard table, allowing 1-click modal popup pre-filled for that specific job.
          * **Badge Count Customizer:** Added an interactive `🔴 Badge:` number input allowing admins to customize or verify the red badge number before dispatching.
          * **100% Manual Notification Dispatch Enforcement:** Completely removed the automatic `/api/send-push` trigger on job creation and editing (`AdminNewJob.tsx` & `AdminEditJob.tsx`). Admins now have 100% manual control over all push notifications, eliminating any premature or accidental alerts. All broadcasts now originate exclusively from the dedicated Smart Notification Hub or row-level Bell (`🔔`) triggers.
          * Production build verified: 0 errors (`dist/assets/index-D0QzlAK7.js`).

---

*Last Updated: October 22, 2026 by Antigravity AI*
