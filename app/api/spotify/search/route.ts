import { NextResponse } from 'next/server';
import { getErrorResponse, SpotifyAlbumSummary, spotifyFetch } from '@/lib/spotify';

const MAX_SEARCH_LIMIT = 10;

interface SearchResponse {
    albums?: {
        items?: Array<SpotifyAlbumSummary | null>;
        total?: number;
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const type = searchParams.get('type') || 'album';
    const rawLimit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const rawOffset = Number.parseInt(searchParams.get('offset') || '0', 10);

    if (!query) {
        return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    const limit = Number.isFinite(rawLimit)
        ? Math.min(Math.max(rawLimit, 1), MAX_SEARCH_LIMIT)
        : MAX_SEARCH_LIMIT;
    const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

    try {
        const params = new URLSearchParams({
            q: query,
            type,
            limit: String(limit),
            offset: String(offset),
        });

        const data = await spotifyFetch<SearchResponse>(`/search?${params.toString()}`, {
            next: { revalidate: 300 },
        });

        if (data?.albums?.items && Array.isArray(data.albums.items)) {
            data.albums.items = data.albums.items.filter(Boolean);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Spotify Search API Error:', error);
        const { message, status } = getErrorResponse(error);
        return NextResponse.json({ error: message }, { status });
    }
}
