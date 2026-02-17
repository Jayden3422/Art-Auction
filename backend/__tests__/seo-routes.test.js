import request from 'supertest';

describe('SEO routes', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalSiteUrl = process.env.SITE_URL;
    let app;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.SITE_URL = 'https://auction.example';
        ({ default: app } = await import('../app.js'));
    });

    afterAll(() => {
        if (originalNodeEnv === undefined) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = originalNodeEnv;
        }

        if (originalSiteUrl === undefined) {
            delete process.env.SITE_URL;
        } else {
            process.env.SITE_URL = originalSiteUrl;
        }
    });

    test('robots.txt returns absolute sitemap URL', async () => {
        const res = await request(app).get('/robots.txt');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('User-agent: *');
        expect(res.text).toContain('Sitemap: https://auction.example/all/sitemap.xml');
    });

    test('sitemap.xml includes canonical listing URLs', async () => {
        const res = await request(app).get('/all/sitemap.xml');
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toContain('application/xml');
        expect(res.text).toContain('<urlset');
        expect(res.text).toContain('<loc>https://auction.example/home/auction</loc>');
        expect(res.text).toContain('<loc>https://auction.example/home/auction/upcoming</loc>');
        expect(res.text).toContain('<loc>https://auction.example/home/auction/live</loc>');
        expect(res.text).toContain('<loc>https://auction.example/home/auction/ended</loc>');
    });
});
