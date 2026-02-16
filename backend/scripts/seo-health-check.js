const baseUrl = process.env.SEO_CHECK_BASE_URL || `http://localhost:${process.env.APP_PORT || 3000}`;
const checkFrontendPages = process.env.SEO_CHECK_FRONTEND === '1';
const explicitGoodId = process.env.SEO_GOOD_ID ? Number(process.env.SEO_GOOD_ID) : null;

const failures = [];
const warnings = [];

function logPass(label, detail = '') {
    console.log(`PASS  ${label}${detail ? ` - ${detail}` : ''}`);
}

function logWarn(label, detail = '') {
    const message = `WARN  ${label}${detail ? ` - ${detail}` : ''}`;
    warnings.push(message);
    console.log(message);
}

function logFail(label, detail = '') {
    const message = `FAIL  ${label}${detail ? ` - ${detail}` : ''}`;
    failures.push(message);
    console.error(message);
}

async function fetchText(pathname) {
    const url = `${baseUrl}${pathname}`;
    const res = await fetch(url, { redirect: 'follow' });
    const text = await res.text();
    return { url, res, text };
}

async function assertStatus(pathname, expectedStatus) {
    const { url, res } = await fetchText(pathname);
    if (res.status === expectedStatus) {
        logPass(pathname, `status ${res.status}`);
        return true;
    }
    logFail(pathname, `expected ${expectedStatus}, got ${res.status} (${url})`);
    return false;
}

async function checkSitemap() {
    const { url, res, text } = await fetchText('/all/sitemap.xml');
    if (res.status !== 200) {
        logFail('/all/sitemap.xml', `expected 200, got ${res.status} (${url})`);
        return;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('xml')) {
        logFail('/all/sitemap.xml', `unexpected content-type: ${contentType}`);
        return;
    }
    if (!text.includes('<urlset')) {
        logFail('/all/sitemap.xml', 'missing <urlset> root');
        return;
    }
    logPass('/all/sitemap.xml', 'valid XML response');
}

async function discoverGoodId() {
    if (Number.isInteger(explicitGoodId) && explicitGoodId > 0) {
        return explicitGoodId;
    }
    const { res, text } = await fetchText('/all/getAllGoods');
    if (res.status !== 200) {
        logWarn('/all/getAllGoods', `status ${res.status}; skipping detail endpoint checks`);
        return null;
    }
    let goods = [];
    try {
        goods = JSON.parse(text);
    } catch (e) {
        logWarn('/all/getAllGoods', 'response is not valid JSON; skipping detail endpoint checks');
        return null;
    }
    if (!Array.isArray(goods) || goods.length === 0) {
        logWarn('/all/getAllGoods', 'no goods found; skipping detail endpoint checks');
        return null;
    }
    const goodId = Number(goods[0].GOOD_ID);
    if (!Number.isInteger(goodId)) {
        logWarn('/all/getAllGoods', 'GOOD_ID missing in first item; skipping detail endpoint checks');
        return null;
    }
    return goodId;
}

async function checkPublicApiRoutes() {
    await checkSitemap();
    await assertStatus('/all/getAllGoods', 200);
    await assertStatus('/all/getAllNear', 200);
    await assertStatus('/all/getAllSale', 200);
    await assertStatus('/all/getAllEnd', 200);

    const goodId = await discoverGoodId();
    if (!goodId) {
        return;
    }
    await assertStatus(`/all/getGood/${goodId}`, 200);
    await assertStatus(`/all/getPriceList/${goodId}`, 200);
}

async function checkFrontendRoute(pathname, expectedSubstring) {
    const { res, text } = await fetchText(pathname);
    if (res.status !== 200) {
        logFail(pathname, `expected 200, got ${res.status}`);
        return;
    }
    if (expectedSubstring && !text.toLowerCase().includes(expectedSubstring.toLowerCase())) {
        logFail(pathname, `missing expected HTML marker: ${expectedSubstring}`);
        return;
    }
    logPass(pathname, 'frontend route reachable');
}

async function checkFrontendRoutes() {
    if (!checkFrontendPages) {
        logWarn('frontend checks', 'skipped (set SEO_CHECK_FRONTEND=1 to enable)');
        return;
    }

    await checkFrontendRoute('/login', '<div id="app">');
    await checkFrontendRoute('/signin', '<div id="app">');
    await checkFrontendRoute('/home/auction', '<div id="app">');

    const goodId = await discoverGoodId();
    if (goodId) {
        await checkFrontendRoute(`/home/detail?GOOD_ID=${goodId}`, '<div id="app">');
    }
}

async function run() {
    console.log(`Running SEO health check against ${baseUrl}`);
    await checkPublicApiRoutes();
    await checkFrontendRoutes();

    console.log('\nSummary');
    console.log(`- Failures: ${failures.length}`);
    console.log(`- Warnings: ${warnings.length}`);

    if (failures.length > 0) {
        process.exitCode = 1;
    }
}

run().catch((error) => {
    console.error('FAIL  seo-health-check', error.message);
    process.exit(1);
});

