import { getAccessToken } from '@/lib/spotify';
import DiscoverClient from './DiscoverClient';
import fs from 'fs/promises';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'app/discover/playlist_cache.json');
const CACHE_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export default async function DiscoverPage() {
    const playlistId = '5iwkYfnHAGMEFLiHFFGnP4';
    let playlist = null;
    let tracks: any[] = [];
    let error = '';

    try {
        let shouldUseCache = false;
        let cachedData = null;

        try {
            const fileContent = await fs.readFile(CACHE_FILE, 'utf-8');
            cachedData = JSON.parse(fileContent);
            if (Date.now() - cachedData.timestamp < CACHE_DURATION_MS) {
                shouldUseCache = true;
            }
        } catch (e) {
            // Cache miss or error reading file
        }

        if (shouldUseCache && cachedData) {
            console.log('Using cached playlist data');
            playlist = cachedData.data;
            tracks = cachedData.data.tracks.items;
        } else {
            console.log('Fetching fresh playlist data');
            const token = await getAccessToken();
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Failed to fetch playlist: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            playlist = data;
            tracks = data.tracks.items;

            // Save to cache (best-effort in case filesystem is read-only)
            try {
                await fs.writeFile(CACHE_FILE, JSON.stringify({
                    timestamp: Date.now(),
                    data: data
                }, null, 2));
            } catch (writeErr) {
                console.warn('Could not persist playlist cache:', writeErr);
            }
        }
    } catch (err: any) {
        console.error('Discover Page Error:', err);
        error = err.message || 'Failed to load playlist.';
    }

    return <DiscoverClient playlist={playlist} tracks={tracks} error={error} />;
}
