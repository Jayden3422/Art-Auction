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
  - [SEO Architecture](#seo-architecture)
  - [Public Crawlable Pages](#public-crawlable-pages)
  - [Sitemap and Robots Consistency](#sitemap-and-robots-consistency)
  - [SSR and Prerender Coverage](#ssr-and-prerender-coverage)
  - [SEO CI Gate](#seo-ci-gate)
  - [Search Console Monitor](#search-console-monitor)
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

This project keeps a Vue CLI SPA architecture while delivering crawlable HTML and enforceable SEO quality gates.

### SEO Architecture

- **Bot-oriented server rendering:** `backend/middleware/seoRender.js` returns full HTML for key landing routes.
- **SPA meta management:** `frontend/src/utils/seo.js` updates title, meta tags, canonical, and hreflang during client navigation.
- **Canonical URL normalization:** only `/home/detail/:id` is treated as canonical detail URL; legacy forms (`/home/detail?GOOD_ID=...`, `/home/details/:id`, `/home/details?GOOD_ID=...`) are redirected to canonical via `301`.
- **Strict frontend-route status policy:** production fallback serves `index.html` only for known SPA routes; unknown frontend paths return real `404` to reduce soft-404 risk.
- **Build-time prerender:** `frontend/vue.config.js` prerenders `/login` and `/signin` in production builds.
- **CI enforcement:** `.github/workflows/seo-gate.yml` runs both structural checks and Lighthouse CI.

### Public Crawlable Pages

- `backend/app.js` keeps frontend HTML routes public and whitelists SEO-related APIs while protected APIs still require token verification.
- Crawler-accessible endpoints include:
  - `GET /all/getAllGoods`
  - `GET /all/getAllNear`
  - `GET /all/getAllSale`
  - `GET /all/getAllEnd`
  - `GET /all/getGood/:id`
  - `GET /all/getPriceList/:id`
- `seoRender()` serves complete HTML (including `<h1>`, canonical, hreflang, and JSON-LD) for:
  - `/home/auction`
  - `/home/auction/upcoming`
  - `/home/auction/live`
  - `/home/auction/ended`
  - `/home/detail/:id`
- Frontend router provides explicit human-landing routes for:
  - `/home/auction/upcoming`, `/home/auction/live`, `/home/auction/ended`
  - `/home/detail/:id`
- `?__seo=1` (or request header `x-seo-render: 1`) can force SEO HTML output for validation.

### Sitemap and Robots Consistency

- `GET /robots.txt` is generated on the backend and always outputs an absolute sitemap URL:
  - `Sitemap: <SITE_URL>/all/sitemap.xml`
  - implemented through `resolveSiteUrl()` + `toAbsoluteUrl()`.
- `GET /all/sitemap.xml` generates canonical absolute URLs with:
  - landing pages: `/login`, `/signin`
  - listing pages: `/home/auction`, `/home/auction/upcoming`, `/home/auction/live`, `/home/auction/ended`
  - detail pages: `/home/detail/:id` from active inventory plus optional `SEO_HOT_DETAIL_IDS`
  - `hreflang` alternates (`en`, `zh`, `x-default`) and `lastmod` when available.
- Non-existing detail pages are rendered as true `404` responses.
- Unknown frontend routes are rendered as true `404` responses in production (not SPA shell `200` soft-404 behavior).

### SSR and Prerender Coverage

- Without migrating to Nuxt/Next, server-rendered SEO HTML is applied to high-impact organic entry pages:
  - auction listing page
  - category pages (`upcoming`, `live`, `ended`)
  - detail pages.
- Build-time prerender keeps `/login` and `/signin` as static HTML for faster first load.
- `ENABLE_PRERENDER=0` disables prerender in CI for deterministic builds.

### SEO CI Gate

- Workflow: `.github/workflows/seo-gate.yml`
- Structural gate script: `backend/scripts/seo-ci-gate.js` validates:
  - robots reachability and absolute sitemap directive
  - sitemap `<loc>` absolute URLs and required listing/category URLs
  - redirect hop limits and `404` probe behavior
  - canonical redirect behavior from legacy detail/query URLs to `/home/detail/:id`
  - unknown frontend route status (must return `404`)
  - JSON-LD existence and `schema.org` validity on listing/category/detail pages.
- Lighthouse CI config: `.lighthouserc.json`
  - audited URLs include `/login`, `/signin`, and SEO-rendered auction routes
  - enforced threshold: `categories:seo >= 0.9`.
- PR visibility:
  - workflow uploads `seo-ci.log` + `lhci.log` artifacts
  - workflow writes a markdown summary to the job summary
  - workflow posts/updates a sticky PR comment with SEO + Lighthouse result snapshot
  - merge is blocked when structural gate or Lighthouse gate fails

Local checks:

```bash
cd backend
npm run seo:ci
```

### Search Console Monitor

- Workflow: `.github/workflows/search-console-monitor.yml` (daily schedule + manual trigger)
- Script: `backend/scripts/search-console-monitor.js`
  - inspects sitemap URLs via Search Console URL Inspection API
  - tracks `Soft 404` and `Duplicate without user-selected canonical`
  - uploads markdown report artifact and fails the workflow when thresholds are exceeded
- Required secrets/variables for GitHub Actions:
  - `secrets.GSC_SERVICE_ACCOUNT_JSON` (service account JSON; this account must have access to the Search Console property)
  - `secrets.GSC_PROPERTY_URI` (for example `sc-domain:example.com` or `https://example.com/`)
  - `vars.SITE_URL` (public site URL used to resolve `/all/sitemap.xml`)
  - optional: `vars.GSC_MONITOR_MAX_URLS`, `vars.GSC_SOFT404_THRESHOLD`, `vars.GSC_DUPLICATE_THRESHOLD`, `vars.GSC_SITEMAP_URL`

Local run:

```bash
cd backend
npm run seo:gsc-monitor
```

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
