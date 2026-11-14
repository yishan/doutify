/* eslint-disable @next/next/no-img-element */
'use client';

import { Fragment, useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { SpotifyAlbumSummary, SpotifyTrackItem } from '@/lib/spotify';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FadeImage from '../../components/FadeImage';
import AlbumCard from '@/components/AlbumCard';

interface AlbumDetailData extends SpotifyAlbumSummary {
    label?: string;
    popularity?: number;
    release_date_precision?: string;
    copyrights?: Array<{ text?: string; type?: string }>;
    external_ids?: Record<string, string>;
    tracks?: {
        items?: SpotifyTrackItem[];
    };
}

const copyToClipboard = async (text: string): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn('Clipboard API failed, trying fallback...', err);
        }
    }

    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        console.error('Fallback copy failed', err);
        return false;
    }
};

const formatTrackDuration = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatTotalDuration = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
        return `${hours} hr ${minutes} min`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const QuickCopyChip = ({
    text,
    label,
    highlighted = false,
}: {
    text: string;
    label: string;
    highlighted?: boolean;
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const success = await copyToClipboard(text);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-white ${
                copied
                    ? 'border-[#1db954]/60 bg-[#1db954]/15 text-[#1db954]'
                    : highlighted
                      ? 'border-white/[0.2] bg-white/[0.06] hover:bg-white/[0.11] text-[#e8e6e3]'
                      : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.07] hover:border-white/[0.16] text-[#a3a3a3] hover:text-[#e8e6e3]'
            }`}
        >
            {copied ? `Copied ${label}` : `Copy ${label}`}
        </button>
    );
};

const TrackRow = ({
    track,
    fallbackNumber,
}: {
    track: SpotifyTrackItem;
    fallbackNumber: number;
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopyTrack = async () => {
        if (!track.name) return;
        const success = await copyToClipboard(track.name);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        }
    };

    const displayNumber = track.track_number ?? fallbackNumber;

    return (
        <div className="flex items-center gap-3 sm:gap-4 px-2 py-3.5 hover:bg-white/[0.03] transition-colors duration-150 group">
            <span className="w-7 text-right text-xs font-mono text-[#8e8e8e] tabular-nums shrink-0">
                {displayNumber}
            </span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-[#e8e6e3] group-hover:text-white truncate">
                        {track.name}
                    </span>
                    {track.explicit && (
                        <span
                            className="inline-flex items-center justify-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.08] text-[#a3a3a3] shrink-0"
                            title="Explicit"
                        >
                            E
                        </span>
                    )}
                </div>
                {(track.artists ?? []).length > 0 && (
                    <div className="text-xs text-[#8e8e8e] truncate mt-0.5">
                        {(track.artists ?? []).map((a) => a.name).join(', ')}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                {track.name && (
                    <button
                        type="button"
                        onClick={handleCopyTrack}
                        aria-label={`Copy track title ${track.name}`}
                        title={copied ? 'Copied title' : 'Copy track title'}
                        className={`p-1.5 rounded-full transition-all duration-150 focus-visible:outline-2 focus-visible:outline-white ${
                            copied
                                ? 'text-[#1db954] opacity-100'
                                : 'text-[#8e8e8e] hover:text-[#e8e6e3] opacity-60 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100'
                        }`}
                    >
                        {copied ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>
                )}
                {track.external_urls?.spotify && (
                    <a
                        href={track.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${track.name || 'track'} in Spotify`}
                        title="Open track in Spotify"
                        className="p-1.5 rounded-full text-[#8e8e8e] hover:text-[#1db954] opacity-60 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-white"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                )}
                <span className="w-11 text-right text-xs font-mono text-[#8e8e8e] tabular-nums">
                    {formatTrackDuration(track.duration_ms || 0)}
                </span>
            </div>
        </div>
    );
};

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const sourceQ = searchParams.get('source_q');
    const sourcePage = searchParams.get('source_page');

    const [album, setAlbum] = useState<AlbumDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [discoveryAlbums, setDiscoveryAlbums] = useState<SpotifyAlbumSummary[]>([]);
    const [loadingDiscovery, setLoadingDiscovery] = useState(true);
    const [showEmbed, setShowEmbed] = useState(false);

    const handleDownloadImage = async (imageUrl: string, fileName: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download image', err);
            window.open(imageUrl, '_blank');
        }
    };

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const res = await fetch(`/api/spotify/album/${id}`);
                const data = (await res.json()) as AlbumDetailData & { error?: string };

                if (!res.ok || data.error) {
                    setError(data.error || 'Failed to load album details.');
                } else {
                    setAlbum(data);
                }
            } catch {
                setError('Failed to load album details.');
            } finally {
                setLoading(false);
            }
        };

        fetchAlbum();
    }, [id]);

    useEffect(() => {
        const fetchDiscovery = async () => {
            const firstArtistId = album?.artists?.[0]?.id;
            if (!firstArtistId) {
                setLoadingDiscovery(false);
                return;
            }

            setLoadingDiscovery(true);
            try {
                const res = await fetch(`/api/spotify/artist/${firstArtistId}/albums`);
                const data = (await res.json()) as { items?: SpotifyAlbumSummary[] };

                if (res.ok && Array.isArray(data.items)) {
                    setDiscoveryAlbums(data.items.filter((item) => item && item.id !== id));
                }
            } catch (err) {
                console.error('Failed to fetch discovery albums', err);
            } finally {
                setLoadingDiscovery(false);
            }
        };

        if (album) {
            fetchDiscovery();
        }
    }, [album, id]);

    const backLink = sourceQ
        ? `/?q=${encodeURIComponent(sourceQ)}&page=${sourcePage || 1}`
        : '/';

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-[#e8e6e3] flex flex-col">
                <Header />
                <main className="max-w-5xl mx-auto w-full flex-1 px-6 py-10 sm:py-14 animate-pulse">
                    <div className="h-4 w-28 bg-white/[0.06] rounded mb-8" />
                    <div className="flex flex-col md:flex-row gap-8 mb-12">
                        <div className="w-[260px] h-[260px] bg-white/[0.05] rounded-2xl mx-auto md:mx-0 shrink-0" />
                        <div className="flex-1 flex flex-col justify-end space-y-4">
                            <div className="h-12 bg-white/[0.07] rounded w-3/4 mx-auto md:mx-0" />
                            <div className="h-6 bg-white/[0.05] rounded w-1/2 mx-auto md:mx-0" />
                            <div className="h-4 bg-white/[0.04] rounded w-1/3 mx-auto md:mx-0" />
                            <div className="h-10 bg-white/[0.08] rounded-full w-40 mx-auto md:mx-0 mt-2" />
                        </div>
                    </div>
                    <div className="space-y-3 border-t border-white/[0.08] pt-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-11 bg-white/[0.03] rounded-lg" />
                        ))}
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !album) {
        return (
            <div className="min-h-screen bg-[#050505] text-[#e8e6e3] flex flex-col">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
                    <div className="text-red-400 text-base mb-5">{error || 'Album not found'}</div>
                    <Link
                        href={backLink}
                        className="inline-flex items-center min-h-[40px] px-5 py-2 rounded-full border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white"
                    >
                        ← Back to Search
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const coverUrl = album.images?.[0]?.url;
    const trackItems = album.tracks?.items ?? [];
    const totalDurationMs = trackItems.reduce((acc, track) => acc + (track?.duration_ms || 0), 0);
    const artistNames = (album.artists ?? []).map((a) => a.name).join(', ');
    const trackListText = trackItems
        .map((track, index) => `${track.track_number ?? index + 1}. ${track.name || ''}`)
        .join('\n');
    const upc = album.external_ids?.upc || album.external_ids?.ean || '';
    const primaryArtistName = album.artists?.[0]?.name;
    const hasMultipleDiscs = trackItems.some((track) => (track.disc_number ?? 1) > 1);
    const copyrightLines = Array.from(
        new Set(
            (album.copyrights ?? [])
                .map((c) => c?.text?.trim())
                .filter((text): text is string => Boolean(text))
        )
    );

    const allInfoText = [
        `Title: ${album.name}`,
        artistNames ? `Artist: ${artistNames}` : null,
        album.album_type ? `Type: ${album.album_type}` : null,
        album.release_date ? `Release Date: ${album.release_date}` : null,
        album.label ? `Label: ${album.label}` : null,
        upc ? `Barcode/UPC: ${upc}` : null,
        trackListText ? `Tracklist:\n${trackListText}` : null,
    ]
        .filter(Boolean)
        .join('\n');

    const metaParts = [
        album.album_type ? album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1) : null,
        album.release_date || null,
        `${album.total_tracks ?? trackItems.length} ${(album.total_tracks ?? trackItems.length) === 1 ? 'track' : 'tracks'}`,
        totalDurationMs > 0 ? formatTotalDuration(totalDurationMs) : null,
        album.label || null,
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-[#050505] text-[#e8e6e3] flex flex-col relative">
            <Header />

            {coverUrl && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-16 h-[460px] overflow-hidden"
                >
                    <img
                        src={coverUrl}
                        alt=""
                        className="w-full h-full object-cover blur-3xl opacity-25 scale-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/25 via-[#050505]/75 to-[#050505]" />
                </div>
            )}

            <main className="relative max-w-5xl mx-auto w-full flex-1 px-6 py-8 sm:py-12">
                <div className="mb-8">
                    <Link
                        href={backLink}
                        className="inline-flex items-center gap-1.5 text-sm text-[#8e8e8e] hover:text-[#e8e6e3] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white rounded"
                    >
                        ← {sourceQ ? 'Back to results' : 'Back to Discover'}
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-8 md:gap-10 mb-10 items-center md:items-end">
                    <div className="relative w-[240px] h-[240px] sm:w-[270px] sm:h-[270px] shrink-0 rounded-2xl overflow-hidden bg-[#0e0e0e] ring-1 ring-inset ring-white/[0.12] shadow-2xl group">
                        {coverUrl ? (
                            <>
                                <FadeImage
                                    src={coverUrl}
                                    alt={album.name}
                                    width={270}
                                    height={270}
                                    loading="eager"
                                    className="object-cover w-full h-full"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-sm">
                                    <button
                                        type="button"
                                        onClick={() => handleDownloadImage(coverUrl, `${album.name}-cover.jpg`)}
                                        className="min-h-[40px] bg-white/15 hover:bg-white/25 text-white border border-white/25 px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download Cover
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-[#8e8e8e]">
                                No Cover
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 text-center md:text-left">
                        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#e8e6e3] tracking-tight leading-[1.06] text-balance mb-3">
                            {album.name}
                        </h1>

                        <p className="text-lg sm:text-xl text-[#a3a3a3] mb-3">
                            {(album.artists ?? []).map((a, index) => (
                                <span key={a.id || index}>
                                    <Link
                                        href={`/?q=${encodeURIComponent(a.name)}`}
                                        className="hover:text-white hover:underline underline-offset-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-white rounded"
                                    >
                                        {a.name}
                                    </Link>
                                    {index < (album.artists ?? []).length - 1 && ', '}
                                </span>
                            ))}
                        </p>

                        <p className="text-xs sm:text-sm text-[#8e8e8e] tabular-nums mb-6">
                            {metaParts.join(' · ')}
                        </p>

                        <div className="flex flex-wrap gap-2.5 items-center justify-center md:justify-start">
                            {album.external_urls?.spotify && (
                                <a
                                    href={album.external_urls.spotify}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center min-h-[42px] px-5 py-2.5 bg-[#1db954] hover:bg-[#1ed760] text-[#050505] text-sm font-semibold rounded-full transition-all duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.84-.6 13.561 1.621.42.3.539.84.24 1.2zm.119-3.3c-3.839-2.28-10.26-2.46-13.98-1.32-.6.181-1.2-.179-1.38-.779-.181-.6.179-1.2.779-1.38 4.32-1.32 11.34-1.08 15.72 1.56.6.36.84 1.02.479 1.62-.36.601-1.02.84-1.62.48z" />
                                    </svg>
                                    Open in Spotify
                                </a>
                            )}

                            <button
                                type="button"
                                onClick={() => setShowEmbed((prev) => !prev)}
                                className="inline-flex items-center min-h-[42px] px-4 py-2.5 rounded-full border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.08] text-sm text-[#e8e6e3] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white"
                            >
                                {showEmbed ? 'Hide Preview' : 'Preview'}
                            </button>

                            {coverUrl && (
                                <button
                                    type="button"
                                    onClick={() => handleDownloadImage(coverUrl, `${album.name}-cover.jpg`)}
                                    className="inline-flex items-center min-h-[42px] px-4 py-2.5 rounded-full border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.08] text-sm text-[#a3a3a3] hover:text-[#e8e6e3] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white"
                                >
                                    Download Art
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {showEmbed && (
                    <div className="mb-10 rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0e0e0e]">
                        <iframe
                            title={`Spotify player for ${album.name}`}
                            src={`https://open.spotify.com/embed/album/${encodeURIComponent(album.id)}?utm_source=generator&theme=0`}
                            width="100%"
                            height="152"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="border-0"
                        />
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b border-white/[0.08]">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#8e8e8e] font-mono mr-1">
                        Quick Copy
                    </span>
                    <QuickCopyChip text={allInfoText} label="All Info" highlighted />
                    <QuickCopyChip text={album.name} label="Title" />
                    {artistNames && <QuickCopyChip text={artistNames} label="Artist" />}
                    {album.release_date && <QuickCopyChip text={album.release_date} label="Date" />}
                    {album.label && <QuickCopyChip text={album.label} label="Label" />}
                    {upc && <QuickCopyChip text={upc} label="UPC" />}
                    {trackListText && <QuickCopyChip text={trackListText} label="Tracklist" />}
                    {album.external_urls?.spotify && (
                        <QuickCopyChip text={album.external_urls.spotify} label="Link" />
                    )}
                </div>

                <section className="mb-14">
                    <div className="flex items-baseline justify-between mb-4">
                        <h2 className="text-xs uppercase tracking-[0.16em] text-[#8e8e8e] font-mono">
                            Tracklist
                        </h2>
                        <span className="text-xs text-[#8e8e8e] font-mono tabular-nums">
                            {trackItems.length} tracks
                        </span>
                    </div>

                    <div className="divide-y divide-white/[0.06] border-t border-b border-white/[0.08]">
                        {trackItems.map((track, index) => {
                            const discNumber = track.disc_number ?? 1;
                            const prevDiscNumber = index > 0 ? (trackItems[index - 1]?.disc_number ?? 1) : discNumber;
                            const showDiscHeader = hasMultipleDiscs && (index === 0 || discNumber !== prevDiscNumber);

                            return (
                                <Fragment key={track.id || index}>
                                    {showDiscHeader && (
                                        <div className="px-2 pt-4 pb-2 text-[11px] uppercase tracking-[0.16em] text-[#8e8e8e] font-mono bg-white/[0.015]">
                                            Disc {discNumber}
                                        </div>
                                    )}
                                    <TrackRow track={track} fallbackNumber={index + 1} />
                                </Fragment>
                            );
                        })}
                    </div>

                    {(album.label || upc || copyrightLines.length > 0) && (
                        <div className="mt-4 text-xs text-[#8e8e8e] font-mono space-y-1">
                            {album.label && <div>Label: {album.label}</div>}
                            {upc && <div>UPC/EAN: {upc}</div>}
                            {copyrightLines.map((line) => (
                                <div key={line}>{line}</div>
                            ))}
                        </div>
                    )}
                </section>

                {(loadingDiscovery || discoveryAlbums.length > 0) && (
                    <section>
                        <div className="flex items-baseline justify-between mb-6">
                            <h2 className="font-serif text-3xl text-[#e8e6e3] tracking-tight">
                                {primaryArtistName ? `More by ${primaryArtistName}` : 'More Releases'}
                            </h2>
                            {primaryArtistName && (
                                <Link
                                    href={`/?q=${encodeURIComponent(primaryArtistName)}`}
                                    className="text-sm text-[#8e8e8e] hover:text-[#1db954] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white rounded"
                                >
                                    Search all →
                                </Link>
                            )}
                        </div>

                        {loadingDiscovery ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="aspect-square rounded-xl bg-white/[0.05]" />
                                        <div className="pt-3 space-y-2">
                                            <div className="h-3.5 bg-white/[0.06] rounded w-3/4" />
                                            <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
                                {discoveryAlbums.map((item) => (
                                    <AlbumCard key={item.id} album={item} />
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
}
