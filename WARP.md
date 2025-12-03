# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 16 application that provides a Spotify album search interface. The app uses the Spotify Web API to search for albums and display their details including cover art, artist names, release dates, and track counts.

## Development Commands

### Running the application
```bash
npm run dev        # Start development server at http://localhost:3000
npm run build      # Create production build
npm start          # Run production server
npm run lint       # Run ESLint
```

### Environment Setup
The application requires Spotify API credentials in `.env.local`:
- `SPOTIFY_CLIENT_ID` - Spotify application client ID
- `SPOTIFY_CLIENT_SECRET` - Spotify application client secret

These credentials are obtained from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4
- **Fonts**: Geist Sans and Geist Mono (via next/font)
- **Image Optimization**: Next.js Image component configured for Spotify CDN (`i.scdn.co`)

### Directory Structure
- `app/` - Next.js App Router pages and API routes
  - `page.tsx` - Main search UI (client component)
  - `layout.tsx` - Root layout with font configuration
  - `api/spotify/search/route.ts` - API route for Spotify album search
  - `globals.css` - Global styles and Tailwind directives

### Key Architecture Patterns

**API Integration Pattern**:
The app uses a backend-for-frontend pattern where the Next.js API route (`app/api/spotify/search/route.ts`) acts as a proxy to the Spotify API. This keeps credentials secure on the server side and handles OAuth token management.

**Authentication Flow**:
1. API route uses client credentials flow to obtain access token from Spotify
2. Token is generated on-demand for each search request
3. Client ID and secret are base64-encoded for Basic authentication
4. Bearer token is used to authenticate search API requests

**Image Handling**:
The `next.config.ts` configures remote patterns to allow images from `i.scdn.co` (Spotify's CDN). The app uses Next.js Image component with `fill` layout for responsive album covers.

### TypeScript Configuration
- Path alias `@/*` maps to project root for cleaner imports
- Target: ES2017
- Strict mode enabled
- JSX transform: react-jsx (automatic JSX runtime)

## Development Notes

### Client vs Server Components
- `app/page.tsx` is a client component (`'use client'`) as it uses React hooks and handles form interactions
- `app/layout.tsx` is a server component (default)
- API routes are server-side by default

### Styling Approach
The app uses Tailwind CSS with a dark theme. Primary color scheme uses green (`green-500`, `green-400`) consistent with Spotify branding. Utility classes are preferred over custom CSS.

### Error Handling
API routes return structured JSON errors with appropriate HTTP status codes (400 for bad requests, 500 for server errors). The frontend displays user-friendly error messages in a styled alert component.
