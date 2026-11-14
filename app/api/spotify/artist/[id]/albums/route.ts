import { NextResponse } from 'next/server';
import { getErrorResponse, SpotifyAlbumSummary, spotifyFetch } from '@/lib/spotify';

const toTimestamp = (dateStr?: string) => {
    if (!dateStr) return 0;
    const ts = new Date(dateStr).getTime();
    return Number.isFinite(ts) ? ts : 0;
};

interface ArtistAlbumsResponse {
    items?: Array<SpotifyAlbumSummary | null>;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Missing artist ID' }, { status: 400 });
    }

    try {
        // limit=10 stays within Spotify Development Mode caps while providing enough items for top 6
        const data = await spotifyFetch<ArtistAlbumsResponse>(
            `/artists/${encodeURIComponent(id)}/albums?include_groups=album,single&limit=10`,
            { next: { revalidate: 3600 } }
        );

        const items = Array.isArray(data?.items)
            ? data.items.filter((item): item is SpotifyAlbumSummary => Boolean(item))
            : [];
        const sortedAlbums = items
            .sort((a, b) => toTimestamp(b.release_date) - toTimestamp(a.release_date))
            .slice(0, 6);

        return NextResponse.json({ items: sortedAlbums });
    } catch (error) {
        console.error('Spotify Artist Albums API Error:', error);
        const { message, status } = getErrorResponse(error);
        return NextResponse.json({ error: message }, { status });
    }
}
