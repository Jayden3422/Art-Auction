import request from 'supertest';

describe('Express middleware', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    let app;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        ({ default: app } = await import('../app.js'));
    });

    afterAll(() => {
        if (originalNodeEnv === undefined) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = originalNodeEnv;
        }
    });

    test('whitelist root route returns 200 with CORS headers', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Express');
        // CORS headers
        expect(res.headers['access-control-allow-origin']).toBe('*');
        expect(res.headers['access-control-allow-methods']).toContain('POST');
        expect(res.headers['access-control-allow-methods']).toContain('GET');
        expect(res.headers['access-control-allow-methods']).toContain('DELETE');
        expect(res.headers['access-control-allow-methods']).toContain('OPTIONS');
    });

    test('OPTIONS requests return 200 and skip rate limiter', async () => {
        // OPTIONS requests are skipped by rate limiter, so this is safe
        const res = await request(app).options('/buyr/postPrice');
        expect(res.statusCode).toBe(200);
    });

    test('non-whitelist route without token returns 401', async () => {
        const res = await request(app)
            .post('/all/getGood')
            .send({ GOOD_ID: '123' });
        expect(res.statusCode).toBe(401);
        expect(res.text).toBe('invalid token');
    });
});
