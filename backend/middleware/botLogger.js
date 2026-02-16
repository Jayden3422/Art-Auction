const BOT_USER_AGENTS = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'sogou', 'facebot', 'facebookexternalhit',
    'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot',
    'applebot', 'petalbot', 'semrushbot', 'ahrefsbot'
];

export function botLogger(req, res, next) {
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const matchedBot = BOT_USER_AGENTS.find(bot => ua.includes(bot));

    if (matchedBot) {
        res.on('finish', () => {
            console.log('[BOT]', JSON.stringify({
                timestamp: new Date().toISOString(),
                bot: matchedBot,
                method: req.method,
                path: req.originalUrl,
                status: res.statusCode,
                ip: req.ip
            }));
        });
    }

    next();
}

export { BOT_USER_AGENTS };
