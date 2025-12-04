import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/spotify';

export async function GET() {
    try {
        const token = await getAccessToken();

        const response = await fetch('https://api.spotify.com/v1/browse/new-releases', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error('Spotify API Error Response:', await response.text());
            throw new Error('Failed to fetch data from Spotify');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Spotify API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
