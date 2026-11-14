'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

import { useSearchParams } from 'next/navigation';
import Footer from '../../components/Footer';

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
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Ensure it's not visible but part of the DOM to avoid scrolling
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";

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
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const CopyButton = ({ text, label = "Copy", className = "" }: { text: string, label?: string, className?: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const success = await copyToClipboard(text);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? `${label} copied` : label}
            title={label}
            className={`relative inline-flex items-center justify-center text-gray-400 hover:text-white transition-colors transition-transform duration-150 active:scale-[0.96] before:absolute before:-inset-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded ${className}`}
        >
            {copied ? (
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )}
        </button>
    );
};

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const sourceQ = searchParams.get('source_q');
    const sourcePage = searchParams.get('source_page');

    const [album, setAlbum] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [discoveryAlbums, setDiscoveryAlbums] = useState<any[]>([]);
    const [loadingDiscovery, setLoadingDiscovery] = useState(true);

    const [copied, setCopied] = useState(false);

    const handleCopyTrackList = async () => {
        if (!album || !album.tracks || !album.tracks.items) return;

        const trackListText = album.tracks.items
            .map((track: any, index: number) => `${index + 1}. ${track.name}`)
            .join('\n');

        const success = await copyToClipboard(trackListText);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

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
                const data = await res.json();

                if (!res.ok || data.error) {
                    setError(data.error || 'Failed to load album details.');
                } else {
                    setAlbum(data);
                }
            } catch (err) {
                setError('Failed to load album details.');
            } finally {
                setLoading(false);
            }
        };

        fetchAlbum();
    }, [id]);

    useEffect(() => {
        const fetchDiscovery = async () => {
            if (!album || !album.artists || album.artists.length === 0) {
                setLoadingDiscovery(false);
                return;
            }

            setLoadingDiscovery(true);
            try {
                const artistId = album.artists[0].id;
                const res = await fetch(`/api/spotify/artist/${artistId}/albums`);
                const data = await res.json();

                if (res.ok && Array.isArray(data.items)) {
                    setDiscoveryAlbums(data.items.filter((item: any) => item && item.id !== id));
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
        ? `/?q=${sourceQ}&page=${sourcePage || 1}`
        : '/';

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8 font-sans flex flex-col gap-6">
                <div className="max-w-4xl mx-auto w-full animate-pulse">
                    <div className="flex justify-between items-center mb-8">
                        <div className="h-5 w-32 bg-gray-800 rounded" />
                        <div className="h-5 w-16 bg-gray-800 rounded" />
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 mb-12">
                        <div className="w-[300px] h-[300px] bg-gray-800 rounded-lg mx-auto md:mx-0 shrink-0" />
                        <div className="flex-1 flex flex-col justify-end space-y-4">
                            <div className="h-10 bg-gray-800 rounded w-3/4 mx-auto md:mx-0" />
                            <div className="h-6 bg-gray-800 rounded w-1/2 mx-auto md:mx-0" />
                            <div className="h-4 bg-gray-800 rounded w-1/3 mx-auto md:mx-0" />
                            <div className="h-4 bg-gray-800 rounded w-1/4 mx-auto md:mx-0" />
                            <div className="h-11 bg-gray-800 rounded-full w-44 mx-auto md:mx-0 mt-4" />
                        </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-6 space-y-3">
                        <div className="h-4 w-24 bg-gray-700 rounded mb-4" />
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-800 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !album) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
                <div className="text-red-400 text-xl mb-4">{error || 'Album not found'}</div>
                <Link href={backLink} className="inline-flex items-center min-h-[44px] text-green-400 hover:text-green-300 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded">
                    ← Back to Search
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans flex flex-col gap-6">
            <div className="max-w-4xl mx-auto w-full relative">
                <div className="flex justify-between items-center mb-8">
                    <Link href={backLink} className="inline-flex items-center min-h-[44px] text-gray-300 hover:text-white transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded">
                        ← Back to Search
                    </Link>
                    <Link href="/" className="inline-flex items-center min-h-[44px] text-gray-300 hover:text-white transition-colors duration-150 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded">
                        Home
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    <div className="relative w-[300px] h-[300px] flex-shrink-0 mx-auto md:mx-0 shadow-2xl group">
                        {album.images && album.images[0] ? (
                            <>
                                <img
                                    src={album.images[0].url}
                                    alt={album.name}
                                    width={300}
                                    height={300}
                                    className="object-cover rounded-lg -outline-offset-1 outline-1 outline-white/10"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    <button
                                        type="button"
                                        onClick={() => handleDownloadImage(album.images[0].url, `${album.name}-cover.jpg`)}
                                        className="min-h-[44px] bg-white/15 hover:bg-white/25 text-white border border-white/30 px-6 py-2 rounded-full transition-colors transition-transform duration-150 active:scale-[0.96] font-medium flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download Art
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                                No Cover
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-end text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-3xl md:text-5xl font-bold text-balance">
                                {album.name}
                            </h1>
                            <CopyButton text={album.name} label="Copy album title" />
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                            <p className="text-xl md:text-2xl text-gray-300">
                                {(album.artists ?? []).map((a: any, index: number) => (
                                    <span key={a.id || index}>
                                        <Link
                                            href={`/?q=${encodeURIComponent(a.name)}`}
                                            className="hover:text-white hover:underline transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
                                        >
                                            {a.name}
                                        </Link>
                                        {index < (album.artists ?? []).length - 1 && ', '}
                                    </span>
                                ))}
                            </p>
                            {album.artists?.length > 0 && (
                                <CopyButton text={album.artists.map((a: any) => a.name).join(', ')} label="Copy artists" />
                            )}
                        </div>
                        <div className="text-sm text-gray-300 space-y-1">
                            {album.album_type && (
                                <p>
                                    <span className="font-semibold text-gray-400">Type:</span> {album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1)}
                                </p>
                            )}
                            {album.label && (
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <span className="font-semibold text-gray-400">Label:</span>
                                    <span>{album.label}</span>
                                    <CopyButton text={album.label} label="Copy label" />
                                </div>
                            )}
                            {album.release_date && (
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <span className="font-semibold text-gray-400">Release Date:</span>
                                    <span className="tabular-nums">{album.release_date}</span>
                                    <CopyButton text={album.release_date} label="Copy release date" />
                                </div>
                            )}
                            {typeof album.popularity === 'number' && (
                                <p className="tabular-nums">
                                    <span className="font-semibold text-gray-400">Popularity:</span> {album.popularity}/100
                                </p>
                            )}
                            {album.genres && album.genres.length > 0 && (
                                <p>
                                    <span className="font-semibold text-gray-400">Genres:</span> {album.genres.join(', ')}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3 items-center justify-center md:justify-start">
                            {album.external_urls?.spotify && (
                                <a
                                    href={album.external_urls.spotify}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center min-h-[44px] px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-full transition-colors transition-transform duration-150 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.84-.6 13.561 1.621.42.3.539.84.24 1.2zm.119-3.3c-3.839-2.28-10.26-2.46-13.98-1.32-.6.181-1.2-.179-1.38-.779-.181-.6.179-1.2.779-1.38 4.32-1.32 11.34-1.08 15.72 1.56.6.36.84 1.02.479 1.62-.36.601-1.02.84-1.62.48z" />
                                    </svg>
                                    Open in Spotify
                                </a>
                            )}
                            {album.images && album.images[0] && (
                                <button
                                    type="button"
                                    onClick={() => handleDownloadImage(album.images[0].url, `${album.name}-cover.jpg`)}
                                    className="inline-flex items-center min-h-[44px] px-5 py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 font-medium rounded-full transition-colors transition-transform duration-150 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Art
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {album.external_ids && Object.keys(album.external_ids).length > 0 && (
                    <div className="bg-gray-800/30 rounded-xl p-6 mb-8">
                        <h3 className="font-semibold text-gray-400 mb-4 uppercase tracking-wider text-xs">External IDs</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(album.external_ids).map(([key, value]) => (
                                <div key={key}>
                                    <span className="font-mono text-gray-400 uppercase block text-xs mb-1">{key}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-gray-200 tabular-nums">{value as string}</span>
                                        <CopyButton text={value as string} label={`Copy ${key.toUpperCase()}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {album.external_urls?.spotify && (
                    <div className="bg-gray-800/30 rounded-xl p-6 mb-8">
                        <h3 className="font-semibold text-gray-400 mb-4 uppercase tracking-wider text-xs">Link</h3>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-gray-200 break-all">{album.external_urls.spotify}</span>
                            <CopyButton text={album.external_urls.spotify} label="Copy Spotify link" />
                        </div>
                    </div>
                )}

                <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="font-semibold text-gray-400 uppercase tracking-wider text-xs">Track List</h2>
                            <button
                                type="button"
                                onClick={handleCopyTrackList}
                                className={`relative text-xs px-3 py-1.5 rounded-full before:absolute before:-inset-2 transition-colors transition-transform duration-150 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${copied
                                    ? 'bg-green-500 text-black font-semibold'
                                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
                                    }`}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <p className="text-gray-300 text-sm tabular-nums">
                            {album.total_tracks ?? (album.tracks?.items?.length || 0)} songs • {formatTotalDuration((album.tracks?.items ?? []).reduce((acc: number, track: any) => acc + (track?.duration_ms || 0), 0))}
                        </p>
                    </div>
                    <div className="space-y-2">
                        {(album.tracks?.items ?? []).map((track: any, index: number) => (
                            <div
                                key={track.id || index}
                                className="flex items-center p-3 hover:bg-white/5 rounded-lg transition-colors duration-150 group"
                            >
                                <span className="w-8 text-gray-400 text-right mr-4 tabular-nums">{index + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-gray-200 group-hover:text-white">
                                        {track.name}
                                    </div>
                                    <div className="text-sm text-gray-400 truncate">
                                        {(track.artists ?? []).map((a: any) => a.name).join(', ')}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-400 ml-4 font-mono tabular-nums">
                                    {formatTrackDuration(track.duration_ms || 0)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 text-white text-balance">Discovery</h2>
                    {loadingDiscovery ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-gray-800/50 rounded-lg p-3 animate-pulse">
                                    <div className="aspect-square bg-gray-700 rounded-md mb-3"></div>
                                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : discoveryAlbums.length === 0 ? (
                        <p className="text-gray-400 text-sm">No related releases found for this artist.</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {discoveryAlbums.map((item: any) => (
                                <Link href={`/album/${item.id}`} key={item.id} className="group block bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors duration-150">
                                    <div className="relative aspect-square mb-3 overflow-hidden rounded-md">
                                        {item.images && item.images[0] ? (
                                            <img
                                                src={item.images[0].url}
                                                alt={item.name}
                                                className="object-cover w-full h-full -outline-offset-1 outline-1 outline-white/10 group-hover:scale-[1.02] transition-transform duration-150 ease-out motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                                                No Cover
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-medium text-sm text-gray-200 truncate group-hover:text-white mb-1" title={item.name}>
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 tabular-nums">
                                        {item.release_date ? item.release_date.split('-')[0] : ''}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
