# Doutify — 音乐专辑探索平台

> [English](./README.md) | **简体中文**

<p align="center">
  <img src="./doutify.webp" alt="Doutify 标志" width="256" />
</p>

Doutify 是一个音乐专辑探索平台，主要用于在为 [豆瓣音乐](https://music.douban.com/) 添加专辑条目时快速查询专辑信息。所有专辑元数据均来自 [Spotify Web API](https://developer.spotify.com/documentation/web-api)，由服务端统一获取，并通过 Next.js API 路由代理给前端，凭证不会暴露给客户端。

## ✨ 主要功能

- 🔍 **智能搜索与链接直达** — 实时防抖搜索，支持专辑类型筛选（`All` / `Albums` / `Singles & EPs`）、按发行日期排序、分页浏览（每页 10 条）、`⌘K` / `/` 搜索快捷键，以及自动识别粘贴的 Spotify 专辑链接或 URI（`open.spotify.com/album/...` / `spotify:album:...`）一键直达。
- 💿 **专辑详情与归档信息** — 展示高分辨率封面、艺术家、唱片公司、发行日期、多碟曲目分组（Disc 分组）、Explicit 标记、UPC / EAN 条码、版权声明与 Spotify 链接。
- 📋 **复制、下载与豆瓣工作流** — 支持一键复制完整条目 `Copy All Info`、`Copy Tracklist`、`Copy Timed List`（含曲目时长）、各项元数据胶囊、单曲名快速复制，支持封面原图下载，并附带 `Search Douban` / `Add to Douban` 直达入口。
- 🎧 **整碟与单曲内嵌试听** — 可在详情页内直接展开整张专辑或任意单曲的 Spotify 播放器试听。
- 🆕 **每日新碟与精选歌单** — 结合 Spotify `tag:new` 新专辑检索与实时精选歌单每日聚合刷新（24 小时缓存 + 本地缓存兜底），可在[发现页](./app/discover/page.tsx)即时筛选曲目或前往[新碟页面](./app/new/page.tsx)按类别浏览。
- ★ **Saved Crate 收藏夹与最近浏览** — 支持在本地持久化收藏感兴趣的专辑与记录最近浏览过的专辑，回到首页即可直接查看。
- 🎨 **极简黑曜石质感 UI** — 基于 `#050505` 纯黑曜石画布与 [Tailwind CSS](https://tailwindcss.com/)，搭配 `Instrument Serif`、`Geist` 与 `Geist Mono` 排版体系。

## 🛠 技术栈

| 分层      | 技术 |
| ---------- | ---------- |
| 框架  | [Next.js 16](https://nextjs.org/)（App Router） |
| UI 库 | [React 19](https://react.dev/) |
| 语言   | [TypeScript](https://www.typescriptlang.org/) |
| 样式    | [Tailwind CSS 4](https://tailwindcss.com/) + [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography) |
| 数据源| [Spotify Web API](https://developer.spotify.com/documentation/web-api)（Client Credentials 流程） |
| Markdown   | [react-markdown](https://github.com/remarkjs/react-markdown) |
| 托管    | [Vercel](https://vercel.com/)，集成 [Analytics](https://vercel.com/docs/analytics) 与 [Speed Insights](https://vercel.com/docs/speed-insights) |

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 18.18+（或与你的 Next.js 版本对应的要求）
- 一个免费的 [Spotify Developer](https://developer.spotify.com/dashboard) 应用（仅需 Client Credentials 流程，无需用户授权）

### 安装配置

```bash
# 1. 安装依赖
npm install

# 2. 创建 Spotify 应用并复制凭证
#    （Dashboard → 你的应用 → Settings → Client ID / Client Secret）

# 3. 配置环境变量
cp .env.local.example .env.local   # 或手动创建 .env.local
```

`.env.local`：

```env
SPOTIFY_CLIENT_ID=你的_client_id
SPOTIFY_CLIENT_SECRET=你的_client_secret
```

### 本地运行

```bash
npm run dev      # 启动开发服务器，访问 http://localhost:3000
npm run build    # 生产构建
npm run start    # 运行生产构建
npm run lint     # 运行 ESLint
```

## 🗂 项目结构

```
album-info/
├── app/                        # Next.js App Router（页面 + API 路由）
│   ├── page.tsx                # 首页：实时搜索、链接识别、收藏夹、最近浏览与新碟速递
│   ├── not-found.tsx           # 自定义 404 页面
│   ├── album/[id]/
│   │   ├── page.tsx            # 专辑详情、单曲试听、豆瓣结构化复制与快捷跳转
│   │   └── loading.tsx         # 详情页加载骨架屏
│   ├── new/
│   │   ├── page.tsx            # 每日新碟页面（支持类型筛选）
│   │   └── loading.tsx         # 新碟页加载骨架屏
│   ├── discover/
│   │   ├── page.tsx            # 精选歌单页（服务端组件）
│   │   ├── DiscoverClient.tsx  # 支持即时筛选的歌单表格 UI
│   │   ├── loading.tsx         # 歌单页加载骨架屏
│   │   └── playlist_cache.json # 歌单数据本地兜底缓存
│   ├── privacy/page.tsx        # 隐私政策页（渲染 PRIVACY_POLICY.md）
│   ├── components/             # Header、Footer、FadeImage、NewReleases
│   └── api/spotify/            # Spotify Web API 服务端代理
│       ├── search/route.ts
│       ├── album/[id]/route.ts
│       ├── artist/[id]/albums/route.ts
│       ├── playlist/[id]/route.ts
│       └── new-releases/route.ts
├── components/
│   └── AlbumCard.tsx           # 可复用的专辑卡片组件
├── lib/
│   ├── spotify.ts              # Spotify 认证缓存与响应结构兼容处理
│   ├── recentAlbums.ts         # 最近浏览专辑本地存储工具
│   └── savedAlbums.ts          # 收藏夹本地存储工具
└── PRIVACY_POLICY.md           # 隐私政策页的内容来源
```

## 🔌 API 路由

所有路由都在服务端代理 [Spotify Web API](https://developer.spotify.com/documentation/web-api) 请求，凭证不会泄露到客户端。

| 路由 | 说明 |
| ----- | ----------- |
| `GET /api/spotify/search?q=&type=&limit=&offset=` | 搜索专辑与艺术家（兼容开发模式上限） |
| `GET /api/spotify/album/[id]` | 专辑详情（自动翻页获取 >50 首多碟完整曲目） |
| `GET /api/spotify/artist/[id]/albums` | 艺术家的最新发行作品（前 6 张） |
| `GET /api/spotify/playlist/[id]` | Spotify 歌单详情 |
| `GET /api/spotify/new-releases` | 每日聚合新碟列表（`tag:new` 新专辑检索 + 实时精选歌单，支持多级回退） |

## ☁️ 部署

项目已为 [Vercel](https://vercel.com/) 部署做好准备：

```bash
vercel
```

在 Vercel 项目设置中将 `SPOTIFY_CLIENT_ID` 和 `SPOTIFY_CLIENT_SECRET` 配置为环境变量。[Vercel Analytics](https://vercel.com/docs/analytics) 和 [Speed Insights](https://vercel.com/docs/speed-insights) 已在 [`app/layout.tsx`](./app/layout.tsx) 中接入。

## 🔒 隐私

我们非常重视隐私 — 本应用不收集、不存储任何个人数据。详见[隐私政策](./PRIVACY_POLICY.md)或站内由 `app/privacy/page.tsx` 渲染的隐私政策页面。

## 🤝 相关链接

- [English README](./README.md)（英文版）
- [Spotify Web API 文档](https://developer.spotify.com/documentation/web-api)
- [豆瓣音乐](https://music.douban.com/)
