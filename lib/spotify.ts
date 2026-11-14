const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

let cachedToken: string | null = null;
let tokenExpiresAt = 0;
let inFlightTokenPromise: Promise<string> | null = null;

export interface SpotifyImage {
    url: string;
    height?: number | null;
    width?: number | null;
}

export interface SpotifyArtistSummary {
    id?: string;
    name: string;
}

export interface SpotifyAlbumSummary {
    id: string;
    name: string;
    album_type?: string;
    release_date?: string;
    total_tracks?: number;
    images?: SpotifyImage[];
    artists?: SpotifyArtistSummary[];
    genres?: string[];
    external_urls?: { spotify?: string };
}

export interface SpotifyTrackItem {
    id?: string;
    name?: string;
    duration_ms?: number;
    artists?: SpotifyArtistSummary[];
    album?: SpotifyAlbumSummary;
}

export interface SpotifyPlaylistEntry {
    item?: SpotifyTrackItem | null;
    track?: SpotifyTrackItem | null;
}

export interface SpotifyPlaylistResponse {
    id?: string;
    name?: string;
    description?: string;
    images?: SpotifyImage[];
    external_urls?: { spotify?: string };
    items?: { items?: SpotifyPlaylistEntry[] };
    tracks?: { items?: SpotifyPlaylistEntry[] };
}

export class SpotifyApiError extends Error {
    status: number;

    constructor(message: string, status = 500) {
        super(message);
        this.name = 'SpotifyApiError';
        this.status = status;
    }
}

export function invalidateAccessToken() {
    cachedToken = null;
    tokenExpiresAt = 0;
}

async function fetchNewAccessToken(): Promise<string> {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new SpotifyApiError('Missing Spotify Client ID or Secret', 500);
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
        cache: 'no-store',
    });

    if (!response.ok) {
        const text = await response.text();
        throw new SpotifyApiError(
            `Failed to fetch Spotify access token: ${response.status} ${text}`,
            response.status
        );
    }

    const data = (await response.json()) as { access_token: string; expires_in?: number };
    const expiresInSec = typeof data.expires_in === 'number' ? data.expires_in : 3600;
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + Math.max(0, expiresInSec * 1000 - TOKEN_REFRESH_BUFFER_MS);
    return data.access_token;
}

export async function getAccessToken(forceRefresh = false): Promise<string> {
    if (!forceRefresh && cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

    if (!inFlightTokenPromise) {
        inFlightTokenPromise = fetchNewAccessToken().finally(() => {
            inFlightTokenPromise = null;
        });
    }

    return inFlightTokenPromise;
}

export async function spotifyFetch<T = unknown>(
    pathOrUrl: string,
    init?: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } }
): Promise<T> {
    const url = pathOrUrl.startsWith('http')
        ? pathOrUrl
        : `${SPOTIFY_API_BASE}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;

    let token = await getAccessToken();
    let response = await fetch(url, {
        ...init,
        headers: {
            ...init?.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    // Retry once with a fresh token if the cached token was revoked or expired early
    if (response.status === 401) {
        invalidateAccessToken();
        token = await getAccessToken(true);
        response = await fetch(url, {
            ...init,
            headers: {
                ...init?.headers,
                Authorization: `Bearer ${token}`,
            },
        });
    }

    if (!response.ok) {
        const rawText = await response.text();
        let message = `${response.status} ${response.statusText}`;
        try {
            const parsed = JSON.parse(rawText) as { error?: { message?: string } };
            if (parsed?.error?.message) {
                message = parsed.error.message;
            }
        } catch {
            if (rawText) message = rawText;
        }
        throw new SpotifyApiError(`Spotify API error: ${message}`, response.status);
    }

    return response.json() as Promise<T>;
}

/**
 * Normalizes Spotify playlist track entries across legacy (`tracks.items[].track`)
 * and 2026 (`items.items[].item`) response schemas.
 */
export function extractPlaylistTracks(playlistData: SpotifyPlaylistResponse | null | undefined): SpotifyTrackItem[] {
    const rawEntries = playlistData?.items?.items ?? playlistData?.tracks?.items ?? [];
    if (!Array.isArray(rawEntries)) return [];

    return rawEntries
        .map((entry) => entry?.item ?? entry?.track ?? null)
        .filter((track): track is SpotifyTrackItem => Boolean(track && track.id));
}

export function getErrorResponse(error: unknown): { message: string; status: number } {
    if (error instanceof SpotifyApiError) {
        return { message: error.message, status: error.status };
    }
    if (error instanceof Error) {
        return { message: error.message, status: 500 };
    }
    return { message: 'Internal Server Error', status: 500 };
}
