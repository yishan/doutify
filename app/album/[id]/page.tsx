'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

import { useSearchParams } from 'next/navigation';
import Footer from '../../components/Footer';

const CopyButton = ({ text, className = "" }: { text: string, className?: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className={`inline-flex items-center justify-center text-gray-500 hover:text-white transition-colors ${className}`}
            title="Copy"
        >
            <div className={`transition-all duration-300 transform ${copied ? 'scale-100 rotate-0' : 'scale-100 rotate-0'}`}>
                {copied ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                )}
            </div>
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

    const handleCopyTrackList = () => {
        if (!album || !album.tracks || !album.tracks.items) return;

        const trackListText = album.tracks.items
            .map((track: any, index: number) => `${index + 1}. ${track.name}`)
            .join('\n');

        navigator.clipboard.writeText(trackListText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const res = await fetch(`/api/spotify/album/${id}`);
                const data = await res.json();

                if (data.error) {
                    setError(data.error);
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
            if (!album || !album.artists || album.artists.length === 0) return;

            setLoadingDiscovery(true);
            try {
                const artistId = album.artists[0].id;
                const res = await fetch(`/api/spotify/artist/${artistId}/albums`);
                const data = await res.json();

                if (data.items) {
                    setDiscoveryAlbums(data.items);
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
    }, [album]);

    const backLink = sourceQ
        ? `/?q=${sourceQ}&page=${sourcePage || 1}`
        : '/';

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-2xl font-bold text-green-500">Loading...</div>
            </div>
        );
    }

    if (error || !album) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
                <div className="text-red-400 text-xl mb-4">{error || 'Album not found'}</div>
                <Link href={backLink} className="text-green-500 hover:text-green-400 font-bold">
                    ← Back to Search
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans flex flex-col gap-6">
            <div className="max-w-4xl mx-auto relative">
                <div className="flex justify-between items-center mb-8">
                    <Link href={backLink} className="text-gray-400 hover:text-white transition-colors">
                        ← Back to Search
                    </Link>
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors font-bold">
                        Home
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    <div className="relative w-[300px] h-[300px] flex-shrink-0 mx-auto md:mx-0 shadow-2xl">
                        {album.images && album.images[0] ? (
                            <img
                                src={album.images[0].url}
                                alt={album.name}
                                width={300}
                                height={300}
                                className="object-cover rounded-lg"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                                No Cover
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-end text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-3xl md:text-5xl font-bold">
                                {album.name}
                            </h1>
                            <CopyButton text={album.name} />
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                            <p className="text-xl md:text-2xl text-gray-300">
                                {album.artists.map((a: any) => a.name).join(', ')}
                            </p>
                            <CopyButton text={album.artists.map((a: any) => a.name).join(', ')} />
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                            <p>
                                <span className="font-semibold text-gray-500">Type:</span> {album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1)}
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <span className="font-semibold text-gray-500">Label:</span>
                                <span>{album.label}</span>
                                <CopyButton text={album.label} />
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <span className="font-semibold text-gray-500">Release Date:</span>
                                <span>{album.release_date}</span>
                                <CopyButton text={album.release_date} />
                            </div>
                            <p>
                                <span className="font-semibold text-gray-500">Popularity:</span> {album.popularity}/100
                            </p>
                            {album.genres && album.genres.length > 0 && (
                                <p>
                                    <span className="font-semibold text-gray-500">Genres:</span> {album.genres.join(', ')}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col md:flex-row gap-4 items-center md:items-start">
                            <a
                                href={album.external_urls.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.84-.6 13.561 1.621.42.3.539.84.24 1.2zm.119-3.3c-3.839-2.28-10.26-2.46-13.98-1.32-.6.181-1.2-.179-1.38-.779-.181-.6.179-1.2.779-1.38 4.32-1.32 11.34-1.08 15.72 1.56.6.36.84 1.02.479 1.62-.36.601-1.02.84-1.62.48z" />
                                </svg>
                                Open in Spotify
                            </a>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="font-semibold text-gray-500 uppercase tracking-wider text-xs">Track List</h2>
                            <button
                                onClick={handleCopyTrackList}
                                className={`text-xs px-3 py-1 rounded-full transition-all duration-300 ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                                    }`}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <p className="text-gray-400 text-sm">
                            {album.total_tracks} songs • {new Date(album.tracks.items.reduce((acc: number, track: any) => acc + track.duration_ms, 0)).toISOString().substr(11, 8)}
                        </p>
                    </div>
                    <div className="space-y-2">
                        {album.tracks.items.map((track: any, index: number) => (
                            <div
                                key={track.id}
                                className="flex items-center p-3 hover:bg-white/5 rounded-lg transition-colors group"
                            >
                                <span className="w-8 text-gray-500 text-right mr-4">{index + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-gray-200 group-hover:text-white">
                                        {track.name}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                        {track.artists.map((a: any) => a.name).join(', ')}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500 ml-4 font-mono">
                                    {new Date(track.duration_ms).toISOString().substr(14, 5)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {album.external_ids && Object.keys(album.external_ids).length > 0 && (
                    <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm mb-8">
                        <h3 className="font-semibold text-gray-500 mb-4 uppercase tracking-wider text-xs">External IDs</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(album.external_ids).map(([key, value]) => (
                                <div key={key}>
                                    <span className="font-mono text-gray-500 uppercase block text-xs mb-1">{key}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-gray-300">{value as string}</span>
                                        <CopyButton text={value as string} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm mb-8">
                    <h3 className="font-semibold text-gray-500 mb-4 uppercase tracking-wider text-xs">Link</h3>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-300 break-all">{album.external_urls.spotify}</span>
                        <CopyButton text={album.external_urls.spotify} />
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 text-white">Discovery</h2>
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
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {discoveryAlbums.map((item: any) => (
                                <Link href={`/album/${item.id}`} key={item.id} className="group block bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors">
                                    <div className="relative aspect-square mb-3 overflow-hidden rounded-md">
                                        {item.images && item.images[0] ? (
                                            <img
                                                src={item.images[0].url}
                                                alt={item.name}
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500 text-xs">
                                                No Cover
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-medium text-sm text-gray-200 truncate group-hover:text-white mb-1" title={item.name}>
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {item.release_date.split('-')[0]}
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
