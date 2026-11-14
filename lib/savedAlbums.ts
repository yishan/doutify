import type { SpotifyAlbumSummary } from './spotify';

const SAVED_ALBUMS_KEY = 'doutify_saved_albums';
const MAX_SAVED_ALBUMS = 20;

export function getSavedAlbums(): SpotifyAlbumSummary[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(SAVED_ALBUMS_KEY);
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

export function isAlbumSaved(id: string): boolean {
    return getSavedAlbums().some((item) => item.id === id);
}

export function toggleSavedAlbum(album: SpotifyAlbumSummary): {
    saved: boolean;
    items: SpotifyAlbumSummary[];
} {
    if (typeof window === 'undefined' || !album?.id || !album?.name) {
        return { saved: false, items: [] };
    }
    try {
        const current = getSavedAlbums();
        const exists = current.some((item) => item.id === album.id);
        let next: SpotifyAlbumSummary[];
        if (exists) {
            next = current.filter((item) => item.id !== album.id);
        } else {
            const summary: SpotifyAlbumSummary = {
                id: album.id,
                name: album.name,
                album_type: album.album_type,
                release_date: album.release_date,
                total_tracks: album.total_tracks,
                images: album.images?.slice(0, 2),
                artists: album.artists?.map((a) => ({ id: a.id, name: a.name })),
            };
            next = [summary, ...current].slice(0, MAX_SAVED_ALBUMS);
        }
        localStorage.setItem(SAVED_ALBUMS_KEY, JSON.stringify(next));
        return { saved: !exists, items: next };
    } catch {
        return { saved: false, items: [] };
    }
}

export function clearSavedAlbums(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(SAVED_ALBUMS_KEY);
    } catch {
        // Ignore storage errors
    }
}
