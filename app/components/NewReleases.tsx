'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { SpotifyAlbumSummary } from '@/lib/spotify';

export default function NewReleases() {
    const [albums, setAlbums] = useState<SpotifyAlbumSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchNewReleases = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch('/api/spotify/new-releases');
            if (!res.ok) throw new Error('Failed to fetch new releases');
            const data = await res.json();
            if (data.albums && data.albums.items) {
                setAlbums(data.albums.items);
            } else {
                setAlbums([]);
            }
        } catch (err) {
            console.error('Failed to fetch new releases:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNewReleases();
    }, []);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto mb-0">
                <h2 className="text-2xl font-bold mb-4 mt-12 text-white text-balance">Discover</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                            <div className="aspect-square bg-gray-700" />
                            <div className="p-3 space-y-2">
                                <div className="h-4 bg-gray-700 rounded w-3/4" />
                                <div className="h-3.5 bg-gray-700 rounded w-1/2" />
                                <div className="h-3 bg-gray-700 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || albums.length === 0) {
        return (
            <div className="max-w-3xl mx-auto mb-0">
                <h2 className="text-2xl font-bold mb-4 mt-12 text-white text-balance">Discover</h2>
                <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-300">
                    <p className="mb-3">{error ? 'Could not load new releases right now.' : 'No new releases available at the moment.'}</p>
                    <button
                        type="button"
                        onClick={fetchNewReleases}
                        className="min-h-[44px] px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto mb-0">
            <div className="flex items-baseline justify-between mb-4 mt-12">
                <h2 className="text-2xl font-bold text-white text-balance">Discover</h2>
                <Link
                    href="/new"
                    className="text-sm text-gray-300 hover:text-green-400 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
                >
                    View all →
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {albums.slice(0, 8).map((album) => (
                    <div key={album.id} className="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700/80 focus-within:ring-2 focus-within:ring-white/80 transition-colors duration-150 flex flex-col">
                        <Link
                            href={`/album/${album.id}`}
                            className="absolute inset-0 z-0 focus:outline-none"
                        >
                            <span className="sr-only">View details for {album.name}</span>
                        </Link>
                        <div className="relative aspect-square pointer-events-none">
                            {album.images && album.images.length > 0 ? (
                                <img
                                    src={album.images[0].url}
                                    alt={`Cover art for ${album.name}`}
                                    className="object-cover w-full h-full -outline-offset-1 outline-1 outline-white/10 transition-transform duration-150 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
                                    No Cover
                                </div>
                            )}
                        </div>
                        <div className="p-3 flex-1 flex flex-col pointer-events-none">
                            <h3 className="font-bold text-md truncate" title={album.name}>{album.name}</h3>
                            <p className="text-gray-300 text-sm truncate">{(album.artists ?? []).map((a) => a.name).join(', ')}</p>
                            <p className="text-xs text-gray-400 mt-1 tabular-nums">
                                {[
                                    album.album_type ? album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1) : null,
                                    album.release_date || null,
                                ].filter(Boolean).join(' • ')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
