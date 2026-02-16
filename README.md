# Art Auction Platform

**English** | [中文](README.zh.md)

A full-stack online art auction platform built with **Vue 3** and **Express.js**, featuring real-time WebSocket bidding, role-based access control, engineering-level SEO for single-page applications, and data visualization with PDF export.

## Table of Contents

- [Project Overview](#project-overview)
  - [Key Points](#key-points)
  - [Tech Stack](#tech-stack)
- [Installation and Setup](#installation-and-setup)
- [Key Features](#key-features)
  - [Internationalization (i18n)](#internationalization-i18n)
  - [RESTful API Design](#restful-api-design)
  - [Real-Time Auction Module](#real-time-auction-module)
  - [Data Statistics & PDF Export](#data-statistics--pdf-export)
- [SEO Engineering](#seo-engineering)
  - [Challenge: SEO for a Vue SPA](#challenge-seo-for-a-vue-spa)
  - [Recent SEO Implementation Updates (2026-02)](#recent-seo-implementation-updates-2026-02)
  - [Architecture Overview](#architecture-overview)
  - [Backend SEO Infrastructure](#backend-seo-infrastructure)
  - [Frontend Dynamic Meta Management](#frontend-dynamic-meta-management)
  - [Structured Data (JSON-LD)](#structured-data-json-ld)
  - [Internationalization SEO (hreflang)](#internationalization-seo-hreflang)
  - [Prerendering Strategy](#prerendering-strategy)
  - [Crawlability & Indexing Control](#crawlability--indexing-control)
- [Testing](#testing)
- [System Architecture](#system-architecture)
- [Functional Modules](#functional-modules)
  - [Registration & Login](#registration--login)
  - [Artwork Publishing](#artwork-publishing)
  - [Personal Information Management](#personal-information-management)
  - [User Management (Admin)](#user-management-admin)
  - [Order Management](#order-management)
  - [Notification Management](#notification-management)
  - [Product Management (Admin)](#product-management-admin)

---

## Project Overview

An online art auction platform that provides a secure and efficient space for art trading. Users can browse, bid on, and purchase artworks across categories including paintings, calligraphy, ceramics, sculptures, metalwork, and rare stones.

### Key Points

- JWT-based authentication with role-based permission control (buyer / seller / admin)
- Real-time bidding via WebSocket with bid validation and auto-lock at auction end
- Full auction lifecycle: upcoming → active → completed → order fulfillment
- Admin dashboard with user, product, order, and notification management
- Data visualization (ECharts) with PDF report export (html2canvas + jsPDF + Web Workers)
- Bilingual support (English / Chinese) via vue-i18n
- Engineering-level SEO optimized for search engine crawlability in a Vue SPA

### Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Vue 3, Vue Router 4, Vuex 4, Ant Design Vue, Less |
| Backend | Node.js 20, Express.js, WebSocket |
| Database | MongoDB |
| SEO | Custom DOM-based meta management, JSON-LD, dynamic sitemap, prerendering |
| Testing | Jest, supertest |
| DevOps | Aliyun OSS (image hosting), compression (gzip), Content-Security-Policy |
| Visualization | ECharts, html2canvas, jsPDF, Web Workers |

## Installation and Setup

### Prerequisites

- Node.js 20+
- MongoDB running locally (default: `mongodb://localhost:27017/`)

### Backend

```bash
cd backend
cp .env.sample .env     # Edit with your MongoDB, JWT, OSS, and site URL settings
npm install
npm run dev             # Development
npm start               # Production
```

**Environment variables** (`.env`):
| Variable | Purpose |
|----------|---------|
| `APP_PORT` | Express server port (default: 3000) |
| `WS_PORT` | WebSocket server port (default: 3001) |
| `TRUST_PROXY` | Express proxy trust setting for correct client IP detection behind reverse proxies (e.g. `1`, `true`, `loopback`) |
| `MONGO_URL` | MongoDB connection string |
| `JWT_SALT` | JWT signing secret |
| `SITE_URL` | Public site URL for sitemap generation |
| `OSS_*` | Aliyun OSS credentials for image storage |

### Frontend

```bash
cd frontend
cp .env.sample .env     # Set ports and optional GSC verification code
npm install
npm run serve           # Development
npm run build           # Production (includes prerendering)
```

### Database

```bash
# Seed MongoDB with initial structure and sample data
node data/liujinqi.js
```

---

## Key Features

### Internationalization (i18n)

Configured with **vue-i18n**. Default language is English with Chinese as the secondary language. Language files are located at `frontend/src/locales/en.js` and `frontend/src/locales/zh.js`. A language toggle is available in the page header.

### RESTful API Design

Axios is encapsulated in `frontend/src/utils/` to provide a clean RESTful interface using standard HTTP methods (GET, POST, PUT, DELETE). The API layer handles request/response transformation, error handling, and token injection.

### Real-Time Auction Module

The auction module implements real-time bidding through **WebSocket** (`frontend/src/ws/`), enabling:

- Live bid updates visible to all connected users simultaneously
- Bid validation: rejects bids below the starting price or current highest bid + increment
- Duplicate bid prevention per user
- Automatic lock when the auction end time is reached
- Order generation for the winning bidder

**Auction lifecycle:** Upcoming (preview & follow) → Active (real-time bidding) → Completed (view results & order history)

<img src="README.assets/Artwork auction module timing diagram.png" alt="Auction module timing diagram" style="zoom: 90%;" />

| View | Screenshot |
|------|-----------|
| Buyer - Upcoming | ![Upcoming](README.assets/Snipaste_2025-09-05_21-55-07.png) |
| Buyer - Completed | ![Completed](README.assets/Snipaste_2025-09-05_21-55-22.png) |
| Buyer - Active bidding | ![Active](README.assets/Snipaste_2025-09-05_21-56-29.png) |
| Bid below minimum (red warning) | ![Below min](README.assets/Snipaste_2025-09-05_21-56-35.png) |
| Real-time multi-user bids | ![Multi-user](README.assets/Snipaste_2025-09-05_21-57-10.png) |
| Auto-lock at end time | ![Locked](README.assets/Snipaste_2025-09-05_22-16-08.png) |
| Winner & order generated | ![Winner](README.assets/Snipaste_2025-09-05_22-17-08.png) |
| Admin - Auction overview | ![Admin](README.assets/Snipaste_2025-09-05_21-09-17.png) |

### Data Statistics & PDF Export

Uses **ECharts** to render line charts, pie charts, and histograms for auction trend analysis across art categories.

**PDF export** is implemented with `html2canvas` + `jsPDF` + **Web Workers**:
- Pages are split into DOM segments to avoid browser canvas height limits
- Each segment is rendered to canvas, then merged into a single PDF
- Elements at page boundaries are handled via a special class that treats them as atomic blocks to prevent mid-element truncation

<img src="README.assets/Data statistics module timing diagram.png" alt="Data statistics module timing diagram" style="zoom:50%;" />

| Visualization | Screenshot |
|---------------|-----------|
| Trend analysis | ![Trends](README.assets/Snipaste_2025-09-05_21-36-08.png) |
| Category breakdown | ![Categories](README.assets/Snipaste_2025-09-05_21-39-09.png) |
| Detailed stats | ![Stats](README.assets/Snipaste_2025-09-05_21-39-30.png) |
| Exported PDF report | ![PDF](README.assets/report-pdf.png) |

![Page cutting principle](README.assets/Page cutting principle.png)

---

## SEO Engineering

### Challenge: SEO for a Vue SPA

Single-page applications are inherently difficult for search engines to crawl. The entire UI is rendered client-side via JavaScript, meaning crawlers see an empty `<div id="app">` on initial page load. Traditional solutions involve migrating to SSR (Nuxt.js) or SSG, which require significant architectural changes.

**My approach:** Implement a multi-layer SEO system *without* migrating away from Vue CLI, using a combination of backend infrastructure, client-side dynamic meta management, structured data injection, and selective prerendering.

### Recent SEO Implementation Updates (2026-02)

- Public listing/detail endpoints are explicitly whitelisted by method/path in `backend/app.js` so SEO routes remain open while protected APIs still require tokens.
- Added `GET /all/getPriceList/:id` to pair with `GET /all/getGood/:id` for crawler-accessible detail data.
- Added bot logger middleware (`backend/middleware/botLogger.js`) for crawl observability.
- Added dynamic rendering middleware + production static serving fallback (`backend/middleware/dynamicRender.js`) for bot-friendly HTML delivery.
- Removed auth requirement from public content routes and made `Home.vue` / `Auction.vue` resilient to anonymous sessions.
- Switched detail pages from POST to GET for item and price-list retrieval.
- Added `buildBreadcrumbJsonLd` and injected BreadcrumbList JSON-LD on detail pages.
- Added crawlable `<a>` links in goods cards, plus image width/height and semantic heading hierarchy for stronger crawl/render signals.
- Added SEO health-check script: `npm run seo:health` in `backend`.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SEO Architecture                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Backend (Express.js)                                       │
│  ├── gzip compression (compression middleware)              │
│  ├── Security headers (CSP, X-Content-Type-Options)         │
│  ├── GET /all/getGood/:id — crawler-accessible endpoint     │
│  ├── GET /all/sitemap.xml — dynamic XML sitemap from DB     │
│  └── 404 catch-all with proper status code                  │
│                                                             │
│  Frontend (Vue 3)                                           │
│  ├── Router guard → updateRouteMeta() on every navigation   │
│  │   ├── document.title                                     │
│  │   ├── <meta> description, keywords, og:*, twitter:*      │
│  │   ├── <link rel="canonical">                             │
│  │   └── <link rel="alternate" hreflang="...">              │
│  ├── Detail pages → dynamic Product JSON-LD                 │
│  ├── Listing pages → ItemList JSON-LD                       │
│  ├── App-level → WebSite + Organization JSON-LD             │
│  ├── 404 catch-all route with noindex meta                  │
│  └── Prerendering (/login, /signin) at build time           │
│                                                             │
│  Static Assets                                              │
│  ├── robots.txt — auth-only pages blocked                   │
│  ├── index.html — foundation meta + OG + Twitter Card       │
│  └── .env — GSC verification, site URL config               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Backend SEO Infrastructure

**File:** `backend/app.js`, `backend/routers/all.js`

1. **Gzip compression** — `compression` middleware reduces response sizes, improving page speed (a ranking factor).

2. **Security headers** — Content-Security-Policy, X-Content-Type-Options, X-Frame-Options applied to all responses. Modern CSP replaces the deprecated X-XSS-Protection header.

3. **Crawler-accessible GET endpoint** — Converted the POST-only `/all/getGood` to also support `GET /all/getGood/:id`, allowing search engine crawlers to access individual item data without requiring a POST body.

4. **Dynamic XML sitemap** (`GET /all/sitemap.xml`) — Queries MongoDB for all active and upcoming auction items, generates a standards-compliant XML sitemap with:
   - `<lastmod>` timestamps
   - `<xhtml:link rel="alternate" hreflang="...">` for each URL (en, zh, x-default)
   - Only includes canonical, indexable URLs (excludes ended/discontinued items)

5. **404 catch-all** — After all route definitions, a catch-all middleware returns `404` status with a JSON response body, ensuring crawlers receive proper HTTP status codes for non-existent routes.

### Frontend Dynamic Meta Management

**File:** `frontend/src/utils/seo.js` — A zero-dependency utility module (~220 lines) that manages all SEO concerns via direct DOM manipulation.

**Why no external library?** Libraries like `@unhead/vue` add bundle size and complexity. Since the project uses Vue CLI (not Nuxt), native `document.querySelector` + `document.createElement` provides full control with no dependencies.

Key functions:

| Function | Purpose |
|----------|---------|
| `setMetaTag(attr, key, content)` | Creates or updates any `<meta>` tag |
| `setCanonicalUrl(path)` | Sets `<link rel="canonical">` to prevent duplicate content |
| `setHreflang(path)` | Sets bidirectional `<link rel="alternate" hreflang>` for en/zh/x-default |
| `updateRouteMeta(meta, fullPath, path)` | Called in router `beforeEach` guard — updates title, description, keywords, OG tags, canonical, and hreflang on every navigation |

**Router integration** (`main.js`): Every route in `router/index.js` carries `meta: { title, description, keywords }`. The `beforeEach` guard calls `updateRouteMeta()` to update all meta tags before each page renders.

### Structured Data (JSON-LD)

Injects Schema.org structured data to enable Google Rich Results:

| Schema | Location | Purpose |
|--------|----------|---------|
| **Product + Offer** | Detail page (`Detail.vue`, `DetailS.vue`) | Individual auction items with price, availability (4-state: PreOrder/InStock/SoldOut/Discontinued), seller, SKU, availability window |
| **WebSite** | App.vue (mounted) | Site-level identity for search engines |
| **Organization** | App.vue (mounted) | Organization info for Knowledge Panel |
| **ItemList** | GoodsList.vue | Auction listing page with up to 50 items, enabling carousel/list rich results |

**Product availability logic** maps auction state to Schema.org enums:
```
Auction not started  → schema.org/PreOrder
Auction active       → schema.org/InStock + availabilityEnds
Auction ended (sold) → schema.org/SoldOut
Auction ended (unsold) → schema.org/Discontinued
```

### Internationalization SEO (hreflang)

Bidirectional hreflang annotations tell search engines about language variants:

- **Client-side:** `setHreflang(path)` dynamically injects `<link rel="alternate" hreflang="en|zh|x-default">` on every route change
- **Sitemap:** Each URL entry includes `<xhtml:link>` alternates for all language variants
- **index.html:** Default hreflang links present in static HTML as fallback
- **Google Search Console:** Verification meta tag configurable via `VUE_APP_GSC_VERIFICATION` environment variable

### Prerendering Strategy

**File:** `frontend/vue.config.js`

For public landing pages (`/login`, `/signin`), uses `@prerenderer/webpack-plugin` with Puppeteer to generate static HTML at build time. This gives crawlers fully rendered HTML for key entry points without requiring SSR infrastructure.

```js
// Production builds only — gracefully degrades if Puppeteer is unavailable
if (isProduction) {
  new PrerendererWebpackPlugin({
    routes: ['/login', '/signin'],
    renderer: '@prerenderer/renderer-puppeteer',
    rendererOptions: { renderAfterTime: 5000, headless: true }
  })
}
```

### Crawlability & Indexing Control

- **robots.txt** — Blocks only authenticated management pages (admin panels, personal settings, order history). All public pages are crawlable.
- **404 page** (`NotFound.vue`) — Catch-all route renders a user-friendly 404 with `<meta name="robots" content="noindex, nofollow">` to prevent indexing.
- **Image accessibility** — All `<img>` tags include `:alt` attributes bound to item names and `loading="lazy"` for performance.

---

## Testing

Backend uses **Jest** + **supertest**:

```bash
cd backend
npm test
```

SEO surface checks:

```bash
cd backend
npm run seo:health
# Optional frontend route checks (requires production static serving):
# SEO_CHECK_FRONTEND=1 npm run seo:health
```

All test files are in `backend/__tests__/`.

| Test File | Coverage |
|-----------|----------|
| `rate-limit.test.js` | Rate limiting middleware — verifies 429 after threshold |
| `judge.test.js` | Input validation (phone, email, date, QQ, WeChat) |
| `base64.test.js` | Base64 encode/decode round-trip |
| `md5.test.js` | MD5 hash determinism and salt differentiation |
| `token.test.js` | JWT creation, verification, expiry |
| `promise.test.js` | `isFine()` utility for Promise result handling |
| `middleware.test.js` | CORS headers, OPTIONS handling, token auth |

---

## System Architecture

Permission-based architecture with JWT tokens:
1. User permissions are resolved from a database permission dictionary based on user ID
2. Backend uses the `mongodb` driver for CRUD operations
3. Frontend communicates with backend via Axios over RESTful HTTP
4. JWT tokens encode role and permission IDs; the frontend router guard checks `pids` before granting page access

<img src="README.assets/System architecture diagram.jpg" alt="System architecture diagram" style="zoom:50%;" />

---

## Functional Modules

The platform is divided into a **user-facing side** (buyer + seller interfaces) and an **admin management system**.

![Overall functional module diagram](README.assets/Overall functional module diagram.png)

### Registration & Login

Users register with username, email, phone, and password. Login validates credentials against the database and issues a JWT. A canvas-drawn CAPTCHA (`frontend/src/components/Identify.vue`) with interference lines prevents automated submissions.

<img src="README.assets/Registration and login sequence diagram.png" alt="Registration and login sequence diagram" style="zoom:50%;" />

| Screenshot |
|-----------|
| ![Login](README.assets/Snipaste_2025-09-05_20-58-59.png) |
| ![Register](README.assets/Snipaste_2025-09-05_20-59-53.png) |
| ![Captcha examples](README.assets/image-20250906013936314.png) |

### Artwork Publishing

Sellers submit artwork details (title, description, starting price, images). Submissions go through admin review for legality and authenticity before being published.

<img src="README.assets/Artwork publishing module timing diagram.png" alt="Artwork publishing sequence diagram" style="zoom:50%;" />

![Publishing form](README.assets/Snipaste_2025-09-05_22-23-33.png)

### Personal Information Management

Users can view and edit profile information, change passwords, and upload avatars.

<img src="README.assets/Personal Information Management Sequence Diagram.png" alt="Personal Information Management Sequence Diagram" style="zoom:50%;" />

| ![Profile view](README.assets/Snipaste_2025-09-05_22-00-28.png) | ![Profile edit](README.assets/Snipaste_2025-09-05_22-00-38.png) |
|---|---|

### User Management (Admin)

Administrators can add, delete, and modify user accounts.

<img src="README.assets/User management module timing diagram.png" alt="User management sequence diagram" style="zoom:50%;" />

| ![User list](README.assets/Snipaste_2025-09-05_21-43-06.png) | ![User detail](README.assets/Snipaste_2025-09-05_21-43-11.png) |
|---|---|

### Order Management

Orders are categorized by status: pending, processing, and completed. Buyers fill in shipping info after winning; sellers confirm and ship; buyers confirm receipt.

<img src="README.assets/Order management module sequence diagram.png" alt="Order management sequence diagram" style="zoom:50%;" />

| Stage | Screenshot |
|-------|-----------|
| Buyer fills shipping info | ![Shipping](README.assets/Snipaste_2025-09-05_22-19-49.png) |
| Seller ships | ![Ship](README.assets/Snipaste_2025-09-05_22-22-00.png) |
| Order tracking | ![Tracking](README.assets/Snipaste_2025-09-05_22-22-24.png) |
| Buyer confirms receipt | ![Confirm](README.assets/Snipaste_2025-09-05_22-22-45.png) |

### Notification Management

Administrators create and push notifications (e.g., new artwork uploads). All users can view the notification feed.

<img src="README.assets/Notification management module timing diagram.png" alt="Notification management sequence diagram" style="zoom:50%;" />

| ![Admin notifications](README.assets/Snipaste_2025-09-05_21-16-26.png) | ![User notifications](README.assets/Snipaste_2025-09-05_22-00-49.png) |
|---|---|

### Product Management (Admin)

Administrators manage artworks: publish, edit, delete, set auction times and rules. Products are filterable by auction status and category.

<img src="README.assets/Product management module sequence diagram.png" alt="Product management sequence diagram" style="zoom:50%;" />

| ![By status](README.assets/Snipaste_2025-09-05_21-11-55.png) | ![By category](README.assets/Snipaste_2025-09-05_21-15-21.png) |
|---|---|
