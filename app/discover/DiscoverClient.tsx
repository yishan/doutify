/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SpotifyPlaylistResponse, SpotifyTrackItem } from '@/lib/spotify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FadeImage from '../components/FadeImage';

interface DiscoverClientProps {
    playlist: SpotifyPlaylistResponse | null;
    tracks: SpotifyTrackItem[];
    error: string;
}

const stripHtmlTags = (html: string): string => {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};

const formatDuration = (ms: number) => {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default function DiscoverClient({ playlist, tracks, error }: DiscoverClientProps) {
    const [filterQuery, setFilterQuery] = useState('');

    if (error) {
        return (
            <div className="min-h-screen bg-[#050505] text-[#e8e6e3] flex flex-col">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
                    <p className="text-red-400 text-base mb-5">{error}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center min-h-[40px] px-5 py-2 rounded-full border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white"
                    >
                        ← Back to Home
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const coverUrl = playlist?.images?.[0]?.url;
    const normalizedFilter = filterQuery.trim().toLowerCase();
    const indexedTracks = tracks
        .map((track, idx) => ({ track, position: idx + 1 }))
        .filter(({ track }) => {
            if (!track || !track.name) return false;
            if (!normalizedFilter) return true;
            const titleMatch = track.name.toLowerCase().includes(normalizedFilter);
            const albumMatch = (track.album?.name || '').toLowerCase().includes(normalizedFilter);
            const artistMatch = (track.artists ?? []).some((a) =>
                a.name.toLowerCase().includes(normalizedFilter)
            );
            return titleMatch || albumMatch || artistMatch;
        });

    return (
        <div className="min-h-screen bg-[#050505] text-[#e8e6e3] flex flex-col relative">
            <Header />

            {coverUrl && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-16 h-[420px] overflow-hidden"
                >
                    <img
                        src={coverUrl}
                        alt=""
                        className="w-full h-full object-cover blur-3xl opacity-20 scale-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/30 via-[#050505]/75 to-[#050505]" />
                </div>
            )}

            <main className="relative max-w-5xl mx-auto w-full flex-1 px-6 py-10 sm:py-14">
                {playlist && (
                    <div className="flex flex-col md:flex-row gap-8 mb-12 items-center md:items-end">
                        <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 rounded-2xl overflow-hidden bg-[#0e0e0e] ring-1 ring-inset ring-white/[0.12] shadow-2xl">
                            {coverUrl ? (
                                <FadeImage
                                    src={coverUrl}
                                    alt={playlist.name || 'Playlist cover'}
                                    width={224}
                                    height={224}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-[#8e8e8e]">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-3 text-center md:text-left">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[#1db954] font-mono">
                                Curated Playlist · {tracks.length} Tracks
                            </p>
                            <h1 className="font-serif text-4xl sm:text-6xl text-[#e8e6e3] tracking-tight leading-[1.05] text-balance">
                                {playlist.name}
                            </h1>
                            {playlist.description && (
                                <p className="text-[#a3a3a3] text-sm sm:text-base max-w-2xl leading-relaxed">
                                    {stripHtmlTags(playlist.description)}
                                </p>
                            )}
                            {playlist.external_urls?.spotify && (
                                <div className="pt-2">
                                    <a
                                        href={playlist.external_urls.spotify}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center min-h-[42px] bg-[#1db954] hover:bg-[#1ed760] text-[#050505] text-sm font-semibold py-2.5 px-6 rounded-full transition-all duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                    >
                                        Open in Spotify
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <label htmlFor="playlist-filter" className="sr-only">
                            Filter tracks, artists, or albums
                        </label>
                        <input
                            id="playlist-filter"
                            type="text"
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            placeholder="Filter tracks, artists, or albums…"
                            className="w-full rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 pr-9 text-sm text-[#e8e6e3] placeholder:text-[#8e8e8e] focus:border-white/[0.25] focus:outline-none transition-colors duration-150"
                        />
                        {filterQuery && (
                            <button
                                type="button"
                                onClick={() => setFilterQuery('')}
                                aria-label="Clear track filter"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8e8e8e] hover:text-[#e8e6e3] transition-colors duration-150 rounded-full focus-visible:outline-2 focus-visible:outline-white"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {normalizedFilter && (
                        <div className="text-xs font-mono text-[#8e8e8e] tabular-nums">
                            {indexedTracks.length} of {tracks.length} tracks
                        </div>
                    )}
                </div>

                <div className="border-t border-white/[0.08]">
                    <div className="hidden sm:grid grid-cols-[2.5rem_1fr_1fr_4.5rem] gap-4 px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-[#8e8e8e] font-mono border-b border-white/[0.08]">
                        <span className="text-right">#</span>
                        <span>Track</span>
                        <span>Album</span>
                        <span className="text-right">Time</span>
                    </div>

                    {indexedTracks.length === 0 ? (
                        <div className="py-12 text-center text-sm text-[#8e8e8e]">
                            <p className="mb-3">No tracks match &ldquo;{filterQuery.trim()}&rdquo;.</p>
                            <button
                                type="button"
                                onClick={() => setFilterQuery('')}
                                className="min-h-[38px] px-4 py-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-[#e8e6e3] text-xs font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white"
                            >
                                Clear filter
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/[0.06]">
                            {indexedTracks.map(({ track, position }) => {
                                const thumbUrl = track.album?.images?.[track.album.images.length - 1]?.url
                                    || track.album?.images?.[0]?.url;

                                return (
                                    <div
                                        key={track.id || position}
                                        className="grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[2.5rem_1fr_1fr_4.5rem] items-center gap-3 sm:gap-4 px-2 sm:px-3 py-3 hover:bg-white/[0.03] transition-colors duration-150 rounded-lg group"
                                    >
                                        <span className="text-right text-xs font-mono text-[#8e8e8e] tabular-nums">
                                            {position}
                                        </span>

                                        <div className="flex items-center gap-3 min-w-0">
                                            {thumbUrl ? (
                                                track.album?.id ? (
                                                    <Link
                                                        href={`/album/${track.album.id}`}
                                                        prefetch={false}
                                                        aria-label={`View album ${track.album.name || track.name}`}
                                                        className="w-10 h-10 rounded-md overflow-hidden bg-[#0e0e0e] ring-1 ring-inset ring-white/[0.08] shrink-0 focus-visible:outline-2 focus-visible:outline-white"
                                                    >
                                                        <FadeImage
                                                            src={thumbUrl}
                                                            alt={track.album?.name || track.name || ''}
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </Link>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-md overflow-hidden bg-[#0e0e0e] ring-1 ring-inset ring-white/[0.08] shrink-0">
                                                        <FadeImage
                                                            src={thumbUrl}
                                                            alt={track.album?.name || track.name || ''}
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )
                                            ) : (
                                                <div className="w-10 h-10 rounded-md bg-white/[0.04] shrink-0" />
                                            )}
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-[#e8e6e3] group-hover:text-white truncate">
                                                    {track.album?.id ? (
                                                        <Link
                                                            href={`/album/${track.album.id}`}
                                                            prefetch={false}
                                                            className="hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-white rounded"
                                                        >
                                                            {track.name}
                                                        </Link>
                                                    ) : (
                                                        track.name
                                                    )}
                                                </div>
                                                <div className="text-xs text-[#8e8e8e] truncate">
                                                    {(track.artists ?? []).map((a) => a.name).join(', ')}
                                                </div>
                                                {track.album?.id && track.album?.name && (
                                                    <Link
                                                        href={`/album/${track.album.id}`}
                                                        prefetch={false}
                                                        className="block sm:hidden text-xs text-[#a3a3a3] hover:text-[#e8e6e3] truncate mt-0.5 focus-visible:outline-2 focus-visible:outline-white rounded"
                                                    >
                                                        {track.album.name}
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        <div className="hidden sm:block min-w-0 text-sm text-[#a3a3a3] truncate">
                                            {track.album?.id ? (
                                                <Link
                                                    href={`/album/${track.album.id}`}
                                                    prefetch={false}
                                                    className="hover:text-[#e8e6e3] hover:underline underline-offset-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-white rounded"
                                                >
                                                    {track.album.name}
                                                </Link>
                                            ) : (
                                                track.album?.name || '—'
                                            )}
                                        </div>

                                        <div className="text-xs text-[#8e8e8e] font-mono text-right tabular-nums">
                                            {formatDuration(track.duration_ms || 0)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
