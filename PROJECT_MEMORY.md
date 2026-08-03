# JobNews.lk - Permanent Project Memory & Knowledge Base

> **Note to AI Assistants:** This document contains the single source of truth for the `JobNews.lk` codebase history, architectural decisions, completed features, and future plans. Always read this file upon starting a session to maintain 100% continuity.

---

## 1. Project Overview & Origins
* **Project Name:** JobNews.lk (Sri Lanka's Job Vacancy & Career Portal)
* **Initial Foundation:** Originally generated via `bolt.new` AI.
* **Full Development & Maintenance:** Iteratively expanded, debugged, and refined using Antigravity AI pair programmer.
* **Live Deployment:** GitHub Repository (`https://github.com/jobnews-lk/jobnews.git`) auto-deployed via **Vercel** (`https://jobnews.lk`).

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
2. **Custom Domain & SEO Optimization & Cross-Device Compatibility:**
   * Final verification of `jobnews.lk` custom domain routing and meta tag tuning.
   * **Cross-Browser Theme Compatibility (Fixed):** Added `<meta name="color-scheme" content="light dark" />` in `index.html`, `forced-color-adjust: none;` in `index.css`, and explicit `root.style.colorScheme` & `body` class toggles in `ThemeContext.tsx` to prevent Samsung Internet Browser and legacy Android browsers from forcibly locking the UI into dark mode. Guaranteed consistent default load behavior across PC, Laptop, Tablet, and Mobile based on user preference or OS system theme.

---

*Last Updated: 2026-08-03 by Antigravity AI*
