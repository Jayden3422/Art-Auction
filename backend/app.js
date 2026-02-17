import doMd5 from "./tools/md5.js";// md5加密
import { encodeBase64, decodeBase64 } from "./tools/base64.js";// base64加密/解密
import {createToken, verifyToken} from "./tools/token.js";// 引入token操作函数
import {salt, permission, final} from "./tools/public.js"
// 引入express框架
import express from "express";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { WebSocketServer } from 'ws';
import { APP_PORT, WS_PORT } from "./config/env.js";
var app = express();

// 新增：引入 cookie-parser
import cookieParser from 'cookie-parser';

import multer from "multer";
//设置临时目录 存放上传的图片
const upload = multer({ dest: "tmp/" });

// 引入保存文件操作
import { storeFile } from "./tools/dofs.js";

// 引入数据库相关操作
import { insertDb, deleteData, deleteDatas, findPro, findSort, findLimitSort, updateDb, updateDbs } from "./tools/Mongo.js";

// 引入阿里云oss操作
import { putOSS, delOSS } from "./tools/aliOSS.js";

import bodyParser from "body-parser";// 引入中间件解析body
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });
// 创建 application/json parser
var jsonParser = bodyParser.json();

// Promise处理
import { isFine, allPro } from "./tools/promise.js";

// 引入路由对象
import all from "./routers/all.js";
import buyr from "./routers/buyr.js";
import seller from "./routers/seller.js";
import admin from "./routers/admin.js";
import fs from 'fs';
import { dynamicRender } from './middleware/dynamicRender.js';
import { seoRender } from './middleware/seoRender.js';
import { resolveSiteUrl, toAbsoluteUrl } from './tools/seoSite.js';

// 新增：引入 i18n
import i18n from 'i18n';
import path from 'path'; // 用于 __dirname
import { fileURLToPath } from "url"; // 用于获取 __dirname

// 在 ES 模块中定义 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDevEnv = process.env.NODE_ENV === 'development';

function resolveTrustProxy(rawValue) {
    if (rawValue === undefined || rawValue === null || rawValue === '') {
        // Safe defaults:
        // - production: trust first reverse proxy hop
        // - non-production: trust local proxy tooling only
        return process.env.NODE_ENV === 'production' ? 1 : 'loopback';
    }

    if (typeof rawValue === 'boolean' || typeof rawValue === 'number') {
        return rawValue;
    }

    const normalized = String(rawValue).trim();
    const lower = normalized.toLowerCase();

    if (lower === 'true') {
        return true;
    }
    if (lower === 'false') {
        return false;
    }
    if (/^\d+$/.test(normalized)) {
        return Number(normalized);
    }
    return normalized;
}

app.set('trust proxy', resolveTrustProxy(process.env.TRUST_PROXY));

// 配置 i18n
i18n.configure({
  locales: ['en', 'zh'], // 支持的语言
  directory: path.join(__dirname, 'locales'), // 语言文件目录
  defaultLocale: 'en', // 默认语言
  cookie: 'lang', // Cookie 键名，用于持久化语言
  queryParameter: 'lang', // 查询参数，如 ?lang=zh
  autoReload: isDevEnv, // 仅开发时自动重载语言文件，避免测试句柄泄漏
  syncFiles: isDevEnv, // 仅开发时自动同步缺失的键
  register: global, // 全局注册，便于在非 req 环境中使用
  // 新增：忽略 Accept-Language 头，强制使用默认或查询/Cookie
  updateFiles: false, // 避免自动写文件，如果不需要
});

// Bot crawl logger (must be first to capture all requests)
import { botLogger } from './middleware/botLogger.js';
app.use(botLogger);
// 使用 cookie-parser 中间件
app.use(cookieParser());
// Gzip compression for all responses
app.use(compression());
// Security headers (modern CSP, no deprecated X-XSS-Protection)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss: https:; frame-ancestors 'self'");
    next();
});
// 设置 i18n 中间件（放在跨域设置前或后均可，但要在路由前）
app.use(i18n.init);
// 验证使用语言
// app.use((req, res, next) => {// 如果没有查询参数或 Cookie，强制设置为 'zh'
//     if (!req.query.lang && !req.cookies.lang) {
//       req.setLocale('zh');
//     }
//     console.log('Current locale:', req.getLocale()); // 打印当前语言
//     console.log('Translation for hello:', req.__('hello')); // 打印翻译结果
//     next();
//   });
// console.log(__('hello'))

// 设置允许跨域
app.use(function (req, res, next) {
    // 指定允许其他域名访问 *所有
    res.setHeader("Access-Control-Allow-Origin", "*");
    // 允许客户端请求头中带有的
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With, Access-Token, x-custom-header, token");
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // 允许请求的类型
    res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.setHeader("X-Powered-By", ' 3.2.1')
    next();
});

const requestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'test' ? 2 : 120,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method.toLowerCase() === 'options',
    message: {
        message: 'Too many requests, please try again later.'
    }
});

app.use(requestLimiter);

// 以下为接口相关函数
const API_PREFIXES = ['/all', '/buyr', '/seller', '/admin'];
const isApiRequestPath = (pathname) => API_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));

// API 白名单，允许所有用户访问
const publicApiPaths = new Set([
    '/all',
    '/all/isToken',
    // SEO: public listing/detail endpoints for crawlers and anonymous users
    '/all/sitemap.xml',
    '/all/getAllGoods',
    '/all/getAllNear',
    '/all/getAllSale',
    '/all/getAllEnd',
    '/all/getAllAn',
    '/all/getDics',
    // 买家
    '/buyr',
    '/buyr/login',
    '/buyr/signin',
    // 卖家
    '/seller',
    '/seller/login',
    '/seller/signin',
    // 管理员
    '/admin',
    '/admin/login',
]);
const publicGetOnlyPaths = new Set(['/all/getGood', '/all/getPriceList']);
// SEO: prefix whitelist for GET routes with dynamic params
const whiteListPrefixes = ['/all/getGood/', '/all/getPriceList/'];

// 设置总体前置路由拦截
app.use((req, res, next) => {
    // 处理优先发出的OPTIONS方法，返回200以便后面执行POST请求
    if (req.method.toLowerCase() === 'options') {
        res.sendStatus(200);
        return;
    }
    // Only protect API routes. Frontend HTML/static routes should stay public.
    if (!isApiRequestPath(req.path)) {
        next();
        return;
    }
    let info = {};
    const isGetRequest = req.method.toLowerCase() === 'get';
    const isWhitelisted = publicApiPaths.has(req.path)
        || (isGetRequest && (publicGetOnlyPaths.has(req.path) || whiteListPrefixes.some(p => req.path.startsWith(p))));

    if (!isWhitelisted) {// 如果路径不包括白名单路径就进行token验证
        verifyToken(salt, req.headers.token).then(async (resx) => {// 验证token是否正确
            if(resx.Permission == 0) {
                info = await findPro('buyr_user', { "EMAIL": resx.EMAIL });
            }else if(resx.Permission == 1) {
                info = await findPro('seller', { "EMAIL": resx.EMAIL });
            }else if(resx.Permission == 2) {
                info = await findPro('admin', { "EMAIL": resx.EMAIL });
            }
            if(isFine(info).judge) {
                throw info.value;
            }
            if(info[0].PASS_SALT == req.headers.token) {
                next()// 正确就进行路由跳转
            }else {
                throw resx;
            }
        }).catch(e => {// 不正确就返回401状态token无效
            res.status(401).send('invalid token')
        })
    } else {// 如果路径在白名单或前缀白名单内就直接进行跳转
        next()
    }
})

const frontendDistDir = path.join(__dirname, '../frontend/dist');
const canServeFrontend = process.env.NODE_ENV === 'production' && fs.existsSync(frontendDistDir);

// 拍卖时间结束后的操作
if (process.env.NODE_ENV !== 'test') {
    final();
}

app.get('/', function (req, res, next) {
    if (canServeFrontend) {
        next();
        return;
    }
    res.send(req.__('hello') + ' Express');
})

app.get('/robots.txt', (req, res) => {
    const siteUrl = resolveSiteUrl(req);
    const lines = [
        'User-agent: *',
        'Disallow: /home/mine',
        'Disallow: /home/order*',
        'Disallow: /home/admins',
        'Disallow: /home/users',
        'Disallow: /home/sellers',
        'Disallow: /home/goodinfo',
        'Disallow: /home/addannounce',
        'Disallow: /statistics',
        '',
        `Sitemap: ${toAbsoluteUrl(siteUrl, '/all/sitemap.xml')}`
    ];
    res.type('text/plain').send(lines.join('\n'));
});

app.use('/all', all);
app.use('/buyr', buyr);
app.use('/seller', seller);
app.use('/admin', admin);

if (canServeFrontend) {
    app.use(seoRender());
    app.use(dynamicRender(frontendDistDir));
    app.use(express.static(frontendDistDir, {
        index: false,
        maxAge: '1d'
    }));
    app.get('*', (req, res, next) => {
        if (req.method !== 'GET' || isApiRequestPath(req.path) || path.extname(req.path)) {
            next();
            return;
        }
        res.sendFile(path.join(frontendDistDir, 'index.html'));
    });
}

// 404 catch-all for unmatched API routes
app.use((req, res) => {
    if (isApiRequestPath(req.path)) {
        res.status(404).json({ error: 'Not found', path: req.originalUrl });
        return;
    }
    res.status(404).send('Not found');
});

// websocket
if (process.env.NODE_ENV !== 'test') {
    const wss = new WebSocketServer({ port: WS_PORT }) // 服务端口3006
    var player = new Array()
    console.log(__('createWs') + ', ' + __('servicePort') + ': ' + WS_PORT)

    // 创建连接
    wss.on("connection", ws => {
        let id = Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000;
        player.push(id)
        console.log(__('newClient'))
        // 接收到 client 数据时
        ws.on("message", data => {
            //前台传ping就返回ok
            if (data == 'ping') {
                ws.send('ok')
                return
            }
            let myData = JSON.parse(data.toString());
            myData.TIME = new Date();
            //群发
            wss.clients.forEach(s => {
                if (s.readyState == 1 && s.socketIdxos != id) {
                    s.send(JSON.stringify(myData));
                }
            })
        })
        ws.on("close", () => {
            console.log("websocket server: " + __('clientClosed'))
            player = new Array()
        })
        ws.onerror = function () {
            console.log("websocket server: " + __('wrong'))
        }
    })


    // 监听3000接口
    app.listen(APP_PORT, function () {
        console.log('app is runing at port ' + APP_PORT);
    })
}

export default app;
