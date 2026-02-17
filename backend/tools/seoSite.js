const DEFAULT_SITE_URL = 'https://example.com';

function normalizeSiteUrl(rawValue) {
    if (rawValue === undefined || rawValue === null) {
        return DEFAULT_SITE_URL;
    }

    let normalized = String(rawValue).trim();
    if (!normalized) {
        return DEFAULT_SITE_URL;
    }

    if (!/^https?:\/\//i.test(normalized)) {
        normalized = `https://${normalized}`;
    }

    try {
        const parsed = new URL(normalized);
        return `${parsed.protocol}//${parsed.host}`;
    } catch (error) {
        return DEFAULT_SITE_URL;
    }
}

function resolveSiteUrl(req) {
    if (process.env.SITE_URL) {
        return normalizeSiteUrl(process.env.SITE_URL);
    }
    if (req) {
        const host = req.get('host');
        if (host) {
            return normalizeSiteUrl(`${req.protocol}://${host}`);
        }
    }
    return DEFAULT_SITE_URL;
}

function toAbsoluteUrl(siteUrl, pathname) {
    if (!pathname) {
        return siteUrl;
    }
    if (/^https?:\/\//i.test(pathname)) {
        return pathname;
    }
    return `${siteUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

export {
    DEFAULT_SITE_URL,
    normalizeSiteUrl,
    resolveSiteUrl,
    toAbsoluteUrl
};
