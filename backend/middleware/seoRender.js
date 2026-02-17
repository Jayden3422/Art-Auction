import { findPro, findSort } from '../tools/Mongo.js';
import { BOT_USER_AGENTS } from './botLogger.js';
import { resolveSiteUrl, toAbsoluteUrl } from '../tools/seoSite.js';

const BOT_PATTERN = new RegExp(BOT_USER_AGENTS.join('|'), 'i');
const CATEGORY_ORDER = ['upcoming', 'live', 'ended'];
const CATEGORY_META = {
    all: {
        title: 'Art Auction Listings',
        description: 'Browse upcoming, live, and ended art auctions from Jayden Art Auction.'
    },
    upcoming: {
        title: 'Upcoming Art Auctions',
        description: 'Discover upcoming art auctions and preview lots before bidding starts.'
    },
    live: {
        title: 'Live Art Auctions',
        description: 'Browse currently active art auctions and place bids in real time.'
    },
    ended: {
        title: 'Ended Art Auctions',
        description: 'Review recently ended art auctions and final bidding results.'
    }
};

function isHtmlNavigationRequest(req) {
    const accept = req.headers.accept || '';
    return req.method === 'GET' && (accept.includes('text/html') || accept.includes('*/*') || !accept);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function jsonForScript(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c');
}

function mapCategoryFromRequest(req) {
    const pathname = req.path || '';
    if (pathname.startsWith('/home/auction/upcoming')) {
        return 'upcoming';
    }
    if (pathname.startsWith('/home/auction/live')) {
        return 'live';
    }
    if (pathname.startsWith('/home/auction/ended')) {
        return 'ended';
    }

    const queryCategory = String(req.query.category || '').toLowerCase();
    if (CATEGORY_ORDER.includes(queryCategory)) {
        return queryCategory;
    }

    const state = String(req.query.state || '');
    if (state === '0') {
        return 'upcoming';
    }
    if (state === '1') {
        return 'live';
    }
    if (state === '2') {
        return 'ended';
    }
    return 'all';
}

function canonicalPathForCategory(category) {
    if (category === 'upcoming') return '/home/auction/upcoming';
    if (category === 'live') return '/home/auction/live';
    if (category === 'ended') return '/home/auction/ended';
    return '/home/auction';
}

function normalizeDateText(value) {
    const parsed = value ? new Date(value) : null;
    if (!parsed || Number.isNaN(parsed.valueOf())) {
        return '';
    }
    return parsed.toISOString();
}

function normalizeMoney(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) {
        return '0';
    }
    return num.toFixed(2).replace(/\.00$/, '');
}

function getAuctionState(good) {
    const now = new Date();
    const startTime = new Date(good.START_TIME);
    const endTime = new Date(good.END_TIME);
    if (good.GOOD_STATE) {
        return 'unsold';
    }
    if (Number.isFinite(endTime.valueOf()) && endTime < now) {
        return 'sold';
    }
    if (Number.isFinite(startTime.valueOf()) && startTime > now) {
        return 'upcoming';
    }
    return 'live';
}

function buildAuctionItemUrl(siteUrl, goodId) {
    return toAbsoluteUrl(siteUrl, `/home/detail/${goodId}`);
}

function buildItemListJsonLd(items, siteUrl, category) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: CATEGORY_META[category].title,
        numberOfItems: items.length,
        itemListElement: items.slice(0, 50).map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: buildAuctionItemUrl(siteUrl, item.GOOD_ID),
            item: {
                '@type': 'Product',
                name: item.NAME || `Artwork #${item.GOOD_ID}`,
                image: item.IMG_URL || '',
                description: item.INTRODUCTION || '',
                offers: {
                    '@type': 'Offer',
                    priceCurrency: 'CNY',
                    price: Number(item.PRICE || item.UPSET_PRICE || 0),
                    availability: `https://schema.org/${getAvailabilityState(item)}`
                }
            }
        }))
    };
}

function getAvailabilityState(good) {
    const state = getAuctionState(good);
    if (state === 'upcoming') return 'PreOrder';
    if (state === 'live') return 'InStock';
    if (state === 'sold') return 'SoldOut';
    return 'Discontinued';
}

function buildDetailJsonLd(good, siteUrl) {
    const canonicalUrl = buildAuctionItemUrl(siteUrl, good.GOOD_ID);
    const availability = `https://schema.org/${getAvailabilityState(good)}`;
    const startTime = normalizeDateText(good.START_TIME);
    const endTime = normalizeDateText(good.END_TIME);
    const offer = {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'CNY',
        price: Number(good.PRICE || good.UPSET_PRICE || 0),
        availability
    };
    if (startTime) {
        offer.validFrom = startTime;
    }
    if (endTime && availability === 'https://schema.org/InStock') {
        offer.availabilityEnds = endTime;
    }

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: good.NAME || `Artwork #${good.GOOD_ID}`,
        image: good.IMG_URL || '',
        description: good.INTRODUCTION || '',
        sku: String(good.GOOD_ID || ''),
        url: canonicalUrl,
        brand: {
            '@type': 'Brand',
            name: good.ARTIST || 'Unknown Artist'
        },
        offers: offer
    };
}

function buildBreadcrumbJsonLd(good, siteUrl) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Auction Listings',
                item: toAbsoluteUrl(siteUrl, '/home/auction')
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: good.NAME || `Artwork #${good.GOOD_ID}`,
                item: buildAuctionItemUrl(siteUrl, good.GOOD_ID)
            }
        ]
    };
}

function renderDocument({ siteUrl, title, description, canonicalPath, bodyHtml, jsonLd, noindex = false }) {
    const canonicalUrl = toAbsoluteUrl(siteUrl, canonicalPath);
    const escapedTitle = escapeHtml(`${title} - Jayden Art Auction`);
    const escapedDescription = escapeHtml(description);
    const robots = noindex ? 'noindex, nofollow' : 'index, follow';
    const jsonLdScripts = (jsonLd || [])
        .map((item) => `<script type="application/ld+json">${jsonForScript(item)}</script>`)
        .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapedTitle}</title>
  <meta name="description" content="${escapedDescription}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" hreflang="en" href="${canonicalUrl}?lang=en">
  <link rel="alternate" hreflang="zh" href="${canonicalUrl}?lang=zh">
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; color: #1f2937; background: #f8fafc; }
    main { max-width: 1080px; margin: 0 auto; padding: 24px; }
    h1 { margin: 0 0 12px; font-size: 32px; line-height: 1.2; }
    h2 { margin: 28px 0 12px; font-size: 22px; }
    p { margin: 0 0 12px; line-height: 1.6; }
    .section { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
    .nav { display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 16px; }
    .nav a { color: #0369a1; text-decoration: none; font-weight: 600; }
    .items { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
    .items li { border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
    .items li:last-child { border-bottom: none; padding-bottom: 0; }
    .detail-grid { display: grid; gap: 18px; grid-template-columns: minmax(260px, 360px) 1fr; }
    .detail-grid img { width: 100%; height: auto; border-radius: 8px; border: 1px solid #e2e8f0; }
    .meta dt { font-weight: 700; margin-top: 8px; }
    .meta dd { margin: 0 0 6px; }
    .muted { color: #64748b; }
    .price-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .price-table th, .price-table td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    @media (max-width: 840px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
  </style>
  ${jsonLdScripts}
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

async function safeFindSort(collection, query, sortBy) {
    try {
        const rows = await findSort(collection, query, sortBy);
        return Array.isArray(rows) ? rows : [];
    } catch (error) {
        return [];
    }
}

async function safeFindOneGood(goodId) {
    try {
        const rows = await findPro('goods', { GOOD_ID: goodId });
        if (!Array.isArray(rows) || rows.length === 0) {
            return null;
        }
        return rows[0];
    } catch (error) {
        return null;
    }
}

function renderSectionList(items, siteUrl) {
    if (!items.length) {
        return '<p class="muted">No auction items are currently available in this category.</p>';
    }
    const list = items.slice(0, 100).map((good) => {
        const name = escapeHtml(good.NAME || `Artwork #${good.GOOD_ID}`);
        const description = escapeHtml(good.INTRODUCTION || '');
        const state = getAuctionState(good);
        const stateText = state === 'upcoming'
            ? 'Upcoming'
            : state === 'live'
                ? 'Live'
                : state === 'sold'
                    ? 'Ended (Sold)'
                    : 'Ended (Unsold)';
        const detailUrl = buildAuctionItemUrl(siteUrl, good.GOOD_ID);
        const startAt = normalizeDateText(good.START_TIME);
        const endAt = normalizeDateText(good.END_TIME);
        return `<li>
  <h3><a href="${detailUrl}">${name}</a></h3>
  <p>${description}</p>
  <p class="muted">Status: ${stateText} | Start: ${escapeHtml(startAt || '-')} | End: ${escapeHtml(endAt || '-')}</p>
</li>`;
    }).join('\n');
    return `<ul class="items">${list}</ul>`;
}

async function renderAuctionListingPage(req, res) {
    const siteUrl = resolveSiteUrl(req);
    const category = mapCategoryFromRequest(req);
    const now = new Date();

    const [upcoming, live, ended] = await Promise.all([
        safeFindSort('goods', { START_TIME: { $gt: now } }, { START_TIME: 1 }),
        safeFindSort('goods', { START_TIME: { $lte: now }, END_TIME: { $gt: now } }, { END_TIME: 1 }),
        safeFindSort('goods', { END_TIME: { $lte: now } }, { END_TIME: -1 })
    ]);

    const grouped = { upcoming, live, ended };
    const sections = category === 'all' ? CATEGORY_ORDER : [category];
    const allItems = category === 'all' ? [...upcoming, ...live, ...ended] : grouped[category] || [];
    const canonicalPath = canonicalPathForCategory(category);

    const sectionHtml = sections.map((key) => {
        const heading = key === 'upcoming' ? 'Upcoming Auctions' : key === 'live' ? 'Live Auctions' : 'Ended Auctions';
        return `<section class="section">
  <h2>${heading}</h2>
  ${renderSectionList(grouped[key] || [], siteUrl)}
</section>`;
    }).join('\n');

    const bodyHtml = `<main class="seo-page seo-auction">
  <h1>${escapeHtml(CATEGORY_META[category].title)}</h1>
  <p>${escapeHtml(CATEGORY_META[category].description)}</p>
  <nav class="nav" aria-label="Auction categories">
    <a href="${toAbsoluteUrl(siteUrl, '/home/auction')}">All</a>
    <a href="${toAbsoluteUrl(siteUrl, '/home/auction/upcoming')}">Upcoming</a>
    <a href="${toAbsoluteUrl(siteUrl, '/home/auction/live')}">Live</a>
    <a href="${toAbsoluteUrl(siteUrl, '/home/auction/ended')}">Ended</a>
  </nav>
  ${sectionHtml}
</main>`;

    const html = renderDocument({
        siteUrl,
        title: CATEGORY_META[category].title,
        description: CATEGORY_META[category].description,
        canonicalPath,
        bodyHtml,
        jsonLd: [
            buildItemListJsonLd(allItems, siteUrl, category)
        ]
    });

    res.status(200).type('html').send(html);
}

function parseGoodIdFromRequest(req) {
    const routeMatch = (req.path || '').match(/^\/home\/detail\/(\d+)\/?$/);
    if (routeMatch) {
        return Number(routeMatch[1]);
    }
    const queryId = Number(req.query.GOOD_ID);
    if (Number.isInteger(queryId) && queryId > 0) {
        return queryId;
    }
    return null;
}

async function renderAuctionDetailPage(req, res) {
    const siteUrl = resolveSiteUrl(req);
    const goodId = parseGoodIdFromRequest(req);
    if (!goodId) {
        const html = renderDocument({
            siteUrl,
            title: 'Item Not Found',
            description: 'The requested auction item could not be found.',
            canonicalPath: '/home/detail',
            bodyHtml: '<main><h1>Item Not Found</h1><p class="muted">Invalid auction item ID.</p></main>',
            noindex: true
        });
        res.status(404).type('html').send(html);
        return;
    }

    const good = await safeFindOneGood(goodId);
    if (!good) {
        const html = renderDocument({
            siteUrl,
            title: 'Item Not Found',
            description: 'The requested auction item could not be found.',
            canonicalPath: `/home/detail/${goodId}`,
            bodyHtml: `<main><h1>Item Not Found</h1><p class="muted">No item matches ID ${goodId}.</p></main>`,
            noindex: true
        });
        res.status(404).type('html').send(html);
        return;
    }

    const priceRows = await safeFindSort('price_info', { GOOD_ID: goodId }, { TIME: -1 });
    const bidsHtml = priceRows.length
        ? `<table class="price-table">
  <thead><tr><th>Bidder</th><th>Price (CNY)</th><th>Time</th></tr></thead>
  <tbody>
    ${priceRows.slice(0, 30).map((row) => `<tr><td>${escapeHtml(row.BUYR_ID || '-')}</td><td>${escapeHtml(normalizeMoney(row.PRICE))}</td><td>${escapeHtml(normalizeDateText(row.TIME) || '-')}</td></tr>`).join('\n')}
  </tbody>
</table>`
        : '<p class="muted">No bids have been recorded for this lot yet.</p>';

    const canonicalPath = `/home/detail/${goodId}`;
    const bodyHtml = `<main class="seo-page seo-detail">
  <h1>${escapeHtml(good.NAME || `Artwork #${goodId}`)}</h1>
  <div class="section detail-grid">
    <div>
      <img src="${escapeHtml(good.IMG_URL || '')}" alt="${escapeHtml(good.NAME || `Artwork #${goodId}`)}" loading="eager">
    </div>
    <div>
      <p>${escapeHtml(good.INTRODUCTION || 'No description available.')}</p>
      <dl class="meta">
        <dt>Artist</dt><dd>${escapeHtml(good.ARTIST || 'Unknown Artist')}</dd>
        <dt>Starting Price</dt><dd>CNY ${escapeHtml(normalizeMoney(good.UPSET_PRICE))}</dd>
        <dt>Current Price</dt><dd>CNY ${escapeHtml(normalizeMoney(good.PRICE || good.UPSET_PRICE))}</dd>
        <dt>Auction Status</dt><dd>${escapeHtml(getAuctionState(good))}</dd>
        <dt>Start Time</dt><dd>${escapeHtml(normalizeDateText(good.START_TIME) || '-')}</dd>
        <dt>End Time</dt><dd>${escapeHtml(normalizeDateText(good.END_TIME) || '-')}</dd>
        <dt>Lot ID</dt><dd>${escapeHtml(goodId)}</dd>
      </dl>
    </div>
  </div>
  <section class="section">
    <h2>Recent Bids</h2>
    ${bidsHtml}
  </section>
</main>`;

    const html = renderDocument({
        siteUrl,
        title: good.NAME || `Artwork #${goodId}`,
        description: good.INTRODUCTION || 'View auction details and latest bids.',
        canonicalPath,
        bodyHtml,
        jsonLd: [
            buildDetailJsonLd(good, siteUrl),
            buildBreadcrumbJsonLd(good, siteUrl)
        ]
    });

    res.status(200).type('html').send(html);
}

function shouldServeSeoHtml(req) {
    const forceSeo = String(req.query.__seo || req.headers['x-seo-render'] || '') === '1';
    if (!forceSeo && process.env.NODE_ENV !== 'production') {
        return false;
    }
    if (!isHtmlNavigationRequest(req)) {
        return false;
    }
    if (forceSeo) {
        return true;
    }
    const userAgent = String(req.headers['user-agent'] || '');
    return BOT_PATTERN.test(userAgent);
}

export function seoRender() {
    return async (req, res, next) => {
        try {
            if (!shouldServeSeoHtml(req)) {
                next();
                return;
            }

            if (req.path.startsWith('/home/auction')) {
                await renderAuctionListingPage(req, res);
                return;
            }
            if (/^\/home\/detail(\/|$)/.test(req.path)) {
                await renderAuctionDetailPage(req, res);
                return;
            }

            next();
        } catch (error) {
            next();
        }
    };
}
