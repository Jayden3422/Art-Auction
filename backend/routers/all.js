import doMd5 from "../tools/md5.js";// md5加密
import { encodeBase64, decodeBase64 } from "../tools/base64.js";// base64加密/解密
import {createToken, verifyToken} from "../tools/token.js";// 引入token操作函数
import {salt, permission, final} from "../tools/public.js"
// 引入express框架
import express from "express";
var app = express();

import multer from "multer";
//设置临时目录 存放上传的图片
const upload = multer({ dest: "../tmp/" });

// 引入保存文件操作
import { storeFile } from "../tools/dofs.js";

// 引入数据库相关操作
import { insertDb, deleteData, deleteDatas, findPro, findSort, findLimitSort, updateDb, updateDbs } from "../tools/Mongo.js";

// 引入阿里云oss操作
import { putOSS, delOSS } from "../tools/aliOSS.js";

import bodyParser from "body-parser";// 引入中间件解析body
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });
// 创建 application/json parser
var jsonParser = bodyParser.json();

// Promise处理
import { isFine, allPro } from "../tools/promise.js";
import { resolveSiteUrl, toAbsoluteUrl } from "../tools/seoSite.js";


const all = express.Router();
all.get('/', (req,res)=>{
    res.send("all");
});

// 验证token
all.post('/isToken', jsonParser, async (req, res) => {
    await verifyToken(salt, req.headers.token).then(async (result) => {
        let info = [];
        try {
            if (result.Permission == 0) {
                info = await findPro('buyr_user', { "EMAIL": result.EMAIL });
            } else if (result.Permission == 1) {
                info = await findPro('seller', { "EMAIL": result.EMAIL });
            } else {
                info = await findPro('admin', { "EMAIL": result.EMAIL });
            }
            
            if(isFine(info).judge) {
                throw info.value;
            }
        }catch(e) {
            res.status(500).send('Failed to obtain')
        }
        res.send(info[0]);
    }).catch(e => {
        res.status(401).send('invalid token')
    });
})

// 获取所有物品
all.get('/getAllGoods', async (req, res) => {
    try {
        let goodsList = await findSort("goods", req.body, {TIME: -1});
        if(isFine(goodsList).judge) {
            throw goodsList.value;
        }
        res.send(goodsList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 获取物品详情
all.post('/getGood', jsonParser, async (req, res) => {
    try {
        let good = await findPro("goods", req.body);
        if(isFine(good).judge) {
            throw good.value;
        }
        res.send(good[0]);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// SEO: GET endpoint for item detail (crawlable)
all.get('/getGood/:id', async (req, res) => {
    const goodId = parseInt(req.params.id, 10);
    if (Number.isNaN(goodId)) {
        res.status(400).send('Invalid GOOD_ID');
        return;
    }
    try {
        let good = await findPro("goods", { GOOD_ID: goodId });
        if(isFine(good).judge) {
            res.status(404).send('Item not found');
            return;
        }
        res.json(good[0]);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 即将拍卖
all.get('/getAllNear', async (req, res) => {
    var nowDate = new Date();
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1;
    var dates = nowDate.getDate();
    var newDate = dates + 4;
    var nearDate = new Date([year, month, newDate].join('-'));
    try {
        let goodsList = await findSort("goods", {START_TIME: {$gt: nowDate}}, { START_TIME: -1 });
        if(isFine(goodsList).judge) {
            throw goodsList.value;
        }
        res.send(goodsList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 正在拍卖
all.get('/getAllSale', async (req, res) => {
    var nowDate = new Date();
    try {
        let goodsList = await findSort("goods", {START_TIME: {$lte: nowDate}, END_TIME: {$gt: nowDate}}, { END_TIME: 1 });
        if(isFine(goodsList).judge) {
            throw goodsList.value;
        }
        res.send(goodsList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 拍卖结束
all.get('/getAllEnd', async (req, res) => {
    var nowDate = new Date();
    try {
        let goodsList = await findSort("goods", {END_TIME: {$lte: nowDate}}, { END_TIME: -1 });
        if(isFine(goodsList).judge) {
            throw goodsList.value;
        }
        res.send(goodsList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 获取所有通知
all.get('/getAllAn', async (req, res) => {
    try {
        let annList = await findSort("announcement", {}, { TIME: -1 });
        if(isFine(annList).judge) {
            throw annList.value;
        }
        res.send(annList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 获取所有通知
all.get('/getDics', async (req, res) => {
    try {
        let dicList = await findPro("dictionary", {});
        if(isFine(dicList).judge) {
            throw dicList.value;
        }
        res.send(dicList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 出价信息
all.post('/getPriceList', jsonParser, async (req, res) => {
    var GOOD_ID = parseInt(req.body.GOOD_ID);
    try {
        let priceList = await findSort("price_info", {GOOD_ID: GOOD_ID}, { TIME: -1 });
        if(isFine(priceList).judge) {
            throw priceList.value;
        }
        res.send(priceList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// SEO: GET endpoint for price list (crawlable, public)
all.get('/getPriceList/:id', async (req, res) => {
    var GOOD_ID = parseInt(req.params.id, 10);
    if (Number.isNaN(GOOD_ID)) {
        res.status(400).send('Invalid GOOD_ID');
        return;
    }
    try {
        let priceList = await findSort("price_info", {GOOD_ID: GOOD_ID}, { TIME: -1 });
        if(isFine(priceList).judge) {
            throw priceList.value;
        }
        res.json(priceList);
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// 最近30天统计数据
all.get('/getNewStat', async (req, res) => {
    try {
        var now = new Date();
    }catch(e) {
        res.status(500).send('Failed to obtain')
    }
})

// SEO: Dynamic XML sitemap — only canonical, indexable, 200-status URLs
function parseHotDetailIds(rawValue) {
    if (!rawValue) {
        return [];
    }
    return String(rawValue)
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((id) => Number.isInteger(id) && id > 0);
}

function xmlEscape(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function buildSitemapEntry(siteUrl, pathname, options = {}) {
    const loc = toAbsoluteUrl(siteUrl, pathname);
    const {
        changefreq = 'weekly',
        priority = '0.7',
        lastmod = ''
    } = options;

    let xml = '  <url>\n';
    xml += `    <loc>${xmlEscape(loc)}</loc>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(`${loc}?lang=en`)}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="zh" href="${xmlEscape(`${loc}?lang=zh`)}"/>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(loc)}"/>\n`;
    if (lastmod) {
        xml += `    <lastmod>${xmlEscape(lastmod)}</lastmod>\n`;
    }
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += '  </url>\n';
    return xml;
}

// SEO: Dynamic XML sitemap with canonical absolute URLs
all.get('/sitemap.xml', async (req, res) => {
    const siteUrl = resolveSiteUrl(req);
    try {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
        xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

        xml += buildSitemapEntry(siteUrl, '/login', { changefreq: 'monthly', priority: '0.7' });
        xml += buildSitemapEntry(siteUrl, '/signin', { changefreq: 'monthly', priority: '0.6' });
        xml += buildSitemapEntry(siteUrl, '/home/auction', { changefreq: 'daily', priority: '0.9' });
        xml += buildSitemapEntry(siteUrl, '/home/auction/upcoming', { changefreq: 'daily', priority: '0.85' });
        xml += buildSitemapEntry(siteUrl, '/home/auction/live', { changefreq: 'hourly', priority: '0.9' });
        xml += buildSitemapEntry(siteUrl, '/home/auction/ended', { changefreq: 'daily', priority: '0.7' });

        const nowDate = new Date();
        let goodsList = [];
        try {
            goodsList = await findSort('goods', { END_TIME: { $gt: nowDate } }, { START_TIME: -1 });
            if (!Array.isArray(goodsList) || isFine(goodsList).judge) {
                goodsList = [];
            }
        } catch (error) {
            goodsList = [];
        }

        const detailIds = new Set(
            goodsList
                .map((good) => Number(good.GOOD_ID))
                .filter((id) => Number.isInteger(id) && id > 0)
        );
        parseHotDetailIds(process.env.SEO_HOT_DETAIL_IDS).forEach((id) => detailIds.add(id));

        for (const id of detailIds) {
            const matched = goodsList.find((good) => Number(good.GOOD_ID) === id);
            const lastmod = matched && matched.UPLOAD_TIME
                ? new Date(matched.UPLOAD_TIME).toISOString().split('T')[0]
                : '';
            xml += buildSitemapEntry(siteUrl, `/home/detail/${id}`, {
                changefreq: 'daily',
                priority: '0.85',
                lastmod
            });
        }

        xml += '</urlset>';

        res.set('Content-Type', 'application/xml');
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(xml);
    } catch (e) {
        res.status(500).send('Error generating sitemap');
    }
})
export default all;

