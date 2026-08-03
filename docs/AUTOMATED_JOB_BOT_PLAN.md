# Automated Job Hunting & Multi-Platform Auto-Poster System Plan

> **System Vision:** Build a 24/7 automated job discovery (Scraper) and multi-channel publishing bot (Facebook, WhatsApp, Telegram, Website) for `JobNews.lk`.

---

## Architecture Overview

```
                               ┌────────────────────────────────────────┐
                               │       AUTOMATED JOB HUNTER             │
                               │  (Scrapes Govt, Feeds, Career Pages)   │
                               └──────────────────┬─────────────────────┘
                                                  │
                                                  ▼
                               ┌────────────────────────────────────────┐
                               │   ADMIN DASHBOARD "PENDING QUEUE"      │
                               │   (Review, Edit & One-Click Approve)   │
                               └──────────────────┬─────────────────────┘
                                                  │
                                                  ▼
                               ┌────────────────────────────────────────┐
                               │    JOB PUBLISHED IN SUPABASE DB        │
                               └──────────────────┬─────────────────────┘
                                                  │
                ┌─────────────────────────────────┬────────────────────────────────┐
                ▼                                 ▼                                ▼
    ┌───────────────────────┐         ┌───────────────────────┐        ┌───────────────────────┐
    │  WEBSITE (JobNews.lk) │         │  FACEBOOK PAGE BOT    │        │ WHATSAPP CHANNEL BOT  │
    │ (Home, Ticker, Detail)│         │ (Graph API Auto-Post) │        │ (Channel Auto-Alerts) │
    └───────────────────────┘         └───────────────────────┘        └───────────────────────┘
```

---

## Phase 1: Multi-Platform Auto-Distributor Bot (Social Publishing & Zero Cost)
* **Goal:** Whenever a job is published on `JobNews.lk`, automatically broadcast it to social channels with zero monthly API fees (100% Free Lifetime).
* **1.1 Facebook Page Auto-Poster (`facebookAutoPoster.ts`):**
  * Connects via **Facebook Graph API** (`/v19.0/{page-id}/photos`) using Page Access Token & Page ID.
  * Automatically creates a rich photo post with Job Title, Company, Location, Auto-Dynamic Banner, and direct URL (`jobnews.lk/jobs/:id`).
* **1.2 WhatsApp Channel Auto-Distributor (`whatsappAutoPoster.ts`):**
  * Connects via WhatsApp Channel API / Webhook Integration to send instant alerts to all channel followers (100% free channel broadcasts).
  * Formatted WhatsApp message with emojis, vacancy summary, closing date, and direct link.
* **1.3 Admin Controls (`AdminJobForm.tsx` & `AdminDashboard.tsx`):**
  * Interactive checkboxes on creation/approval: `[x] Auto-Post to Facebook Page` & `[x] Auto-Post to WhatsApp Channel`.
  * Triggered upon publishing with full manual override control.

---

## Phase 2: Automated Job Hunter & Scraper (3-Type Job Categorization)
* **Goal:** 24/7 background worker that scrapes Sri Lankan job sources across 3 specific categories and auto-assigns tags.
* **2.1 Target Sources & Auto-Categorization:**
  1. **Government Jobs (`is_government = true`) & AI Gazette PDF Parser:**
     * Automatically downloads weekly Government Gazette PDFs (`documents.gov.lk`).
     * **AI Gazette Parser Engine:** Reads multi-page Gazette PDFs, extracts individual vacancy notices, parses Job Titles, Ministries, Qualifications, Age limits, Closing dates, and application addresses, and creates structured Draft Job Posts for each vacancy!
  2. **Private Sector Jobs (`is_private_sector = true`):**
     * Sri Lankan corporate career pages (Banks, IT, Telecom, Conglomerates), Newspaper classifieds.
  3. **Overseas Jobs (`is_overseas = true` & auto `country_id`):**
     * SLBFE approved foreign employment agencies & overseas vacancy portals (Dubai, Qatar, Japan, Korea, Romania, etc.).
* **2.2 Data Extraction Engine (1-to-1 Mapping with `AdminJobForm.tsx`):**
  * **Post Type (`post_type`):** Auto-selects `text`, `image`, or `pdf` based on scraped media.
  * **Job Classifications:** Auto-checks `is_government`, `is_private_sector`, or `is_overseas`.
  * **Basic Info:** `title`, `company`, `location`.
  * **Multilingual & Medium Auto-Tagging (`medium`):** Auto-detects document language (Sinhala, Tamil, English). Extracts specific language/medium requirements (e.g. *Sinhala Medium*, *Tamil Medium / தமிழ்*, *English Medium*, or *All Mediums*) and auto-attaches a clear Medium Badge to the post, website cards, and Facebook/WhatsApp captions!
  * **Strict Salary Extraction Policy (`salary`):** Extracts salary ONLY if explicitly stated in the source posting/gazette. NEVER guesses unstated salaries.
  * **Location & Category:** Auto-links `country_id` (Sri Lanka or Overseas country) and `category_id`.
  * **Dates:** Sets `posted_date` (today) and `closing_date` (extracted deadline).
  * **Apply Methods:** Auto-selects `online` (`apply_url`), `email` (`apply_email`), `in_person`, or `phone` (`apply_phone`).
  * **Content:** Extracted `description` and `requirements`.
  * **Files & Media:** Auto-attaches generated thumbnail (`thumbnail_url`) and auto-downloaded PDF (`official_pdf_url`).
* **2.3 Auto-Dynamic Job Banner Generator (Legal & Professional Thumbnails):**
  * Automatically generates high-resolution, copyright-safe Job Banner images for scraped jobs.
  * Custom JobNews.lk gradient template featuring auto-rendered Text: Company, Job Title, Country/Location, Closing Date, and JobNews.lk Watermark Badge.
  * Ensures 100% legal compliance (no copyright infringement) and maximum Facebook CTR engagement.
* **2.4 Duplicate Prevention:**
  * Hashes `title + company` and checks against existing `jobs` records to ensure zero duplicate entries.
* **2.5 Storage:**
  * Inserts new jobs into Supabase `jobs` table with `status = 'draft'` and `is_auto_scraped = true`.

---

## Phase 3: Admin Review Queue & One-Click Control (Mandatory Human Approval)
* **Goal:** A dedicated Admin Dashboard UI section so NO job is ever live without explicit Admin review and approval.
* **3.1 Draft/Pending Storage:**
  * All bot-discovered jobs are saved as `status = 'draft'` and `is_auto_scraped = true`.
  * **Zero Auto-Live:** The bot NEVER posts directly to the live website or social media automatically.
* **3.2 UI Components (`AdminDashboard.tsx`):**
  * New dedicated tab: **"🤖 Auto-Discovered Jobs (Pending Review)"**.
  * Shows preview cards of scraped jobs with generated thumbnails, apply URLs/emails, and details.
  * Action Buttons: `[Edit]`, `[Approve & Publish]`, and `[Delete / Reject]`.
* **3.3 One-Click Approval & Multi-Publishing:**
  * Admin clicks `Approve & Publish`.
  * Only upon explicit click, status changes to `published` -> Website updates + Facebook Page & WhatsApp Channel auto-posts!

---

*Document Created: 2026-08-02 by Antigravity AI*
