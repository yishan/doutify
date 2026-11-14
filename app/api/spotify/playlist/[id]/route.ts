import { NextResponse } from 'next/server';
import { getErrorResponse, spotifyFetch } from '@/lib/spotify';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Missing playlist ID' }, { status: 400 });
    }

    try {
        const data = await spotifyFetch(`/playlists/${encodeURIComponent(id)}`, {
            next: { revalidate: 3600 },
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error('Spotify Playlist API Error:', error);
        const { message, status } = getErrorResponse(error);
        return NextResponse.json({ error: message }, { status });
    }
}
