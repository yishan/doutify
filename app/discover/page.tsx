import {
    extractPlaylistTracks,
    spotifyFetch,
    SpotifyPlaylistResponse,
    SpotifyTrackItem,
} from '@/lib/spotify';
import DiscoverClient from './DiscoverClient';
import fs from 'fs/promises';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'app/discover/playlist_cache.json');
const CACHE_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
const PLAYLIST_ID = '5iwkYfnHAGMEFLiHFFGnP4';

export const dynamic = 'force-dynamic';

async function loadDiscoverPlaylist(): Promise<{
    playlist: SpotifyPlaylistResponse | null;
    tracks: SpotifyTrackItem[];
    error: string;
}> {
    let cachedData: { timestamp?: number; data?: SpotifyPlaylistResponse } | null = null;
    try {
        const fileContent = await fs.readFile(CACHE_FILE, 'utf-8');
        cachedData = JSON.parse(fileContent) as { timestamp?: number; data?: SpotifyPlaylistResponse };
    } catch {
        // Ignore missing/invalid local cache file
    }

    const isCacheFresh =
        Boolean(cachedData?.data) &&
        typeof cachedData?.timestamp === 'number' &&
        Date.now() - cachedData.timestamp < CACHE_DURATION_MS;

    if (isCacheFresh && cachedData?.data) {
        return {
            playlist: cachedData.data,
            tracks: extractPlaylistTracks(cachedData.data),
            error: '',
        };
    }

    try {
        const data = await spotifyFetch<SpotifyPlaylistResponse>(`/playlists/${PLAYLIST_ID}`, {
            next: { revalidate: 86400 },
        });

        // Best-effort local cache update (skipped on read-only serverless filesystems)
        try {
            await fs.writeFile(
                CACHE_FILE,
                JSON.stringify({ timestamp: Date.now(), data }, null, 2)
            );
        } catch {
            // Expected on read-only filesystems like Vercel
        }

        return {
            playlist: data,
            tracks: extractPlaylistTracks(data),
            error: '',
        };
    } catch (err: unknown) {
        console.error('Discover Page Error:', err);
        // Fall back to stale local cache if Spotify rejects or restricts the request
        if (cachedData?.data) {
            return {
                playlist: cachedData.data,
                tracks: extractPlaylistTracks(cachedData.data),
                error: '',
            };
        }
        return {
            playlist: null,
            tracks: [],
            error: err instanceof Error ? err.message : 'Failed to load playlist.',
        };
    }
}

export default async function DiscoverPage() {
    const { playlist, tracks, error } = await loadDiscoverPlaylist();
    return <DiscoverClient playlist={playlist} tracks={tracks} error={error} />;
}
