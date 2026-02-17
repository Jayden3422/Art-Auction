const baseUrl = process.env.SEO_CHECK_BASE_URL || `http://127.0.0.1:${process.env.APP_PORT || 3000}`;
const botUserAgent = process.env.SEO_BOT_UA || 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const failures = [];
const warnings = [];

function pass(label, detail = '') {
    console.log(`PASS  ${label}${detail ? ` - ${detail}` : ''}`);
}

function warn(label, detail = '') {
    const line = `WARN  ${label}${detail ? ` - ${detail}` : ''}`;
    warnings.push(line);
    console.warn(line);
}

function fail(label, detail = '') {
    const line = `FAIL  ${label}${detail ? ` - ${detail}` : ''}`;
    failures.push(line);
    console.error(line);
}

function asAbsoluteUrl(input, fallbackBase) {
    try {
        return new URL(input, fallbackBase).toString();
    } catch (error) {
        return null;
    }
}

async function fetchText(targetUrl, init = {}) {
    const headers = {
        'user-agent': botUserAgent,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...(init.headers || {})
    };
    const res = await fetch(targetUrl, {
        ...init,
        headers
    });
    const text = await res.text();
    return { res, text };
}

function extractSitemapLocs(xmlText) {
    const locs = [];
    const pattern = /<loc>([\s\S]*?)<\/loc>/g;
    let match;
    while ((match = pattern.exec(xmlText)) !== null) {
        locs.push(match[1].trim());
    }
    return locs;
}

function extractJsonLdBlocks(html) {
    const blocks = [];
    const pattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = pattern.exec(html)) !== null) {
        blocks.push(match[1].trim());
    }
    return blocks;
}

async function checkRobotsAndSitemap() {
    const robotsUrl = `${baseUrl}/robots.txt`;
    const { res: robotsRes, text: robotsText } = await fetchText(robotsUrl, { redirect: 'follow' });
    if (robotsRes.status !== 200) {
        fail('/robots.txt', `expected 200, got ${robotsRes.status}`);
        return null;
    }
    pass('/robots.txt', 'reachable');

    const sitemapLine = robotsText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find((line) => /^Sitemap:/i.test(line));
    if (!sitemapLine) {
        fail('/robots.txt', 'missing Sitemap directive');
        return null;
    }
    const sitemapUrl = sitemapLine.replace(/^Sitemap:\s*/i, '').trim();
    if (!/^https?:\/\//i.test(sitemapUrl)) {
        fail('/robots.txt', `Sitemap must be absolute URL, got: ${sitemapUrl}`);
        return null;
    }
    pass('/robots.txt', `absolute sitemap URL: ${sitemapUrl}`);

    const { res: sitemapRes, text: sitemapText } = await fetchText(sitemapUrl, { redirect: 'follow' });
    if (sitemapRes.status !== 200) {
        fail('/all/sitemap.xml', `expected 200, got ${sitemapRes.status}`);
        return null;
    }
    if (!sitemapText.includes('<urlset')) {
        fail('/all/sitemap.xml', 'missing <urlset> root');
        return null;
    }

    const locs = extractSitemapLocs(sitemapText);
    if (!locs.length) {
        fail('/all/sitemap.xml', 'contains no <loc> entries');
        return null;
    }
    const nonAbsoluteLoc = locs.find((loc) => !/^https?:\/\//i.test(loc));
    if (nonAbsoluteLoc) {
        fail('/all/sitemap.xml', `loc must be absolute URL: ${nonAbsoluteLoc}`);
    } else {
        pass('/all/sitemap.xml', `${locs.length} absolute URLs`);
    }

    const requiredPaths = [
        '/home/auction',
        '/home/auction/upcoming',
        '/home/auction/live',
        '/home/auction/ended'
    ];
    for (const pathname of requiredPaths) {
        const found = locs.some((loc) => {
            try {
                return new URL(loc).pathname === pathname;
            } catch (error) {
                return false;
            }
        });
        if (!found) {
            fail('/all/sitemap.xml', `missing required URL: ${pathname}`);
        } else {
            pass('/all/sitemap.xml', `contains ${pathname}`);
        }
    }

    return { locs, sitemapUrl };
}

async function checkRedirectsAnd404(locs) {
    const probePath = '/home/detail/0?__seo=1';
    const probeUrl = `${baseUrl}${probePath}`;
    const { res: probeRes } = await fetchText(probeUrl, { redirect: 'manual' });
    if (probeRes.status !== 404) {
        fail('404 probe', `expected 404 for ${probePath}, got ${probeRes.status}`);
    } else {
        pass('404 probe', `${probePath} -> 404`);
    }

    const maxChecks = Math.min(25, locs.length);
    for (let i = 0; i < maxChecks; i += 1) {
        const raw = locs[i];
        const firstUrl = asAbsoluteUrl(raw, baseUrl);
        if (!firstUrl) {
            fail('redirect check', `invalid URL in sitemap: ${raw}`);
            continue;
        }

        let current = firstUrl;
        let redirects = 0;
        let finalStatus = 0;
        for (let hops = 0; hops < 5; hops += 1) {
            const { res } = await fetchText(current, { redirect: 'manual' });
            finalStatus = res.status;
            if ([301, 302, 307, 308].includes(res.status)) {
                redirects += 1;
                const location = res.headers.get('location');
                if (!location) {
                    fail('redirect check', `${current} returned ${res.status} without Location`);
                    break;
                }
                const next = asAbsoluteUrl(location, current);
                if (!next) {
                    fail('redirect check', `${current} returned invalid Location: ${location}`);
                    break;
                }
                current = next;
                continue;
            }
            break;
        }

        if (redirects > 1) {
            fail('redirect check', `${firstUrl} has too many redirects (${redirects})`);
            continue;
        }
        if (finalStatus === 404) {
            fail('redirect check', `${firstUrl} resolves to 404`);
            continue;
        }
        if (finalStatus !== 200) {
            fail('redirect check', `${firstUrl} resolves to status ${finalStatus}`);
            continue;
        }
        pass('redirect check', `${firstUrl} -> 200 (redirects=${redirects})`);
    }
}

async function checkJsonLd(locs) {
    const targets = [
        `${baseUrl}/home/auction?__seo=1`,
        `${baseUrl}/home/auction/upcoming?__seo=1`,
        `${baseUrl}/home/auction/live?__seo=1`,
        `${baseUrl}/home/auction/ended?__seo=1`
    ];

    const detailUrl = locs.find((loc) => {
        try {
            return new URL(loc).pathname.startsWith('/home/detail/');
        } catch (error) {
            return false;
        }
    });
    if (detailUrl) {
        targets.push(`${detailUrl}${detailUrl.includes('?') ? '&' : '?'}__seo=1`);
    } else {
        warn('json-ld', 'no detail URL found in sitemap; skipping detail-page JSON-LD check');
    }

    for (const target of targets) {
        const { res, text } = await fetchText(target, { redirect: 'follow' });
        if (res.status !== 200) {
            fail('json-ld', `${target} returned ${res.status}`);
            continue;
        }
        if (!/<h1[\s>]/i.test(text)) {
            fail('json-ld', `${target} missing <h1>`);
            continue;
        }
        const blocks = extractJsonLdBlocks(text);
        if (!blocks.length) {
            fail('json-ld', `${target} missing application/ld+json script`);
            continue;
        }

        let hasValidContext = false;
        for (const block of blocks) {
            try {
                const parsed = JSON.parse(block);
                const list = Array.isArray(parsed) ? parsed : [parsed];
                if (list.some((item) => item && String(item['@context'] || '').includes('schema.org'))) {
                    hasValidContext = true;
                    break;
                }
            } catch (error) {
                // keep iterating remaining blocks
            }
        }
        if (!hasValidContext) {
            fail('json-ld', `${target} has invalid JSON-LD payload`);
            continue;
        }
        pass('json-ld', `${target} contains valid schema.org JSON-LD`);
    }
}

async function run() {
    console.log(`Running SEO CI gate against ${baseUrl}`);
    const sitemapResult = await checkRobotsAndSitemap();
    if (!sitemapResult) {
        process.exitCode = 1;
        return;
    }

    await checkRedirectsAnd404(sitemapResult.locs);
    await checkJsonLd(sitemapResult.locs);

    console.log('\nSummary');
    console.log(`- Failures: ${failures.length}`);
    console.log(`- Warnings: ${warnings.length}`);

    if (failures.length > 0) {
        process.exitCode = 1;
    }
}

run().catch((error) => {
    console.error('FAIL  seo-ci-gate', error.message);
    process.exit(1);
});
