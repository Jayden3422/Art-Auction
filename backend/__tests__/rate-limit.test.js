import request from 'supertest';

describe('request rate limit', () => {
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

    test('returns 429 after exceeding configured request threshold', async () => {
        const first = await request(app).get('/');
        const second = await request(app).get('/');
        const third = await request(app).get('/');

        expect(first.statusCode).toBe(200);
        expect(second.statusCode).toBe(200);
        expect(third.statusCode).toBe(429);
        expect(third.body.message).toBe('Too many requests, please try again later.');
    });

    test('handles requests with X-Forwarded-For when proxy trust is configured', async () => {
        const forwardedIp = '203.0.113.9';

        const first = await request(app).get('/').set('X-Forwarded-For', forwardedIp);
        const second = await request(app).get('/').set('X-Forwarded-For', forwardedIp);
        const third = await request(app).get('/').set('X-Forwarded-For', forwardedIp);

        expect(first.statusCode).toBe(200);
        expect(second.statusCode).toBe(200);
        expect(third.statusCode).toBe(429);
        expect(third.body.message).toBe('Too many requests, please try again later.');
    });
});
