const AUCTION_CATEGORY_BY_STATE = {
    '0': 'upcoming',
    '1': 'live',
    '2': 'ended'
};

const FRONTEND_STATIC_PATHS = new Set([
    '/',
    '/login',
    '/signin',
    '/home',
    '/home/auction',
    '/home/mine',
    '/home/order',
    '/home/orderinfo',
    '/home/orderinfos',
    '/home/announce',
    '/home/addannounce',
    '/home/search',
    '/home/admins',
    '/home/users',
    '/home/sellers',
    '/home/goodinfo',
    '/statistics'
]);

const FRONTEND_DYNAMIC_PATTERNS = [
    /^\/home\/auction\/(upcoming|live|ended)$/,
    /^\/home\/detail\/\d+$/
];

function normalizePathname(pathname) {
    if (!pathname || pathname === '/') {
        return '/';
    }
    return pathname.endsWith('/') && pathname.length > 1
        ? pathname.slice(0, -1)
        : pathname;
}

function extractPositiveInt(rawValue) {
    const value = Number(rawValue);
    if (!Number.isInteger(value) || value <= 0) {
        return null;
    }
    return value;
}

export function resolveLegacyDetailCanonicalPath(pathname, query = {}) {
    const normalized = normalizePathname(pathname);
    const detailByPath = normalized.match(/^\/home\/details\/(\d+)$/);
    if (detailByPath) {
        return `/home/detail/${detailByPath[1]}`;
    }

    if (normalized !== '/home/detail' && normalized !== '/home/details') {
        return null;
    }

    const goodId = extractPositiveInt(query.GOOD_ID ?? query.goodId ?? query.id);
    if (!goodId) {
        return null;
    }
    return `/home/detail/${goodId}`;
}

export function resolveAuctionCategoryCanonicalPath(pathname, query = {}) {
    const normalized = normalizePathname(pathname);
    if (normalized !== '/home/auction') {
        return null;
    }

    const category = String(query.category || '').toLowerCase();
    if (['upcoming', 'live', 'ended'].includes(category)) {
        return `/home/auction/${category}`;
    }

    const byState = AUCTION_CATEGORY_BY_STATE[String(query.state || '')];
    if (byState) {
        return `/home/auction/${byState}`;
    }

    return null;
}

export function isKnownFrontendRoute(pathname) {
    const normalized = normalizePathname(pathname);
    if (FRONTEND_STATIC_PATHS.has(normalized)) {
        return true;
    }
    return FRONTEND_DYNAMIC_PATTERNS.some((pattern) => pattern.test(normalized));
}

