import { encodeBase64, decodeBase64 } from '../tools/base64.js';

describe('base64 encoding/decoding', () => {
    const salt = 'test_salt';

    test('encodeBase64 returns a valid base64 string', () => {
        const result = encodeBase64(salt, 'hello');
        expect(typeof result).toBe('string');
        expect(result).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    test('decodeBase64 reverses encodeBase64', () => {
        const original = 'hello world';
        const encoded = encodeBase64(salt, original);
        const decoded = decodeBase64(salt, encoded);
        expect(decoded).toBe(original);
    });

    test('different salts produce different encoded values', () => {
        const str = 'same string';
        const encoded1 = encodeBase64('salt1', str);
        const encoded2 = encodeBase64('salt2', str);
        expect(encoded1).not.toBe(encoded2);
    });

    test('decoding with wrong salt length gives wrong result', () => {
        const original = 'secret';
        const encoded = encodeBase64('saltA', original);
        const decoded = decodeBase64('saltBB', encoded);
        expect(decoded).not.toBe(original);
    });

    test('handles empty string', () => {
        const encoded = encodeBase64(salt, '');
        const decoded = decodeBase64(salt, encoded);
        expect(decoded).toBe('');
    });

    test('handles special characters and unicode', () => {
        const original = '你好世界！@#$%';
        const encoded = encodeBase64(salt, original);
        const decoded = decodeBase64(salt, encoded);
        expect(decoded).toBe(original);
    });
});
