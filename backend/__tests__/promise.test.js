import { isFine } from '../tools/promise.js';

describe('isFine - Promise.allSettled result checker', () => {
    test('returns judge:false when first result is fulfilled', () => {
        const results = [
            { status: 'fulfilled', value: 'ok' },
            { status: 'fulfilled', value: 'ok2' }
        ];
        expect(isFine(results)).toEqual({ judge: false });
    });

    test('returns judge:true with item index when first result is rejected', () => {
        const results = [
            { status: 'rejected', value: 'error' }
        ];
        expect(isFine(results)).toEqual({ judge: true, item: 0 });
    });

    test('only checks the first element in the array', () => {
        // This documents the current behavior: only the first element is checked
        const results = [
            { status: 'fulfilled', value: 'ok' },
            { status: 'rejected', value: 'error' }
        ];
        // Even though second is rejected, first is fulfilled so returns false
        expect(isFine(results).judge).toBe(false);
    });

    test('handles single non-array rejected result', () => {
        expect(isFine({ status: 'rejected' })).toBe(true);
    });

    test('handles single non-array fulfilled result', () => {
        expect(isFine({ status: 'fulfilled' })).toBe(false);
    });

    test('handles empty array (falls to non-array branch)', () => {
        // Empty array has length 0 (falsy), goes to else branch
        // [].status is undefined, not "rejected", so returns false
        expect(isFine([])).toBe(false);
    });
});
