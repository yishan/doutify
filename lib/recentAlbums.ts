import type { SpotifyAlbumSummary } from './spotify';

const RECENT_ALBUMS_KEY = 'doutify_recent_albums';
const MAX_RECENT_ALBUMS = 5;

export function getRecentAlbums(): SpotifyAlbumSummary[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(RECENT_ALBUMS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (item): item is SpotifyAlbumSummary =>
                Boolean(item && typeof item === 'object' && 'id' in item && 'name' in item)
        );
    } catch {
        return [];
    }
}

export function saveRecentAlbum(album: SpotifyAlbumSummary): void {
    if (typeof window === 'undefined' || !album?.id || !album?.name) return;
    try {
        const summary: SpotifyAlbumSummary = {
            id: album.id,
            name: album.name,
            album_type: album.album_type,
            release_date: album.release_date,
            total_tracks: album.total_tracks,
            images: album.images?.slice(0, 2),
            artists: album.artists?.map((a) => ({ id: a.id, name: a.name })),
        };
        const current = getRecentAlbums();
        const next = [summary, ...current.filter((item) => item.id !== summary.id)].slice(
            0,
            MAX_RECENT_ALBUMS
        );
        localStorage.setItem(RECENT_ALBUMS_KEY, JSON.stringify(next));
    } catch {
        // Ignore storage errors
    }
}

export function clearRecentAlbums(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(RECENT_ALBUMS_KEY);
    } catch {
        // Ignore storage errors
    }
}
