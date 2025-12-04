import { NextResponse } from 'next/server';

import { getAccessToken } from '@/lib/spotify';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'album,artist';
  const limit = searchParams.get('limit') || '20';
  const offset = searchParams.get('offset') || '0';


  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }



  try {
    const token = await getAccessToken();

    // Pass the query directly to Spotify to search across all fields (album, artist, etc.)
    // We still restrict type to 'album' as we are searching for albums
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}&offset=${offset}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from Spotify');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Spotify API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
