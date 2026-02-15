import doMd5 from '../tools/md5.js';

describe('md5 hashing', () => {
    test('returns a 32-character hex string', () => {
        const result = doMd5('salt', 'data');
        expect(result).toMatch(/^[a-f0-9]{32}$/);
    });

    test('same input produces same hash (deterministic)', () => {
        const hash1 = doMd5('salt', { key: 'value' });
        const hash2 = doMd5('salt', { key: 'value' });
        expect(hash1).toBe(hash2);
    });

    test('different salts produce different hashes', () => {
        const hash1 = doMd5('salt1', 'data');
        const hash2 = doMd5('salt2', 'data');
        expect(hash1).not.toBe(hash2);
    });

    test('different data produces different hashes', () => {
        const hash1 = doMd5('salt', 'data1');
        const hash2 = doMd5('salt', 'data2');
        expect(hash1).not.toBe(hash2);
    });

    test('works with object input (simulates login verification)', () => {
        const data = { EMAIL: 'test@test.com', USER_PASS: 'password123' };
        const result = doMd5('', data);
        expect(result).toMatch(/^[a-f0-9]{32}$/);
    });

    test('empty salt still produces valid hash', () => {
        const result = doMd5('', 'hello');
        expect(result).toMatch(/^[a-f0-9]{32}$/);
    });
});
