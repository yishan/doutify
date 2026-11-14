import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import {
    extractPlaylistTracks,
    getErrorResponse,
    SpotifyAlbumSummary,
    spotifyFetch,
    SpotifyPlaylistResponse,
} from '@/lib/spotify';

const CACHE_PATH = path.join(process.cwd(), 'app/discover/playlist_cache.json');
const PLAYLIST_ID = '5iwkYfnHAGMEFLiHFFGnP4';
const DAILY_REVALIDATE_SECONDS = 86400; // 24 hours
const TAG_NEW_OFFSETS = [0, 10, 20, 30];
const MAX_RETURNED_ALBUMS = 16;

interface SearchAlbumsResponse {
    albums?: {
        items?: Array<SpotifyAlbumSummary | null>;
    };
}

function toTimestamp(dateStr?: string): number {
    if (!dateStr) return 0;
    const ts = new Date(dateStr).getTime();
    return Number.isFinite(ts) ? ts : 0;
}

function normalizeAlbumKey(album: SpotifyAlbumSummary): string {
    const title = (album.name || '').trim().toLowerCase();
    const artist = (album.artists?.[0]?.name || '').trim().toLowerCase();
    return `${title}::${artist}`;
}

function mergeUniqueAlbums(groups: SpotifyAlbumSummary[][], limit: number): SpotifyAlbumSummary[] {
    const seenIds = new Set<string>();
    const seenKeys = new Set<string>();
    const result: SpotifyAlbumSummary[] = [];

    for (const group of groups) {
        const sorted = [...group].sort(
            (a, b) => toTimestamp(b.release_date) - toTimestamp(a.release_date)
        );
        for (const album of sorted) {
            if (!album?.id || !album.name) continue;
            const key = normalizeAlbumKey(album);
            if (seenIds.has(album.id) || seenKeys.has(key)) continue;
            seenIds.add(album.id);
            seenKeys.add(key);
            result.push(album);
            if (result.length >= limit) return result;
        }
    }

    return result;
}

async function readCachedAlbums(): Promise<SpotifyAlbumSummary[]> {
    try {
        const fileContent = await fs.readFile(CACHE_PATH, 'utf-8');
        const cacheData = JSON.parse(fileContent) as { data?: SpotifyPlaylistResponse };
        const tracks = extractPlaylistTracks(cacheData?.data);
        return tracks
            .map((track) => track.album)
            .filter((album): album is SpotifyAlbumSummary => Boolean(album?.id));
    } catch (readError) {
        console.error('Error reading playlist cache:', readError);
        return [];
    }
}

export async function GET() {
    const searchPromises = TAG_NEW_OFFSETS.map((offset) =>
        spotifyFetch<SearchAlbumsResponse>(
            `/search?q=${encodeURIComponent('tag:new')}&type=album&limit=10&offset=${offset}`,
            { next: { revalidate: DAILY_REVALIDATE_SECONDS } }
        )
    );

    const playlistPromise = spotifyFetch<SpotifyPlaylistResponse>(
        `/playlists/${PLAYLIST_ID}`,
        { next: { revalidate: DAILY_REVALIDATE_SECONDS } }
    );

    const [searchResults, playlistResult] = await Promise.all([
        Promise.allSettled(searchPromises),
        Promise.allSettled([playlistPromise]),
    ]);

    const tagNewAlbums: SpotifyAlbumSummary[] = [];
    for (const res of searchResults) {
        if (res.status === 'fulfilled' && Array.isArray(res.value?.albums?.items)) {
            for (const item of res.value.albums.items) {
                if (item?.id) tagNewAlbums.push(item);
            }
        }
    }

    const livePlaylistAlbums: SpotifyAlbumSummary[] = [];
    const plOutcome = playlistResult[0];
    if (plOutcome?.status === 'fulfilled') {
        for (const track of extractPlaylistTracks(plOutcome.value)) {
            if (track.album?.id) {
                livePlaylistAlbums.push(track.album);
            }
        }
    } else if (plOutcome?.status === 'rejected') {
        console.warn('Live playlist fetch failed:', plOutcome.reason);
    }

    // Tier 1: Full-length albums from tag:new (released in the past ~2 weeks)
    const fullNewAlbums = tagNewAlbums.filter(
        (album) => album.album_type === 'album' && (album.total_tracks ?? 0) >= 4
    );
    // Tier 2: Full-length albums from live curated playlist
    const fullPlaylistAlbums = livePlaylistAlbums.filter(
        (album) => album.album_type === 'album'
    );
    // Tier 3: Recent multi-track EPs/releases from tag:new
    const multiTrackNewReleases = tagNewAlbums.filter(
        (album) => (album.total_tracks ?? 0) >= 3
    );
    // Tier 4: Remaining recent releases from live playlist & tag:new
    const combined = mergeUniqueAlbums(
        [
            fullNewAlbums,
            fullPlaylistAlbums,
            multiTrackNewReleases,
            livePlaylistAlbums,
            tagNewAlbums,
        ],
        MAX_RETURNED_ALBUMS
    );

    if (combined.length > 0) {
        return NextResponse.json(
            { albums: { items: combined } },
            {
                headers: {
                    'Cache-Control': `public, s-maxage=${DAILY_REVALIDATE_SECONDS}, stale-while-revalidate=3600`,
                },
            }
        );
    }

    // Fallback 1: Spotify browse/new-releases
    try {
        const data = await spotifyFetch<{ albums?: { items?: Array<SpotifyAlbumSummary | null> } }>(
            '/browse/new-releases?limit=10',
            { next: { revalidate: DAILY_REVALIDATE_SECONDS } }
        );
        const items = Array.isArray(data?.albums?.items)
            ? data.albums.items.filter((a): a is SpotifyAlbumSummary => Boolean(a?.id))
            : [];
        if (items.length > 0) {
            return NextResponse.json({ albums: { items } });
        }
    } catch (browseError) {
        console.warn('Fallback /browse/new-releases failed:', browseError);
    }

    // Fallback 2: Local playlist cache
    const cachedAlbums = await readCachedAlbums();
    if (cachedAlbums.length > 0) {
        return NextResponse.json({
            albums: { items: mergeUniqueAlbums([cachedAlbums], MAX_RETURNED_ALBUMS) },
        });
    }

    const { message, status } = getErrorResponse(new Error('No new releases available'));
    return NextResponse.json({ error: message }, { status });
}
