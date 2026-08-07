# Aagaj Foundation - SEO Implementation & Strategy

This document outlines the complete MERN-stack Search Engine Optimization (SEO) setup, structured schemas, and dynamic XML sitemap generation implemented for the **Aagaj Foundation** website.

---

## 1. Dynamic Head Tag Management (Client-Side)

### Reusable Head SEO Component
* **File:** [SEO.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/components/SEO.jsx)
* A lightweight React component that utilizes `useEffect` to dynamically inject and update head metadata in the DOM:
  * **Document Title:** `<title>` tag for individual page identity.
  * **Meta Description & Keywords:** Core indexing tags.
  * **Canonical URL:** `<link rel="canonical" href="..." />` to avoid duplicate content penalties.
  * **Open Graph (Facebook / WhatsApp sharing):** `og:title`, `og:description`, `og:image`, `og:url`, and `og:type` tags.
  * **Twitter Cards:** `twitter:card` (summary large image), `twitter:title`, `twitter:description`, and `twitter:image`.
  * **JSON-LD Schema Script Blocks:** Injects standard dynamic schemas under `<script type="application/ld+json">` dynamically.

---

## 2. Dynamic JSON-LD Structured Schemas

We have injected rich schemas directly into the HTML header of corresponding pages to build trust and authority with search crawlers:

### A. Organization Schema (Home Page)
Provides Google Knowledge Graph indexing with:
* Alternate NGO names.
* Trust Logo and Founder references.
* Contact info (helpline phone & email).
* Address & registration details (NGO Darpan ID: `BR/2020/0260968`).
* Social profiles (`sameAs` handles: LinkedIn, Facebook, Instagram, YouTube, X).

### B. Local Business / NGO Schema (Home Page)
Promotes local indexing for the Patna office:
* Physical Address (Bhupatipur Road, Near Krishi Anusandhan Kendra, Patna).
* Coordinates: Latitude `25.5941` and Longitude `85.1376`.
* Office opening hours (Mon - Sat, 09:00 AM to 06:00 PM).
* Contact phone/email and office images.

### C. Person Schema (Founder Biography Page)
Details Vivek Kumar's role and connects him to the organization:
* Full name: **Vivek Kumar**.
* Job title: **Founder, AAGAJ Foundation**.
* Connects the founder entity to AAGAJ Foundation in the schema graph.
* References 4 formal WebP portrait URLs and personal social handles.

### D. WebSite SearchAction Schema (Home Page)
Exposes the Google Sitelinks Searchbox action mapping directly to the internal blog search path (`/blogs?search={query}`).

### E. FAQ Schema (Home Page)
Provides instant answers in search result cards for questions concerning:
* NGO Darpan Registration ID.
* NGO Founder & Co-Founder details.
* Healthcare services card eligibility.

### F. NewsArticle Schema (Blogs Page)
Automatically loaded when a single blog post is active. Passes crawled headline, datePublished, dynamic sliced description, author, and publisher parameters.

### G. Event Schema (Schemes Pages)
Maps structured calendar events detailing the ongoing Mahila Silayi training and Mahila Swarojgaar financial enterprise workshops.

### H. ImageObject Schema (Founder Page)
Identifies the license page, copyright notice, credit line, and creator metadata for the 4 WebP portrait assets.

### I. WebPage Schema (Automatic Fallback on All Pages)
Guarantees every page on the site exposes a compliant WebPage structure detailing name, description, and canonical URL.

### J. Breadcrumbs Schema (Inner Pages)
Injected on all structural child pages (`About`, `Gallery`, `Contact`, `Donate`, `NGO Careers`, `General Careers`, `Health Card`, `Verify Card`, `Book Appointment`, `Schemes Descriptions`, and `Blogs`) to map clear navigation paths to crawlers.

---

## 3. AI Search Optimization & Core Web Vitals

* **AI Search Engine Indexing (Google AI Overviews, ChatGPT, Perplexity, Gemini):**
  * Configured `<meta name="robots" content="index, follow" />` on all pages to ensure crawler bots are allowed to traverse site structures.
  * Extracted key registration metadata (NGO Darpan ID, 12A/80G status, founder name) and mapped them cleanly in plaintext headers and paragraphs for effortless scraper reading.
* **Core Web Vitals:**
  * Enabled `loading="lazy"` on all program and gallery images to boost page speeds and reduce Cumulative Layout Shift (CLS).
  * Provided descriptive `alt` attributes for all image assets to improve web accessibility.
  * Formatted images in compressed **WebP** formats.

---

## 4. Dynamic XML Sitemap Generator (Backend-Side)

An automated, dynamically updating sitemap has been exposed:
* **Backend Endpoint:** [app.js](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/server/src/app.js) (`GET /sitemap.xml`)
  * Dynamically compiles 18 static site paths.
  * Queries the MongoDB database in real-time for active blog articles (seeding default articles if empty).
  * Queries MongoDB for active gallery carousel images.
  * Formats and returns compliant XML with correct `changefreq`, `priority`, and `lastmod` date stamps.
* **Vercel Proxy Configuration:** [vercel.json](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/vercel.json)
  * Implemented a rewrite proxy that maps requests from the main domain `https://aagajfoundation.com/sitemap.xml` directly to the backend API hosting serverless sitemap without returning standard HTML index templates.

---

## 5. Modified & Integrated Pages

Metadata and `<SEO />` tags were added directly to:
1. **Home:** [Home.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/Home.jsx) (Organization & Local Business Schema)
2. **About Us:** [About.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/About.jsx)
3. **Founder Biography:** [Founder.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/Founder.jsx) (Person Schema & Organization Link)
4. **Photo Gallery:** [Gallery.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/Gallery.jsx)
5. **Contact Helpdesk:** [Contact.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/Contact.jsx)
6. **Online Donations:** [Donate.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/Donate.jsx)
7. **NGO Jobs Application:** [NGOJobs.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/NGOJobs.jsx)
8. **General Jobs Application:** [GeneralJobs.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/GeneralJobs.jsx)
9. **Health Card Registration:** [HealthCard.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/HealthCard.jsx)
10. **Verify Health Card:** [VerifyHealthCard.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/VerifyHealthCard.jsx)
11. **Book Hospital Appointment:** [Appointment.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/Appointment.jsx)
12. **Silayi Yojana Description:** [SilayiYojnaDescription.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/SilayiYojnaDescription.jsx)
13. **Swarojgaar Description:** [SwarojgaarDescription.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/SwarojgaarDescription.jsx)
14. **Membership Registration:** [MembershipRegister.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/MembershipRegister.jsx)
15. **Privacy Policy:** [Privacy.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/Privacy.jsx)
16. **Terms of Service:** [Terms.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/Terms.jsx)
17. **Dynamic Blog Feed:** [Blogs.jsx](file:///d:/COMPANY%20SOTWARE/Agaz/conversion/Aagaz-Conversion/client/src/pages/Blogs.jsx) (Dynamic tags matching active reading post)
