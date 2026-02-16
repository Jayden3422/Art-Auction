# 艺术品拍卖平台

[English](README.md) | **中文**

基于 **Vue 3** 和 **Express.js** 构建的全栈在线艺术品拍卖平台，具备 WebSocket 实时竞拍、基于角色的权限控制、面向单页应用的工程级 SEO 优化，以及数据可视化与 PDF 导出功能。

## 目录

- [项目概述](#项目概述)
  - [核心功能](#核心功能)
  - [技术栈](#技术栈)
- [安装与运行](#安装与运行)
- [主要功能](#主要功能)
  - [国际化 (i18n)](#国际化-i18n)
  - [RESTful API 设计](#restful-api-设计)
  - [实时拍卖模块](#实时拍卖模块)
  - [数据统计与 PDF 导出](#数据统计与-pdf-导出)
- [SEO 工程](#seo-工程)
  - [挑战：Vue SPA 的 SEO 问题](#挑战vue-spa-的-seo-问题)
  - [近期 SEO 实现更新（2026-02）](#近期-seo-实现更新2026-02)
  - [架构总览](#架构总览)
  - [后端 SEO 基础设施](#后端-seo-基础设施)
  - [前端动态 Meta 管理](#前端动态-meta-管理)
  - [结构化数据 (JSON-LD)](#结构化数据-json-ld)
  - [国际化 SEO (hreflang)](#国际化-seo-hreflang)
  - [预渲染策略](#预渲染策略)
  - [可抓取性与索引控制](#可抓取性与索引控制)
- [测试](#测试)
- [系统架构](#系统架构)
- [功能模块](#功能模块)
  - [注册与登录](#注册与登录)
  - [艺术品发布](#艺术品发布)
  - [个人信息管理](#个人信息管理)
  - [用户管理（管理员）](#用户管理管理员)
  - [订单管理](#订单管理)
  - [公告管理](#公告管理)
  - [商品管理（管理员）](#商品管理管理员)

---

## 项目概述

一个在线艺术品拍卖平台，为艺术品交易提供安全、高效的空间。用户可以浏览、竞拍和购买涵盖绘画、书法、陶瓷、雕塑、金属工艺品和奇石等品类的艺术品。

### 核心功能

- 基于 JWT 的身份认证，支持角色权限控制（买家 / 卖家 / 管理员）
- 通过 WebSocket 实现实时竞拍，具备出价验证和到时自动锁定功能
- 完整的拍卖生命周期：即将开始 → 进行中 → 已结束 → 订单履约
- 管理员后台：用户、商品、订单、公告管理
- 数据可视化（ECharts）及 PDF 报表导出（html2canvas + jsPDF + Web Workers）
- 中英双语支持（vue-i18n）
- 工程级 SEO 优化，解决 Vue SPA 的搜索引擎抓取难题

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3、Vue Router 4、Vuex 4、Ant Design Vue、Less |
| 后端 | Node.js 20、Express.js、WebSocket |
| 数据库 | MongoDB |
| SEO | 自研 DOM Meta 管理、JSON-LD、动态 Sitemap、预渲染 |
| 测试 | Jest、supertest |
| 运维 | 阿里云 OSS（图片存储）、gzip 压缩、Content-Security-Policy |
| 可视化 | ECharts、html2canvas、jsPDF、Web Workers |

## 安装与运行

### 前置条件

- Node.js 20+
- MongoDB 本地运行（默认：`mongodb://localhost:27017/`）

### 后端

```bash
cd backend
cp .env.sample .env     # 编辑 MongoDB、JWT、OSS 及站点 URL 配置
npm install
npm run dev             # 开发环境
npm start               # 生产运行
```

**环境变量**（`.env`）：
| 变量 | 用途 |
|------|------|
| `APP_PORT` | Express 服务端口（默认：3000） |
| `WS_PORT` | WebSocket 服务端口（默认：3001） |
| `MONGO_URL` | MongoDB 连接字符串 |
| `JWT_SALT` | JWT 签名密钥 |
| `SITE_URL` | 站点公开 URL，用于 Sitemap 生成 |
| `OSS_*` | 阿里云 OSS 凭证，用于图片存储 |

### 前端

```bash
cd frontend
cp .env.sample .env     # 设置端口及可选的 GSC 验证码
npm install
npm run serve           # 开发环境
npm run build           # 生产构建（含预渲染）
```

### 数据库

```bash
# 初始化 MongoDB 数据库结构和示例数据
node data/liujinqi.js
```

---

## 主要功能

### 国际化 (i18n)

使用 **vue-i18n** 配置，默认语言为英文，中文为第二语言。语言文件位于 `frontend/src/locales/en.js` 和 `frontend/src/locales/zh.js`。页面顶部提供语言切换按钮。

### RESTful API 设计

在 `frontend/src/utils/` 中封装 Axios，提供标准 HTTP 方法（GET、POST、PUT、DELETE）的 RESTful 接口。API 层统一处理请求/响应转换、错误处理和 Token 注入。

### 实时拍卖模块

拍卖模块通过 **WebSocket**（`frontend/src/ws/`）实现实时竞拍：

- 所有在线用户同步看到最新出价
- 出价验证：拒绝低于起拍价或低于当前最高价 + 加价幅度的出价
- 同一用户禁止重复出价
- 拍卖截止时间到达后自动锁定
- 最高出价者中标并自动生成订单

**拍卖生命周期：** 即将开始（预览与关注）→ 进行中（实时竞拍）→ 已结束（查看结果与订单历史）

<img src="README.assets/Artwork auction module timing diagram.png" alt="拍卖模块时序图" style="zoom: 90%;" />

| 视图 | 截图 |
|------|------|
| 买家 - 即将开始 | ![即将开始](README.assets/Snipaste_2025-09-05_21-55-07.png) |
| 买家 - 已结束 | ![已结束](README.assets/Snipaste_2025-09-05_21-55-22.png) |
| 买家 - 正在竞拍 | ![竞拍中](README.assets/Snipaste_2025-09-05_21-56-29.png) |
| 出价低于最低价（红色警告） | ![低于最低价](README.assets/Snipaste_2025-09-05_21-56-35.png) |
| 多用户实时出价 | ![多用户](README.assets/Snipaste_2025-09-05_21-57-10.png) |
| 到时自动锁定 | ![锁定](README.assets/Snipaste_2025-09-05_22-16-08.png) |
| 中标者与生成订单 | ![中标](README.assets/Snipaste_2025-09-05_22-17-08.png) |
| 管理员 - 拍卖概览 | ![管理员](README.assets/Snipaste_2025-09-05_21-09-17.png) |

### 数据统计与 PDF 导出

使用 **ECharts** 绘制折线图、饼图和柱状图，对各艺术品品类的拍卖趋势进行分析。

**PDF 导出**基于 `html2canvas` + `jsPDF` + **Web Workers** 实现：
- 将页面拆分为多个 DOM 片段，以规避浏览器 Canvas 高度限制
- 每个片段渲染为 Canvas 后合并为单一 PDF
- 跨页边界的元素通过特殊 class 标记为原子块，防止截断

<img src="README.assets/Data statistics module timing diagram.png" alt="数据统计模块时序图" style="zoom:50%;" />

| 可视化 | 截图 |
|--------|------|
| 趋势分析 | ![趋势](README.assets/Snipaste_2025-09-05_21-36-08.png) |
| 品类分布 | ![品类](README.assets/Snipaste_2025-09-05_21-39-09.png) |
| 详细统计 | ![统计](README.assets/Snipaste_2025-09-05_21-39-30.png) |
| 导出的 PDF 报表 | ![PDF](README.assets/report-pdf.png) |

![分页切割原理](README.assets/Page cutting principle.png)

---

## SEO 工程

### 挑战：Vue SPA 的 SEO 问题

单页应用天生不利于搜索引擎抓取。整个 UI 由客户端 JavaScript 渲染，爬虫在初次加载时只能看到一个空的 `<div id="app">`。传统方案是迁移到 SSR（Nuxt.js）或 SSG，但这需要大规模的架构重构。

**我的方案：** 在不迁移 Vue CLI 的前提下，通过后端基础设施、客户端动态 Meta 管理、结构化数据注入和选择性预渲染相结合，构建一套多层级 SEO 体系。

### 近期 SEO 实现更新（2026-02）

- 在 `backend/app.js` 中按“请求方法 + 路径”细化白名单：公开 SEO 路由放行，受保护 API 继续鉴权。
- 新增 `GET /all/getPriceList/:id`，与 `GET /all/getGood/:id` 配对，保证详情数据可被爬虫读取。
- 新增 Bot 日志中间件（`backend/middleware/botLogger.js`），用于观测爬虫行为。
- 新增动态渲染中间件 + 生产静态资源兜底（`backend/middleware/dynamicRender.js`）。
- 公开内容路由移除登录依赖，`Home.vue` / `Auction.vue` 对匿名会话做了容错。
- 详情页数据读取由 POST 改为 GET。
- 增加 `buildBreadcrumbJsonLd`，详情页注入 BreadcrumbList JSON-LD。
- `GoodsList` 改为可抓取链接，同时补充图片尺寸与语义化标题层级。
- 增加 SEO 健康检查脚本：在 `backend` 下执行 `npm run seo:health`。

### 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                      SEO 架构                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  后端 (Express.js)                                          │
│  ├── gzip 压缩 (compression 中间件)                         │
│  ├── 安全响应头 (CSP, X-Content-Type-Options)                │
│  ├── GET /all/getGood/:id — 爬虫可访问的商品接口             │
│  ├── GET /all/sitemap.xml — 从数据库动态生成 XML Sitemap     │
│  └── 404 兜底路由，返回正确状态码                             │
│                                                             │
│  前端 (Vue 3)                                               │
│  ├── 路由守卫 → 每次导航调用 updateRouteMeta()               │
│  │   ├── document.title                                     │
│  │   ├── <meta> description, keywords, og:*, twitter:*      │
│  │   ├── <link rel="canonical">                             │
│  │   └── <link rel="alternate" hreflang="...">              │
│  ├── 详情页 → 动态 Product JSON-LD                           │
│  ├── 列表页 → ItemList JSON-LD                              │
│  ├── 应用级 → WebSite + Organization JSON-LD                │
│  ├── 404 兜底路由，设置 noindex meta                         │
│  └── 预渲染 (/login, /signin) 于构建时生成                   │
│                                                             │
│  静态资源                                                    │
│  ├── robots.txt — 屏蔽需登录的管理页面                       │
│  ├── index.html — 基础 meta + OG + Twitter Card              │
│  └── .env — GSC 验证码、站点 URL 配置                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 后端 SEO 基础设施

**文件：** `backend/app.js`、`backend/routers/all.js`

1. **Gzip 压缩** — `compression` 中间件减小响应体积，提升页面加载速度（搜索引擎排名因素之一）。

2. **安全响应头** — 所有响应均添加 Content-Security-Policy、X-Content-Type-Options、X-Frame-Options。使用现代 CSP 替代已废弃的 X-XSS-Protection。

3. **爬虫可访问的 GET 接口** — 将原本仅支持 POST 的 `/all/getGood` 增加 `GET /all/getGood/:id`，使搜索引擎爬虫无需 POST 请求体即可获取商品数据。

4. **动态 XML Sitemap**（`GET /all/sitemap.xml`）— 查询 MongoDB 中所有活跃和即将开拍的商品，生成符合标准的 XML Sitemap：
   - `<lastmod>` 时间戳
   - 每个 URL 附带 `<xhtml:link rel="alternate" hreflang="...">` 标注（en、zh、x-default）
   - 仅包含可索引的规范 URL（排除已结束 / 已下架商品）

5. **404 兜底** — 在所有路由定义之后，兜底中间件返回 `404` 状态码及 JSON 响应体，确保爬虫对不存在的路径收到正确的 HTTP 状态码。

### 前端动态 Meta 管理

**文件：** `frontend/src/utils/seo.js` — 一个零依赖的工具模块（约 220 行），通过原生 DOM 操作管理所有 SEO 相关事务。

**为什么不用第三方库？** 如 `@unhead/vue` 等库会增加包体积和复杂度。由于项目使用 Vue CLI（非 Nuxt），原生 `document.querySelector` + `document.createElement` 即可实现完全控制，无需额外依赖。

核心函数：

| 函数 | 用途 |
|------|------|
| `setMetaTag(attr, key, content)` | 创建或更新任意 `<meta>` 标签 |
| `setCanonicalUrl(path)` | 设置 `<link rel="canonical">`，防止重复内容 |
| `setHreflang(path)` | 设置双向 `<link rel="alternate" hreflang>` 标注（en/zh/x-default） |
| `updateRouteMeta(meta, fullPath, path)` | 在路由 `beforeEach` 守卫中调用 — 每次导航更新 title、description、keywords、OG 标签、canonical 和 hreflang |

**路由集成**（`main.js`）：`router/index.js` 中每个路由均携带 `meta: { title, description, keywords }`。`beforeEach` 守卫调用 `updateRouteMeta()` 在页面渲染前更新所有 meta 标签。

### 结构化数据 (JSON-LD)

注入 Schema.org 结构化数据以启用 Google 富搜索结果：

| Schema 类型 | 注入位置 | 用途 |
|-------------|----------|------|
| **Product + Offer** | 详情页（`Detail.vue`、`DetailS.vue`） | 单件拍品信息：价格、可用性（4 种状态：PreOrder/InStock/SoldOut/Discontinued）、卖家、SKU、可用时间窗口 |
| **WebSite** | App.vue（mounted） | 站点级身份标识 |
| **Organization** | App.vue（mounted） | 组织信息，用于知识面板 |
| **ItemList** | GoodsList.vue | 拍品列表页（最多 50 件），启用轮播 / 列表富搜索结果 |

**商品可用性逻辑**将拍卖状态映射为 Schema.org 枚举值：
```
拍卖未开始      → schema.org/PreOrder
拍卖进行中      → schema.org/InStock + availabilityEnds
拍卖已结束（成交）→ schema.org/SoldOut
拍卖已结束（流拍）→ schema.org/Discontinued
```

### 国际化 SEO (hreflang)

双向 hreflang 标注告知搜索引擎不同语言版本的对应关系：

- **客户端：** `setHreflang(path)` 在每次路由切换时动态注入 `<link rel="alternate" hreflang="en|zh|x-default">`
- **Sitemap：** 每个 URL 条目包含所有语言变体的 `<xhtml:link>` 替代链接
- **index.html：** 静态 HTML 中预置默认 hreflang 链接作为兜底
- **Google Search Console：** 验证 meta 标签可通过 `VUE_APP_GSC_VERIFICATION` 环境变量配置

### 预渲染策略

**文件：** `frontend/vue.config.js`

对公开的落地页（`/login`、`/signin`），使用 `@prerenderer/webpack-plugin` 配合 Puppeteer 在构建时生成静态 HTML。这使爬虫在关键入口页获取完整渲染的 HTML，无需 SSR 基础设施。

```js
// 仅生产构建 — Puppeteer 不可用时优雅降级
if (isProduction) {
  new PrerendererWebpackPlugin({
    routes: ['/login', '/signin'],
    renderer: '@prerenderer/renderer-puppeteer',
    rendererOptions: { renderAfterTime: 5000, headless: true }
  })
}
```

### 可抓取性与索引控制

- **robots.txt** — 仅屏蔽需登录的管理页面（管理后台、个人设置、订单历史），所有公开页面均可抓取。
- **404 页面**（`NotFound.vue`）— 兜底路由渲染友好的 404 页面，设置 `<meta name="robots" content="noindex, nofollow">` 防止被索引。
- **图片无障碍** — 所有 `<img>` 标签绑定 `:alt` 属性（关联商品名称），并添加 `loading="lazy"` 提升性能。

---

## 测试

后端使用 **Jest** + **supertest**：

```bash
cd backend
npm test
```

SEO 健康检查：

```bash
cd backend
npm run seo:health
# 可选：开启前端路由检查（需启用生产静态资源服务）
# SEO_CHECK_FRONTEND=1 npm run seo:health
```

所有测试文件位于 `backend/__tests__/`。

| 测试文件 | 覆盖范围 |
|----------|----------|
| `rate-limit.test.js` | 限流中间件 — 验证超过阈值后返回 429 |
| `judge.test.js` | 输入校验（手机号、邮箱、日期、QQ、微信） |
| `base64.test.js` | Base64 编解码往返测试 |
| `md5.test.js` | MD5 哈希确定性与加盐区分 |
| `token.test.js` | JWT 创建、验证、过期 |
| `promise.test.js` | `isFine()` Promise 结果处理工具 |
| `middleware.test.js` | CORS 头、OPTIONS 处理、Token 认证 |

---

## 系统架构

基于权限的 JWT 令牌架构：
1. 根据用户 ID 从数据库权限字典解析用户权限
2. 后端使用 `mongodb` 驱动进行 CRUD 操作
3. 前端通过 Axios 经 RESTful HTTP 与后端通信
4. JWT 令牌编码角色和权限 ID；前端路由守卫在授予页面访问权限前检查 `pids`

<img src="README.assets/System architecture diagram.jpg" alt="系统架构图" style="zoom:50%;" />

---

## 功能模块

平台分为**用户端**（买家 + 卖家界面）和**管理后台**两大部分。

![功能模块总图](README.assets/Overall functional module diagram.png)

### 注册与登录

用户通过用户名、邮箱、手机号和密码注册。登录时对数据库进行凭证验证并签发 JWT。Canvas 绘制的验证码（`frontend/src/components/Identify.vue`）附带干扰线，防止自动化提交。

<img src="README.assets/Registration and login sequence diagram.png" alt="注册登录时序图" style="zoom:50%;" />

| 截图 |
|------|
| ![登录](README.assets/Snipaste_2025-09-05_20-58-59.png) |
| ![注册](README.assets/Snipaste_2025-09-05_20-59-53.png) |
| ![验证码示例](README.assets/image-20250906013936314.png) |

### 艺术品发布

卖家提交艺术品信息（标题、描述、起拍价、图片），经管理员审核合法性和真实性后发布上架。

<img src="README.assets/Artwork publishing module timing diagram.png" alt="艺术品发布时序图" style="zoom:50%;" />

![发布表单](README.assets/Snipaste_2025-09-05_22-23-33.png)

### 个人信息管理

用户可查看和编辑个人资料、修改密码、上传头像。

<img src="README.assets/Personal Information Management Sequence Diagram.png" alt="个人信息管理时序图" style="zoom:50%;" />

| ![个人资料查看](README.assets/Snipaste_2025-09-05_22-00-28.png) | ![个人资料编辑](README.assets/Snipaste_2025-09-05_22-00-38.png) |
|---|---|

### 用户管理（管理员）

管理员可新增、删除和修改用户账号。

<img src="README.assets/User management module timing diagram.png" alt="用户管理时序图" style="zoom:50%;" />

| ![用户列表](README.assets/Snipaste_2025-09-05_21-43-06.png) | ![用户详情](README.assets/Snipaste_2025-09-05_21-43-11.png) |
|---|---|

### 订单管理

订单按状态分类：待处理、处理中、已完成。买家中标后填写收货信息；卖家确认并发货；买家确认收货。

<img src="README.assets/Order management module sequence diagram.png" alt="订单管理时序图" style="zoom:50%;" />

| 阶段 | 截图 |
|------|------|
| 买家填写收货信息 | ![收货信息](README.assets/Snipaste_2025-09-05_22-19-49.png) |
| 卖家发货 | ![发货](README.assets/Snipaste_2025-09-05_22-22-00.png) |
| 订单跟踪 | ![跟踪](README.assets/Snipaste_2025-09-05_22-22-24.png) |
| 买家确认收货 | ![确认](README.assets/Snipaste_2025-09-05_22-22-45.png) |

### 公告管理

管理员创建并推送公告（如新艺术品上架通知），所有用户可查看公告列表。

<img src="README.assets/Notification management module timing diagram.png" alt="公告管理时序图" style="zoom:50%;" />

| ![管理员公告](README.assets/Snipaste_2025-09-05_21-16-26.png) | ![用户公告](README.assets/Snipaste_2025-09-05_22-00-49.png) |
|---|---|

### 商品管理（管理员）

管理员管理艺术品：发布、编辑、删除，设置拍卖时间和规则。支持按拍卖状态和品类筛选商品。

<img src="README.assets/Product management module sequence diagram.png" alt="商品管理时序图" style="zoom:50%;" />

| ![按状态](README.assets/Snipaste_2025-09-05_21-11-55.png) | ![按品类](README.assets/Snipaste_2025-09-05_21-15-21.png) |
|---|---|
