import { NextResponse } from 'next/server';
import { getErrorResponse, spotifyFetch, SpotifyTrackItem } from '@/lib/spotify';

const MAX_TRACK_PAGES = 5;

interface AlbumDetailResponse {
    tracks?: {
        items?: Array<SpotifyTrackItem | null>;
        next?: string | null;
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
            next: { revalidate: 3600 },
        });

        if (data?.tracks?.items && Array.isArray(data.tracks.items)) {
            const allItems = [...data.tracks.items.filter(Boolean)];
            let nextUrl: string | null = data.tracks.next ?? null;
            let page = 0;

            while (nextUrl && page < MAX_TRACK_PAGES) {
                const nextPage = await spotifyFetch<TrackPageResponse>(nextUrl, {
                    next: { revalidate: 3600 },
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

        return NextResponse.json(data);
    } catch (error) {
        console.error('Spotify Album API Error:', error);
        const { message, status } = getErrorResponse(error);
        return NextResponse.json({ error: message }, { status });
    }
}
