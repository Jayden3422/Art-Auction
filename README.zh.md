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
  - [SEO 架构](#seo-架构)
  - [公开可抓取页面](#公开可抓取页面)
  - [Sitemap 与 Robots 一致性](#sitemap-与-robots-一致性)
  - [SSR 与预渲染覆盖](#ssr-与预渲染覆盖)
  - [SEO CI 门禁](#seo-ci-门禁)
  - [Search Console Monitor](#search-console-monitor)
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
| 运维 | GitHub Actions（SEO Gate + GSC Monitor）、阿里云 OSS（图片存储）、gzip 压缩、Content-Security-Policy |
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
| `TRUST_PROXY` | Express 反向代理信任配置，用于在代理后正确识别客户端 IP（如 `1`、`true`、`loopback`） |
| `MONGO_URL` | MongoDB 连接字符串 |
| `MONGO_DB_NAME` | MongoDB 数据库名（默认：`liujinqi`） |
| `JWT_SALT` | JWT 签名密钥 |
| `SITE_URL` | 站点公开 URL，用于 Sitemap 生成 |
| `SEO_HOT_DETAIL_IDS` | 可选：逗号分隔的详情页 ID，强制保留在 sitemap 中 |
| `OSS_*` | 阿里云 OSS 凭证，用于图片存储 |

### 前端

```bash
cd frontend
cp .env.sample .env     # 设置端口及可选的 GSC 验证码
npm install
npm run serve           # 开发环境
npm run build           # 生产构建（含预渲染）
```

**前端环境变量**（`frontend/.env`）：
| 变量 | 用途 |
|------|------|
| `VUE_APP_APP_PORT` | 开发环境下前端代理到后端 API 的端口 |
| `VUE_APP_WS_PORT` | 前端使用的 WebSocket 服务端口 |
| `VUE_APP_GSC_VERIFICATION` | 可选：Search Console HTML 验证码 |

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

本项目保持 Vue CLI SPA 架构，同时提供可抓取 HTML 和可执行的 SEO 质量门禁。

### SEO 架构

- **面向爬虫的服务端渲染：** `backend/middleware/seoRender.js` 为关键落地路由返回完整 HTML。
- **SPA 动态 Meta 管理：** `frontend/src/utils/seo.js` 在前端路由切换时更新 title、meta、canonical、hreflang。
- **URL 规范化统一：** 详情页仅保留 `/home/detail/:id` 作为规范 URL；历史写法（`/home/detail?GOOD_ID=...`、`/home/details/:id`、`/home/details?GOOD_ID=...`）统一 `301` 到规范路径。
- **拍卖列表 Query 规范化：** `/home/auction?category=...`、`/home/auction?state=...` 统一重定向到规范分类路径。
- **前端路由状态码收敛：** 生产环境仅已知 SPA 路由返回 `index.html`，未知前端路径返回真实 `404`，避免软 404。
- **构建期预渲染：** `frontend/vue.config.js` 在生产构建时预渲染 `/login` 和 `/signin`。
- **CI 门禁：** `.github/workflows/seo-gate.yml` 执行结构化 SEO 校验与 Lighthouse CI，并产出摘要和产物。

### 公开可抓取页面

- `backend/app.js` 将前端 HTML 路由保持为公开访问，并对白名单 SEO API 放行；受保护 API 仍要求 token 校验。
- 可被爬虫直接访问的接口包括：
  - `GET /all/getAllGoods`
  - `GET /all/getAllNear`
  - `GET /all/getAllSale`
  - `GET /all/getAllEnd`
  - `GET /all/getGood/:id`
  - `GET /all/getPriceList/:id`
- `seoRender()` 会为以下页面返回完整 HTML（含 `<h1>`、canonical、hreflang、JSON-LD）：
  - `/home/auction`
  - `/home/auction/upcoming`
  - `/home/auction/live`
  - `/home/auction/ended`
  - `/home/detail/:id`
- 前端路由提供可直接承接 SERP 人类流量的真实入口：
  - `/home/auction/upcoming`、`/home/auction/live`、`/home/auction/ended`
  - `/home/detail/:id`
- 可通过 `?__seo=1`（或请求头 `x-seo-render: 1`）强制输出 SEO HTML，便于验证与调试。

### Sitemap 与 Robots 一致性

- `GET /robots.txt` 由后端动态生成，并始终输出绝对地址的 sitemap：
  - `Sitemap: <SITE_URL>/all/sitemap.xml`
  - 通过 `resolveSiteUrl()` + `toAbsoluteUrl()` 生成。
- `GET /all/sitemap.xml` 生成规范化绝对 URL，包含：
  - 落地页：`/login`、`/signin`
  - 列表页：`/home/auction`、`/home/auction/upcoming`、`/home/auction/live`、`/home/auction/ended`
  - 详情页：来自活跃库存的 `/home/detail/:id`，并支持附加 `SEO_HOT_DETAIL_IDS`
  - `hreflang` 变体（`en`、`zh`、`x-default`）和可用时的 `lastmod`。
- 不存在的详情页会返回真实 `404`。
- 生产环境下未知前端路由也返回真实 `404`（避免 SPA 壳页 `200` 导致 soft-404）。

### SSR 与预渲染覆盖

- 在不迁移到 Nuxt/Next 的前提下，对高价值自然流量入口页应用服务端 SEO HTML：
  - 拍卖列表页
  - 分类页（`upcoming`、`live`、`ended`）
  - 详情页。
- 构建期预渲染保留 `/login`、`/signin` 的静态 HTML，提升首屏可见性。
- 在 CI 中可通过 `ENABLE_PRERENDER=0` 关闭预渲染，保证构建过程可重复。

### SEO CI 门禁

- 工作流：`.github/workflows/seo-gate.yml`（`pull_request` + `push` 到 `main`）
- 核心校验：robots/sitemap、canonical 重定向、404 行为、JSON-LD 有效性、Lighthouse SEO 分数（`>= 0.9`）
- 若缺少 `secrets.MONGO_URL`，依赖后端的门禁会跳过
- 每次执行都会产出可追踪信息：`seo-ci.log`、`lhci.log`、Job Summary、PR 评论

本地检查：

```bash
cd backend
npm run seo:ci
```

### Search Console Monitor

- 工作流：`.github/workflows/search-console-monitor.yml`
  - 触发方式：手动（`workflow_dispatch`）
  - 说明：定时触发（`15 3 * * *`, UTC）已临时关闭
- 脚本：`backend/scripts/search-console-monitor.js`
- 监控项：`Soft 404`、`Duplicate without user-selected canonical`（来源于 sitemap URL）
- 必要配置：`GSC_SERVICE_ACCOUNT_JSON`、`GSC_PROPERTY_URI`、`SITE_URL`

本地运行：

```bash
cd backend
npm run seo:gsc-monitor
```

---

## 测试

后端测试使用 **Jest** + **supertest**（Node ESM 模式）。

```bash
cd backend
npm test
```

监听模式：

```bash
cd backend
npm run test:watch
```

单独运行某个套件：

```bash
cd backend
npm test -- --runTestsByPath __tests__/seo-routes.test.js
```

SEO 冒烟检查：

```bash
cd backend
npm run seo:health
# 可选：开启前端路由检查
# SEO_CHECK_FRONTEND=1 npm run seo:health
```

当前 `backend/__tests__/` 主要覆盖：
- 认证与安全：token、中间件/CORS、限流
- 校验与工具：`judge`、`md5`、`base64`、`promise`
- SEO 路由：`frontend-routes`、`seo-routes`

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
