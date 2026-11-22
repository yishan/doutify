import { NextResponse } from 'next/server';
import { getErrorResponse, spotifyFetch, SpotifyTrackItem } from '@/lib/spotify';

const MAX_TRACK_PAGES = 5;

interface AlbumDetailResponse {
    tracks?: {
        items?: Array<SpotifyTrackItem | null>;
        next?: string | null;
        total?: number;
        limit?: number;
        offset?: number;
    };
    [key: string]: unknown;
}

interface TrackPageResponse {
    items?: Array<SpotifyTrackItem | null>;
    next?: string | null;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Missing album ID' }, { status: 400 });
    }

    try {
        const data = await spotifyFetch<AlbumDetailResponse>(`/albums/${encodeURIComponent(id)}`, {
            cache: 'no-store',
        });

        if (data?.tracks?.items && Array.isArray(data.tracks.items)) {
            const allItems = [...data.tracks.items.filter(Boolean)];
            let nextUrl: string | null = data.tracks.next ?? null;
            let page = 0;

            const { total, limit, offset = 0 } = data.tracks;
            if (nextUrl && typeof total === 'number' && Number.isFinite(total)
                && typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
                const pageCount = Math.min(MAX_TRACK_PAGES, Math.ceil((total - offset - limit) / limit));
                const pageUrl = nextUrl;
                const pages = await Promise.all(Array.from({ length: Math.max(0, pageCount) }, (_, index) => {
                    const url = new URL(pageUrl);
                    url.searchParams.set('offset', String(offset + (index + 1) * limit));
                    url.searchParams.set('limit', String(limit));
                    return spotifyFetch<TrackPageResponse>(url.toString(), {
                        cache: 'no-store',
                    });
                }));
                for (const trackPage of pages) {
                    if (Array.isArray(trackPage?.items)) {
                        allItems.push(...trackPage.items.filter(Boolean));
                    }
                    nextUrl = trackPage?.next ?? null;
                }
            } else while (nextUrl && page < MAX_TRACK_PAGES) {
                const nextPage = await spotifyFetch<TrackPageResponse>(nextUrl, {
                    cache: 'no-store',
                });
                if (Array.isArray(nextPage?.items)) {
                    allItems.push(...nextPage.items.filter(Boolean));
                }
                nextUrl = nextPage?.next ?? null;
                page += 1;
            }

            data.tracks.items = allItems;
            data.tracks.next = nextUrl;
        }

        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' },
        });
    } catch (error) {
        console.error('Spotify Album API Error:', error);
        const { message, status } = getErrorResponse(error);
        return NextResponse.json({ error: message }, { status });
    }
}
