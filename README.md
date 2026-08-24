# Doutify — Music Album Explorer

> **English** | [简体中文](./README.zh-CN.md)

<p align="center">
  <img src="./doutify.webp" alt="Doutify logo" width="256" />
</p>

Doutify is a music album exploration platform designed to make it quick and easy to look up album information — especially when you are adding a new music album entry on [Douban Music](https://music.douban.com/). All album metadata is powered by the [Spotify Web API](https://developer.spotify.com/documentation/web-api), fetched server-side and proxied through Next.js API routes.

## ✨ Features

- 🔍 **Smart Search** — Search albums and artists with pagination (15 results per page) and sorting by release date (newest / oldest / relevance).
- 💿 **Album Details** — View complete album info: cover art, artists, record label, release date, popularity, genres, external IDs (UPC / ISRC, etc.), and the Spotify link.
- 📋 **Copy & Download** — One-click copy for the album name, artists, label, release date, external IDs, Spotify link, or the full track list; download the cover art directly from the detail page.
- 🆕 **Discover** — See the latest releases pulled from a curated public Spotify playlist, cached locally for 5 days; also browse the full playlist on the [Discover page](./app/discover/page.tsx) or a dedicated [New Releases page](./app/new/page.tsx).
- 🎵 **Track List** — Full track list with per-track durations and copy support.
- 🔗 **Related Albums** — A "Discovery" section on each album page shows more releases from the same artist.
- 🎨 **Modern UI** — Responsive dark-mode interface built with [Tailwind CSS](https://tailwindcss.com/) and the [Geist](https://vercel.com/font) font family.

## 🛠 Tech Stack

| Layer      | Technology |
| ---------- | ---------- |
| Framework  | [Next.js 16](https://nextjs.org/) (App Router) |
| UI Library | [React 19](https://react.dev/) |
| Language   | [TypeScript](https://www.typescriptlang.org/) |
| Styling    | [Tailwind CSS 4](https://tailwindcss.com/) + [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography) |
| Data Source| [Spotify Web API](https://developer.spotify.com/documentation/web-api) (Client Credentials Flow) |
| Markdown   | [react-markdown](https://github.com/remarkjs/react-markdown) |
| Hosting    | [Vercel](https://vercel.com/) with [Analytics](https://vercel.com/docs/analytics) & [Speed Insights](https://vercel.com/docs/speed-insights) |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.18+ (or the version required by your Next.js release)
- A free [Spotify Developer](https://developer.spotify.com/dashboard) app (Client Credentials flow only — no user authorization needed)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create a Spotify app and copy your credentials
#    (Dashboard → Your app → Settings → Client ID / Client Secret)

# 3. Configure environment variables
cp .env.local.example .env.local   # or create .env.local
```

`.env.local`:

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

### Run locally

```bash
npm run dev      # start the dev server at http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # run ESLint
```

## 🗂 Project Structure

```
album-info/
├── app/                        # Next.js App Router (pages + API routes)
│   ├── page.tsx                # Home: search + Discover (new releases)
│   ├── album/[id]/page.tsx     # Album detail page
│   ├── new/page.tsx            # New Releases page
│   ├── discover/
│   │   ├── page.tsx            # Curated playlist page (server component)
│   │   ├── DiscoverClient.tsx  # Playlist table UI
│   │   └── playlist_cache.json # Local cache of playlist data (5 days)
│   ├── privacy/page.tsx        # Privacy policy page (renders PRIVACY_POLICY.md)
│   ├── components/             # Footer, NewReleases
│   └── api/spotify/            # Server-side proxy to the Spotify Web API
│       ├── search/route.ts
│       ├── album/[id]/route.ts
│       ├── artist/[id]/albums/route.ts
│       ├── playlist/[id]/route.ts
│       ├── new-releases/route.ts
│       └── token/route.ts
├── components/
│   └── AlbumCard.tsx           # Reusable album card component
├── lib/
│   └── spotify.ts              # Spotify auth (client credentials flow)
└── PRIVACY_POLICY.md           # Source of the privacy policy page
```

## 🔌 API Routes

All routes proxy to the [Spotify Web API](https://developer.spotify.com/documentation/web-api) server-side so credentials never leak to the client.

| Route | Description |
| ----- | ----------- |
| `GET /api/spotify/search?q=&type=&limit=&offset=` | Search albums & artists |
| `GET /api/spotify/album/[id]` | Album details (tracks, label, external IDs…) |
| `GET /api/spotify/artist/[id]/albums` | Latest albums by an artist (top 6) |
| `GET /api/spotify/playlist/[id]` | Spotify playlist details |
| `GET /api/spotify/new-releases` | New releases derived from the cached playlist (falls back to Spotify's new-releases browse) |
| `GET /api/spotify/token` | Obtain a Spotify access token |

## ☁️ Deployment

The project is ready to deploy on [Vercel](https://vercel.com/):

```bash
vercel
```

Set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` as environment variables in your Vercel project settings. [Vercel Analytics](https://vercel.com/docs/analytics) and [Speed Insights](https://vercel.com/docs/speed-insights) are already wired up in [`app/layout.tsx`](./app/layout.tsx).

## 🔒 Privacy

We take privacy seriously — no personal data is collected or stored. See the [Privacy Policy](./PRIVACY_POLICY.md) or the rendered `app/privacy/page.tsx` page for details.

## 🤝 Related

- [Chinese README](./README.zh-CN.md) (简体中文)
- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Douban Music](https://music.douban.com/)
