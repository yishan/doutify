import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/spotify';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Missing album ID' }, { status: 400 });
    }

    try {
        const token = await getAccessToken();
        const response = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch album details from Spotify');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Spotify API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
