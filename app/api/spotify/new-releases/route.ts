import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/spotify';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const token = await getAccessToken();
        let albumIds: string[] = [];

        // 1. Try to read from playlist_cache.json
        try {
            const cachePath = path.join(process.cwd(), 'app/discover/playlist_cache.json');
            if (fs.existsSync(cachePath)) {
                const fileContent = fs.readFileSync(cachePath, 'utf-8');
                const cacheData = JSON.parse(fileContent);

                if (cacheData.data && cacheData.data.tracks && cacheData.data.tracks.items) {
                    // Extract unique album IDs
                    const allAlbumIds = new Set<string>();
                    cacheData.data.tracks.items.forEach((item: any) => {
                        if (item.track && item.track.album && item.track.album.id) {
                            allAlbumIds.add(item.track.album.id);
                        }
                    });

                    // Convert to array
                    const uniqueIds = Array.from(allAlbumIds);

                    // Randomly select up to 6 IDs
                    const shuffled = uniqueIds.sort(() => 0.5 - Math.random());
                    albumIds = shuffled.slice(0, 6);
                }
            }
        } catch (readError) {
            console.error('Error reading playlist cache:', readError);
            // Fallback to empty array, will trigger default behavior below if empty
        }

        // 2. Fetch album details if we have IDs
        if (albumIds.length > 0) {
            const idsParam = albumIds.join(',');
            const response = await fetch(`https://api.spotify.com/v1/albums?ids=${idsParam}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error('Spotify API Error Response (Albums):', await response.text());
                throw new Error('Failed to fetch albums from Spotify');
            }

            const data = await response.json();
            // Wrap in the structure expected by the frontend (similar to new-releases response)
            return NextResponse.json({ albums: { items: data.albums } });
        }

        // 3. Fallback: Default new-releases behavior if no IDs found or cache missing
        console.log('Fallback to standard new-releases');
        const response = await fetch('https://api.spotify.com/v1/browse/new-releases', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error('Spotify API Error Response (New Releases):', await response.text());
            throw new Error('Failed to fetch data from Spotify');
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Spotify API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
