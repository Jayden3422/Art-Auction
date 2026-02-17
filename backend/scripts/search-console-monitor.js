import crypto from 'crypto';
import fs from 'fs';

const OAUTH_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const INSPECTION_URL = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';

function base64UrlEncode(value) {
    return Buffer.from(value)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function parseInteger(rawValue, fallback) {
    const parsed = Number(rawValue);
    if (!Number.isInteger(parsed) || parsed < 0) {
        return fallback;
    }
    return parsed;
}

function parseSitemapLocs(xmlText) {
    const locs = [];
    const pattern = /<loc>([\s\S]*?)<\/loc>/g;
    let match;
    while ((match = pattern.exec(xmlText)) !== null) {
        const loc = String(match[1] || '').trim();
        if (loc) {
            locs.push(loc);
        }
    }
    return Array.from(new Set(locs));
}

function extractCoverageState(payload) {
    return String(payload?.inspectionResult?.indexStatusResult?.coverageState || '');
}

function extractCanonicalPair(payload) {
    const status = payload?.inspectionResult?.indexStatusResult || {};
    return {
        googleCanonical: String(status.googleCanonical || ''),
        userCanonical: String(status.userCanonical || '')
    };
}

async function fetchJson(url, init = {}) {
    const res = await fetch(url, init);
    const text = await res.text();
    let parsed = null;
    try {
        parsed = text ? JSON.parse(text) : null;
    } catch (error) {
        parsed = null;
    }
    return { res, text, json: parsed };
}

function buildServiceAccountAssertion(serviceAccount) {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
        iss: serviceAccount.client_email,
        scope: OAUTH_SCOPE,
        aud: OAUTH_TOKEN_URL,
        iat: now,
        exp: now + 3600
    };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
        .createSign('RSA-SHA256')
        .update(unsignedToken)
        .sign(serviceAccount.private_key, 'base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
    return `${unsignedToken}.${signature}`;
}

async function exchangeAccessToken(serviceAccount) {
    const assertion = buildServiceAccountAssertion(serviceAccount);
    const body = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion
    });
    const { res, json, text } = await fetchJson(OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        body
    });
    if (!res.ok || !json?.access_token) {
        throw new Error(`OAuth token exchange failed (${res.status}): ${text}`);
    }
    return json.access_token;
}

async function inspectUrl({ accessToken, inspectionUrl, propertyUri }) {
    const { res, json, text } = await fetchJson(INSPECTION_URL, {
        method: 'POST',
        headers: {
            authorization: `Bearer ${accessToken}`,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            inspectionUrl,
            siteUrl: propertyUri,
            languageCode: 'en-US'
        })
    });
    if (!res.ok || !json) {
        throw new Error(`Inspection failed for ${inspectionUrl} (${res.status}): ${text}`);
    }
    return json;
}

function writeReport(pathname, lines) {
    fs.writeFileSync(pathname, `${lines.join('\n')}\n`, 'utf8');
}

async function run() {
    const serviceAccountRaw = process.env.GSC_SERVICE_ACCOUNT_JSON;
    const propertyUri = process.env.GSC_PROPERTY_URI;
    const siteUrl = process.env.SITE_URL;
    const sitemapUrl = process.env.GSC_SITEMAP_URL || (siteUrl ? `${siteUrl.replace(/\/+$/, '')}/all/sitemap.xml` : '');
    const maxUrls = parseInteger(process.env.GSC_MONITOR_MAX_URLS, 100);
    const soft404Threshold = parseInteger(process.env.GSC_SOFT404_THRESHOLD, 0);
    const duplicateThreshold = parseInteger(process.env.GSC_DUPLICATE_THRESHOLD, 0);
    const outputFile = process.env.GSC_MONITOR_REPORT || 'search-console-monitor-report.md';

    if (!serviceAccountRaw) {
        throw new Error('Missing GSC_SERVICE_ACCOUNT_JSON');
    }
    if (!propertyUri) {
        throw new Error('Missing GSC_PROPERTY_URI');
    }
    if (!sitemapUrl) {
        throw new Error('Missing SITE_URL or GSC_SITEMAP_URL');
    }

    const serviceAccount = JSON.parse(serviceAccountRaw);
    const accessToken = await exchangeAccessToken(serviceAccount);

    const { res: sitemapRes, text: sitemapText } = await fetchJson(sitemapUrl, {
        headers: { accept: 'application/xml,text/xml;q=0.9,*/*;q=0.8' }
    });
    if (!sitemapRes.ok) {
        throw new Error(`Unable to fetch sitemap (${sitemapRes.status}): ${sitemapUrl}`);
    }

    const locs = parseSitemapLocs(String(sitemapText || ''));
    const targets = locs.slice(0, Math.min(maxUrls, locs.length));
    const startedAt = new Date().toISOString();

    const soft404Hits = [];
    const duplicateHits = [];
    const inspectionErrors = [];

    for (const target of targets) {
        try {
            const payload = await inspectUrl({
                accessToken,
                inspectionUrl: target,
                propertyUri
            });
            const coverageState = extractCoverageState(payload);
            const canonicalPair = extractCanonicalPair(payload);

            if (/soft\s*404/i.test(coverageState)) {
                soft404Hits.push({
                    url: target,
                    coverageState,
                    ...canonicalPair
                });
            }
            if (/duplicate without user-selected canonical/i.test(coverageState)) {
                duplicateHits.push({
                    url: target,
                    coverageState,
                    ...canonicalPair
                });
            }
        } catch (error) {
            inspectionErrors.push({
                url: target,
                error: error.message
            });
        }
    }

    const lines = [
        '# Search Console Monitor Report',
        '',
        `- Generated at: ${startedAt}`,
        `- Property: ${propertyUri}`,
        `- Sitemap: ${sitemapUrl}`,
        `- URLs inspected: ${targets.length}/${locs.length}`,
        `- Soft 404 matches: ${soft404Hits.length}`,
        `- Duplicate without user-selected canonical matches: ${duplicateHits.length}`,
        `- Inspection API errors: ${inspectionErrors.length}`,
        ''
    ];

    if (soft404Hits.length) {
        lines.push('## Soft 404');
        soft404Hits.forEach((hit) => {
            lines.push(`- ${hit.url}`);
            lines.push(`  - coverageState: ${hit.coverageState}`);
            if (hit.userCanonical) lines.push(`  - userCanonical: ${hit.userCanonical}`);
            if (hit.googleCanonical) lines.push(`  - googleCanonical: ${hit.googleCanonical}`);
        });
        lines.push('');
    }

    if (duplicateHits.length) {
        lines.push('## Duplicate Without User-Selected Canonical');
        duplicateHits.forEach((hit) => {
            lines.push(`- ${hit.url}`);
            lines.push(`  - coverageState: ${hit.coverageState}`);
            if (hit.userCanonical) lines.push(`  - userCanonical: ${hit.userCanonical}`);
            if (hit.googleCanonical) lines.push(`  - googleCanonical: ${hit.googleCanonical}`);
        });
        lines.push('');
    }

    if (inspectionErrors.length) {
        lines.push('## Inspection Errors');
        inspectionErrors.slice(0, 50).forEach((entry) => {
            lines.push(`- ${entry.url}`);
            lines.push(`  - error: ${entry.error}`);
        });
        lines.push('');
    }

    writeReport(outputFile, lines);

    console.log(`Search Console monitor completed: ${targets.length} URLs inspected`);
    console.log(`Soft 404: ${soft404Hits.length}`);
    console.log(`Duplicate without user-selected canonical: ${duplicateHits.length}`);
    console.log(`Inspection errors: ${inspectionErrors.length}`);
    console.log(`Report: ${outputFile}`);

    const thresholdFailed = soft404Hits.length > soft404Threshold || duplicateHits.length > duplicateThreshold;
    if (thresholdFailed) {
        process.exitCode = 1;
    }
}

run().catch((error) => {
    console.error(`Search Console monitor failed: ${error.message}`);
    process.exit(1);
});
