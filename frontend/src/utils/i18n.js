const LOCALE_STORAGE_KEY = 'app_locale';
const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = new Set(['en', 'zh']);

export function normalizeLocale(value) {
    const raw = String(value || '').toLowerCase();
    if (raw.startsWith('zh')) {
        return 'zh';
    }
    if (raw.startsWith('en')) {
        return 'en';
    }
    return SUPPORTED_LOCALES.has(raw) ? raw : null;
}

export function getLocaleFromUrl(search = window.location.search) {
    try {
        const params = new URLSearchParams(search);
        return normalizeLocale(params.get('lang'));
    } catch (error) {
        return null;
    }
}

export function getStoredLocale() {
    try {
        return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
    } catch (error) {
        return null;
    }
}

export function getBrowserLocale() {
    try {
        return normalizeLocale(window.navigator.language);
    } catch (error) {
        return null;
    }
}

export function detectInitialLocale() {
    return getLocaleFromUrl() || getStoredLocale() || getBrowserLocale() || DEFAULT_LOCALE;
}

export function saveLocale(locale) {
    const normalized = normalizeLocale(locale);
    if (!normalized) return;
    try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, normalized);
    } catch (error) {
        // ignore storage failure
    }
}

export function applyDocumentLang(locale) {
    const normalized = normalizeLocale(locale) || DEFAULT_LOCALE;
    document.documentElement.setAttribute('lang', normalized === 'zh' ? 'zh-CN' : 'en');
}

