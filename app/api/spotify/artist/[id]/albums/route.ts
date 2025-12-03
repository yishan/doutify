import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/spotify';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Missing artist ID' }, { status: 400 });
    }

    try {
        const token = await getAccessToken();
        const response = await fetch(
            `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&limit=20`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch artist albums from Spotify');
        }

        const data = await response.json();

        // Sort by release date descending and take top 6
        const sortedAlbums = data.items
            .sort((a: any, b: any) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
            .slice(0, 6);

        return NextResponse.json({ items: sortedAlbums });
    } catch (error: any) {
        console.error('Spotify API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
