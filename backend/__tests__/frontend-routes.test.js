import {
    isKnownFrontendRoute,
    resolveAuctionCategoryCanonicalPath,
    resolveLegacyDetailCanonicalPath
} from '../tools/frontendRoutes.js';

describe('frontend route canonical helpers', () => {
    test('resolve legacy detail query routes to canonical detail path', () => {
        expect(resolveLegacyDetailCanonicalPath('/home/detail', { GOOD_ID: '9' })).toBe('/home/detail/9');
        expect(resolveLegacyDetailCanonicalPath('/home/details', { id: '88' })).toBe('/home/detail/88');
    });

    test('resolve legacy details pathname route to canonical detail path', () => {
        expect(resolveLegacyDetailCanonicalPath('/home/details/56', {})).toBe('/home/detail/56');
    });

    test('resolve auction query category/state to canonical category path', () => {
        expect(resolveAuctionCategoryCanonicalPath('/home/auction', { category: 'live' })).toBe('/home/auction/live');
        expect(resolveAuctionCategoryCanonicalPath('/home/auction', { state: '2' })).toBe('/home/auction/ended');
    });

    test('known frontend route whitelist rejects unknown paths', () => {
        expect(isKnownFrontendRoute('/home/auction/live')).toBe(true);
        expect(isKnownFrontendRoute('/home/detail/100')).toBe(true);
        expect(isKnownFrontendRoute('/home/unknown-path')).toBe(false);
    });
});
