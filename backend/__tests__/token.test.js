import { createToken, verifyToken } from '../tools/token.js';

describe('JWT token operations', () => {
    const testSalt = 'test_secret_key';
    const testInfo = { EMAIL: 'test@example.com', Permission: 0 };

    test('createToken returns a JWT string with 3 parts', () => {
        const token = createToken(testSalt, testInfo);
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3);
    });

    test('verifyToken decodes a valid token correctly', async () => {
        const token = createToken(testSalt, testInfo);
        const decoded = await verifyToken(testSalt, token);
        expect(decoded.EMAIL).toBe(testInfo.EMAIL);
        expect(decoded.Permission).toBe(testInfo.Permission);
    });

    test('verifyToken rejects an invalid token string', async () => {
        await expect(verifyToken(testSalt, 'invalid.token.here')).rejects.toThrow();
    });

    test('verifyToken rejects token verified with wrong salt', async () => {
        const token = createToken(testSalt, testInfo);
        await expect(verifyToken('wrong_salt', token)).rejects.toThrow();
    });

    test('verifyToken rejects undefined token', async () => {
        await expect(verifyToken(testSalt, undefined)).rejects.toThrow();
    });

    test('token contains iat and exp with 15-day expiration', async () => {
        const token = createToken(testSalt, testInfo);
        const decoded = await verifyToken(testSalt, token);
        expect(decoded).toHaveProperty('iat');
        expect(decoded).toHaveProperty('exp');
        expect(decoded.exp - decoded.iat).toBe(15 * 24 * 60 * 60);
    });

    test('different payloads produce different tokens', () => {
        const token1 = createToken(testSalt, { EMAIL: 'a@a.com', Permission: 0 });
        const token2 = createToken(testSalt, { EMAIL: 'b@b.com', Permission: 1 });
        expect(token1).not.toBe(token2);
    });
});
