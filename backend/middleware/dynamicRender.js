import fs from 'fs';
import path from 'path';
import { BOT_USER_AGENTS } from './botLogger.js';

const PRERENDERED_ROUTES = new Set(['/login', '/signin']);
const botPattern = new RegExp(BOT_USER_AGENTS.join('|'), 'i');

function isHtmlNavigationRequest(req) {
    const accept = req.headers.accept || '';
    return req.method === 'GET' && (accept.includes('text/html') || accept.includes('*/*') || !accept);
}

function normalizeRoutePath(pathname) {
    if (!pathname || pathname === '/') {
        return '/';
    }
    return pathname.endsWith('/') && pathname.length > 1
        ? pathname.slice(0, -1)
        : pathname;
}

function resolveHtmlFile(distDir, routePath) {
    const normalizedPath = normalizeRoutePath(routePath);
    const candidates = [];

    if (PRERENDERED_ROUTES.has(normalizedPath)) {
        candidates.push(path.join(distDir, normalizedPath.slice(1), 'index.html'));
    }
    candidates.push(path.join(distDir, 'index.html'));

    return candidates.find(fs.existsSync) || null;
}

/**
 * Serve prerendered HTML to bot requests in production.
 * Non-bot traffic falls back to regular static serving.
 */
export function dynamicRender(distDir) {
    return (req, res, next) => {
        if (process.env.NODE_ENV !== 'production') {
            next();
            return;
        }
        if (!isHtmlNavigationRequest(req) || path.extname(req.path)) {
            next();
            return;
        }
        const userAgent = (req.headers['user-agent'] || '').toLowerCase();
        if (!botPattern.test(userAgent)) {
            next();
            return;
        }

        const htmlFile = resolveHtmlFile(distDir, req.path);
        if (!htmlFile) {
            next();
            return;
        }
        res.sendFile(htmlFile);
    };
}
